const _ = require("./util");

module.exports.ALL = {
  select: next => _.flatMap(next),
  transform: next => _.map(next)
};

module.exports.FIRST = {
  select: next => struct => next(_.head(struct)),
  transform: next => _.updateAt(0, next)
};

module.exports.key = key => ({
  select: next => struct => next(_.get(key, struct)),
  transform: next => _.update(key, next)
});

module.exports.pred = pred => ({
  select: next => struct => (pred(struct) ? next(struct) : []),
  transform: next => struct => (pred(struct) ? next(struct) : struct)
});

module.exports.filter = pred => ({
  select: next => struct => next(_.filter(pred, struct))
});
