const _ = require("./impl");

const NONE = _.NONE;
module.exports.NONE = NONE;

const navigator = m => {
  const fn = next => operation => m[operation](next(operation));
  fn.isNavigator = true;
  return fn;
};

module.exports.ALL = navigator({
  select: next => struct => _.flatMap(next, struct),
  transform: next => struct => _.map(next, struct)
});

module.exports.MAP_VALS = navigator({
  select: next => struct => _.flatMap(next, _.values(struct)),
  transform: next => struct => _.mapValues(next, struct)
});

module.exports.MAP_KEYS = navigator({
  select: next => struct => _.flatMap(next, _.keys(struct)),
  transform: next => struct => _.mapKeys(next, struct)
});

module.exports.MAP_ENTRIES = navigator({
  select: next => struct => _.flatMap(next, _.entries(struct)),
  transform: next => struct => _.mapEntries(next, struct)
});

module.exports.FIRST = navigator({
  select: next => struct => (_.isEmpty(struct) ? [] : next(struct[0])),
  transform: next => struct =>
    _.isEmpty(struct) ? struct : _.updateArray(0, next, struct)
});

module.exports.LAST = navigator({
  select: next => struct =>
    _.isEmpty(struct) ? [] : next(struct[struct.length - 1]),
  transform: next => struct =>
    _.isEmpty(struct) ? struct : _.updateArray(struct.length - 1, next, struct)
});

module.exports.BEGINNING = navigator({
  select: next => struct => [],
  transform: next => struct => {
    const result = next([]);
    return _.isArray(result) ? _.concat(result, struct) : [result, ...struct];
  }
});

module.exports.END = navigator({
  select: next => struct => [],
  transform: next => struct => {
    const result = next([]);
    return _.concat(struct, result);
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
    select: next => struct => next(struct[key]),
    transform: next => struct => {
      const result = next(struct[key]);
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

  const compiled = _.reduceRight(
    (acc, nav) => resolveNavigator(nav)(acc),
    op => v => defer(v),
    Array.isArray(path) ? path : [path]
  );

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
  compile(path)("select", v => v, struct);

module.exports.compiledSelectOne = (compiledPath, struct) =>
  compiledPath("select", v => v, struct);

module.exports.transform = (path, update, struct) =>
  compile(path)("transform", update, struct);

module.exports.compiledTransform = (compiledPath, update, struct) =>
  compiledPath("transform", update, struct);

module.exports.setval = (path, value, struct) =>
  compile(path)("transform", () => value, struct);

module.exports.compiledSetval = (compiledPath, value, struct) =>
  compiledPath("transform", () => value, struct);
