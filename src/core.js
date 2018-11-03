const _ = require("lodash/fp");

const NONE = Symbol("NONE");
module.exports.NONE = NONE;

module.exports.ALL = {
  select: next => _.flatMap(next),
  transform: next =>
    _.reduce((acc, v) => {
      const result = next(v);
      return result === NONE ? acc : _.concat(acc, [result]);
    }, [])
};

module.exports.MAP_VALS = {
  select: next => struct => _.flatMap(next, _.values(struct)),
  transform: next => struct =>
    _.isPlainObject(struct) ? _.mapValues(next, struct) : _.map(next, struct)
};

module.exports.FIRST = {
  select: next => struct => (_.isEmpty(struct) ? [] : next(_.head(struct))),
  transform: next => struct => {
    if (_.isEmpty(struct)) {
      return struct;
    }
    const result = next(_.get(0, struct));
    return result === NONE ? _.pullAt(0, struct) : _.set(0, result, struct);
  }
};

module.exports.LAST = {
  select: next => struct => (_.isEmpty(struct) ? [] : next(_.last(struct))),
  transform: next => struct => {
    if (_.isEmpty(struct)) {
      return struct;
    }
    const idx = struct.length - 1;
    const result = next(_.get(idx, struct));
    return result === NONE ? _.pullAt(idx, struct) : _.set(idx, result, struct);
  }
};

module.exports.key = key => ({
  select: next => struct => next(_.get(key, struct)),
  transform: next => struct => {
    const result = next(_.get(key, struct));
    return result === NONE ? _.omit(key, struct) : _.set(key, result, struct);
  }
});

module.exports.pred = pred => ({
  select: next => struct => (pred(struct) ? next(struct) : []),
  transform: next => struct => (pred(struct) ? next(struct) : struct)
});

const compile = _.cond([
  [_.isString, module.exports.key],
  [_.isFunction, module.exports.pred],
  [_.stubTrue, _.identity]
]);

module.exports.select = (path, struct) =>
  _.reduceRight((nav, next) => compile(nav).select(next), v => [v], path)(
    struct
  );

module.exports.transform = (path, update, struct) =>
  _.reduceRight((nav, next) => compile(nav).transform(next), update, path)(
    struct
  );

module.exports = module.exports;
