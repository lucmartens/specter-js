const _ = require("./util");

module.exports.ALL = {
  select: next => _.flatMap(next),
  transform: next => _.map(next)
};

module.exports.MAP_VALS = {
  select: next => struct => _.flatMap(next, _.values(struct)),
  transform: next => struct =>
    _.isPlainObject(struct) ? _.mapValues(next, struct) : _.map(next, struct)
};

module.exports.FIRST = {
  select: next => struct => (_.isEmpty(struct) ? [] : next(_.head(struct))),
  transform: next => struct =>
    _.isEmpty(struct) ? struct : _.updateAt(0, next, struct)
};

module.exports.LAST = {
  select: next => struct => (_.isEmpty(struct) ? [] : next(_.last(struct))),
  transform: next => struct =>
    _.isEmpty(struct) ? struct : _.updateAt(struct.length - 1, next, struct)
};

module.exports.key = key => ({
  select: next => struct => next(_.get(key, struct)),
  transform: next => _.update(key, next)
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
