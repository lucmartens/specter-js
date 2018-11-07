const _ = require("lodash/fp");

_.mixin({
  cons: (a, b) => _.concat([a], b),
  conj: (b, a) => [...b, a]
});

const NONE = Symbol("NONE");
module.exports.NONE = NONE;

const navigator = m => {
  const fn = next => operation => m[operation](next(operation));
  fn.isNavigator = true;
  return fn;
};

function curry(targetfn) {
  var numOfArgs = targetfn.length;
  return function fn() {
    if (arguments.length < numOfArgs) {
      return fn.bind(null, ...arguments);
    } else {
      return targetfn.apply(null, arguments);
    }
  };
}

const map = curry((fn, struct) => {
  const acc = [];
  if (!struct || !struct[Symbol.iterator]) {
    return acc;
  }

  for (let v of struct) {
    const result = fn(v);
    if (result === NONE) {
      continue;
    } else {
      acc.push(result);
    }
  }
  return acc;
});

const flatMap = (fn, struct) => {
  const acc = [];
  for (let v of struct) {
    const result = fn(v);
    if (result === NONE) {
      continue;
    } else if (Array.isArray(result)) {
      acc.push(...result);
    } else {
      acc.push(result);
    }
  }
  return acc;
};

const mapValues = (fn, struct) => {
  const acc = {};
  for (let [k, v] of Object.entries(struct)) {
    const result = fn(v);
    if (result !== NONE) {
      acc[k] = result;
    }
  }
  return acc;
};

const mapKeys = (fn, struct) => {
  const acc = {};
  for (let [k, v] of Object.entries(struct)) {
    const result = fn(k);
    if (result !== NONE) {
      acc[result] = v;
    }
  }
  return acc;
};

const mapEntries = curry((fn, struct) => {
  const acc = {};
  for (let entry of Object.entries(struct)) {
    const result = fn(entry);
    if (result !== NONE) {
      acc[result[0]] = result[1];
    }
  }
  return acc;
});

const updateArray = curry((idx, fn, struct) => {
  const result = fn(struct[idx]);
  if (result === NONE) {
    return [...struct.slice(0, idx), ...struct.slice(idx + 1)];
  } else {
    return [...struct.slice(0, idx), result, ...struct.slice(idx + 1)];
  }
});

const reduceRight = (fn, initial, struct) => {
  let acc = initial;
  for (let i = struct.length - 1; i >= 0; i--) {
    acc = fn(acc, struct[i]);
  }
  return acc;
};

const pre = (conds, yes, no) => v => (conds.every(c => c(v)) ? yes(v) : no);

const isIterable = obj => obj && typeof obj[Symbol.iterator] === "function";

const isObject = obj => obj && obj.constructor == Object;

const values = v => Object.values(v);

const keys = v => Object.keys(v);

const entries = v => Object.entries(v);

module.exports.ALL = navigator({
  select: next => struct => flatMap(next, struct),
  transform: next => struct => map(next, struct)
});

module.exports.MAP_VALS = navigator({
  select: next => struct => flatMap(next, values(struct)),
  transform: next => struct => mapValues(next, struct)
});

module.exports.MAP_KEYS = navigator({
  select: next => struct => flatMap(next, keys(struct)),
  transform: next => struct => mapKeys(next, struct)
});

module.exports.MAP_ENTRIES = navigator({
  select: next => struct => flatMap(next, entries(struct)),
  transform: next => struct => mapEntries(next, struct)
});

module.exports.FIRST = navigator({
  select: next => struct => (_.isEmpty(struct) ? [] : next(struct[0])),
  transform: next => struct =>
    _.isEmpty(struct) ? struct : updateArray(0, next, struct)
});

module.exports.LAST = navigator({
  select: next => struct =>
    _.isEmpty(struct) ? [] : next(struct[struct.length - 1]),
  transform: next => struct =>
    _.isEmpty(struct) ? struct : updateArray(struct.length - 1, next, struct)
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

  const compiled = reduceRight(
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
