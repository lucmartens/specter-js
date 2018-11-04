const _ = require("lodash/fp");

_.mixin({
  cons: (a, b) => _.concat([a], b),
  conj: (b, a) => _.concat(b, [a])
});

const NONE = Symbol("NONE");
module.exports.NONE = NONE;

module.exports.ALL = {
  select: next => _.flatMap(next),
  transform: next =>
    _.reduce((acc, v) => {
      const result = next(v);
      return result === NONE ? acc : _.conj(acc, result);
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

module.exports.BEGINNING = {
  select: next => struct => [],
  transform: next => struct => {
    const result = next([]);
    return _.isArray(struct) ? _.concat(result, struct) : result;
  }
};

module.exports.END = {
  select: next => struct => [],
  transform: next => struct => {
    const result = next([]);
    return _.isArray(struct) ? _.concat(struct, result) : result;
  }
};

module.exports.BEFORE_ELEMENT = {
  select: next => struct => NONE,
  transform: next => struct => {
    const result = next(NONE);
    return result === NONE ? struct : _.cons(result, struct);
  }
};

module.exports.AFTER_ELEMENT = {
  select: next => struct => NONE,
  transform: next => struct => {
    const result = next(NONE);
    return result === NONE ? struct : _.conj(struct, result);
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

module.exports.parser = (parse, unparse) => ({
  select: next => struct => next(parse(struct)),
  transform: next => struct => unparse(next(parse(struct)))
});

module.exports.submap = keys => ({
  select: next => struct => next(_.pick(keys, struct)),
  transform: next => struct => _.merge(struct, next(_.pick(keys, struct)))
});

const compileNavigator = _.cond([
  [_.isString, module.exports.key],
  [_.isNumber, module.exports.key],
  [_.isFunction, module.exports.pred],
  [_.stubTrue, _.identity]
]);

const compilePath = (path, operator, initial) =>
  _.reduceRight(
    (navigator, next) => compileNavigator(navigator)[operator](next),
    initial,
    path
  );

module.exports.select = (path, struct) =>
  compilePath(path, "select", v => [v])(struct);

module.exports.selectOne = (path, struct) =>
  compilePath(path, "select", _.identity)(struct);

module.exports.transform = (path, update, struct) =>
  compilePath(path, "transform", update)(struct);

module.exports.setval = (path, value, struct) =>
  compilePath(path, "transform", _.constant(value))(struct);

module.exports = module.exports;
