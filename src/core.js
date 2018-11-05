const _ = require("lodash/fp");

_.mixin({
  cons: (a, b) => _.concat([a], b),
  conj: (b, a) => _.concat(b, [a]),
  isNavigator: f => _.isFunction(f) && f.isNavigator
});

const NONE = Symbol("NONE");
module.exports.NONE = NONE;

const navigator = m => {
  const fn = next => operation => m[operation](next(operation));
  fn.isNavigator = true;
  return fn;
};

module.exports.ALL = navigator({
  select: next => _.flatMap(next),
  transform: next =>
    _.reduce((acc, v) => {
      const result = next(v);
      return result === NONE ? acc : _.conj(acc, result);
    }, [])
});

module.exports.MAP_VALS = navigator({
  select: next => struct => _.flatMap(next, _.values(struct)),
  transform: next => struct =>
    _.isPlainObject(struct) ? _.mapValues(next, struct) : _.map(next, struct)
});

module.exports.FIRST = navigator({
  select: next => struct => (_.isEmpty(struct) ? [] : next(_.head(struct))),
  transform: next => struct => {
    if (_.isEmpty(struct)) {
      return struct;
    }
    const result = next(_.get(0, struct));
    return result === NONE ? _.pullAt(0, struct) : _.set(0, result, struct);
  }
});

module.exports.LAST = navigator({
  select: next => struct => (_.isEmpty(struct) ? [] : next(_.last(struct))),
  transform: next => struct => {
    if (_.isEmpty(struct)) {
      return struct;
    }
    const idx = struct.length - 1;
    const result = next(_.get(idx, struct));
    return result === NONE ? _.pullAt(idx, struct) : _.set(idx, result, struct);
  }
});

module.exports.BEGINNING = navigator({
  select: next => struct => [],
  transform: next => struct => {
    const result = next([]);
    return _.isArray(struct) ? _.concat(result, struct) : result;
  }
});

module.exports.END = navigator({
  select: next => struct => [],
  transform: next => struct => {
    const result = next([]);
    return _.isArray(struct) ? _.concat(struct, result) : result;
  }
});

module.exports.BEFORE_ELEMENT = navigator({
  select: next => struct => NONE,
  transform: next => struct => {
    const result = next(NONE);
    return result === NONE ? struct : _.cons(result, struct);
  }
});

module.exports.AFTER_ELEMENT = navigator({
  select: next => struct => NONE,
  transform: next => struct => {
    const result = next(NONE);
    return result === NONE ? struct : _.conj(struct, result);
  }
});

module.exports.key = key =>
  navigator({
    select: next => struct => next(_.get(key, struct)),
    transform: next => struct => {
      const result = next(_.get(key, struct));
      return result === NONE ? _.omit(key, struct) : _.set(key, result, struct);
    }
  });

module.exports.pred = pred =>
  navigator({
    select: next => struct => (pred(struct) ? next(struct) : []),
    transform: next => struct => (pred(struct) ? next(struct) : struct)
  });

module.exports.parser = (parse, unparse) =>
  navigator({
    select: next => struct => next(parse(struct)),
    transform: next => struct => unparse(next(parse(struct)))
  });

module.exports.submap = keys =>
  navigator({
    select: next => struct => next(_.pick(keys, struct)),
    transform: next => struct => _.merge(struct, next(_.pick(keys, struct)))
  });

const navigatorAlias = _.cond([
  [_.isNavigator, _.identity],
  [_.isString, module.exports.key],
  [_.isNumber, module.exports.key],
  [_.isFunction, module.exports.pred],
  [_.stubTrue, _.identity]
]);

const compile = path => {
  let defer;
  path = _.isArray(path) ? path : [path];

  const compose = (nav, next) => navigatorAlias(nav)(next);
  const compiled = _.reduceRight(compose, op => v => defer(v), path);

  return (operation, lastFn, struct) => {
    defer = lastFn;
    return compiled(operation)(struct);
  };
};

module.exports.compile = compile;

module.exports.select = (path, struct) =>
  compile(path)("select", v => [v], struct);

module.exports.compiledSelect = (compiledPath, struct) =>
  compiledPath("select", v => [v], struct);

module.exports.selectOne = (path, struct) =>
  compile(path)("select", _.identity, struct);

module.exports.compiledSelectOne = (compiledPath, struct) =>
  compiledPath("select", _.identity, struct);

module.exports.transform = (path, update, struct) =>
  compile(path)("transform", update, struct);

module.exports.compiledTransform = (compiledPath, update, struct) =>
  compiledPath("transform", update, struct);

module.exports.setval = (path, value, struct) =>
  compile(path)("transform", _.constant(value), struct);

module.exports.compiledSetval = (compiledPath, value, struct) =>
  compiledPath("transform", _.constant(value), struct);
