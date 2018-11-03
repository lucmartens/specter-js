const _ = require("./util");

module.exports.ALL = {
  select: next => _.flatMap(next),
  transform: next => _.map(next)
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
