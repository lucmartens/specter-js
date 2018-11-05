const _ = require("lodash/fp");

_.mixin({
  cons: (a, b) => _.concat([a], b),
  conj: (b, a) => [...b, a],
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
  transform: next => struct => {
    const acc = [];
    for (let v of struct) {
      const result = next(v);
      if (result !== NONE) {
        acc.push(result);
      }
    }
    return acc;
  }
});

module.exports.MAP_VALS = navigator({
  select: next => struct => _.flatMap(next, _.values(struct)),
  transform: next => struct => {
    const acc = {};
    for (let [k, v] of Object.entries(struct)) {
      acc[k] = next(v);
    }
    return acc;
  }
});

module.exports.MAP_KEYS = navigator({
  select: next => struct => _.flatMap(next, _.keys(struct)),
  transform: next => struct => _.mapKeys(next, struct)
});

module.exports.MAP_ENTRIES = navigator({
  select: next => struct => _.flatMap(next, Object.entries(struct)),
  transform: next => struct =>
    _.reduce(
      (acc, [k, v]) => {
        const result = next([k, v]);
        return { ...acc, [result[0]]: result[1] };
      },
      {},
      Object.entries(struct)
    )
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

module.exports.BEFORE_ELEM = navigator({
  select: next => struct => NONE,
  transform: next => struct => {
    const result = next(NONE);
    return result === NONE ? struct : _.cons(result, struct);
  }
});

module.exports.AFTER_ELEM = navigator({
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

module.exports.view = fn =>
  navigator({
    select: next => struct => next(fn(struct)),
    transform: next => struct => next(fn(struct))
  });

module.exports.filterer = path => {
  const compiledPath = compile(path);
  return navigator({
    select: next => struct =>
      next(
        _.reduce(
          (acc, v) => {
            const result = module.exports.compiledSelect(compiledPath, v);
            return result.length ? [...acc, v] : acc;
          },
          [],
          struct
        )
      ),
    transform: next => struct => {
      const mapping = {};
      const filtered = [];
      for (let [i, j] = [0, 0]; i < struct.length; i++) {
        const selected = module.exports.compiledSelect(compiledPath, struct[i]);
        if (selected.length) {
          mapping[i] = j;
          j++;
          filtered.push(...selected);
        }
      }

      const transformed = next(filtered);
      const result = [];
      for (let i = 0; i < struct.length; i++) {
        const mappedIdx = mapping[i];

        if (mappedIdx !== undefined) {
          if (transformed[mappedIdx] !== undefined) {
            result.push(transformed[mappedIdx]);
          }
        } else {
          result.push(struct[i]);
        }
      }

      return result;
    }
  });
};

const resolveNavigator = nav => {
  const type = typeof nav;
  if (type === "function" && nav.isNavigator) {
    return nav;
  }

  switch (type) {
    case "string":
      return module.exports.key(nav);
    case "number":
      return module.exports.key(nav);
    case "function":
      return module.exports.pred(nav);
  }
};

const compile = path => {
  let defer;
  path = Array.isArray(path) ? path : [path];

  let compiled = op => v => defer(v);
  for (let i = path.length - 1; i >= 0; i--) {
    compiled = resolveNavigator(path[i])(compiled);
  }

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
