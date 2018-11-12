const _ = require("./impl");
const core = require("./core");

const NONE = _.NONE;
const NAVIGATOR = Symbol("NAVIGATOR");

/**
 * Create a navigator instance. A navigator is defined as an object with select
 * and transform fields.
 */
const navigator = definition => {
  const fn = next => operation => {
    return definition[operation](next(operation));
  };
  fn[NAVIGATOR] = true;
  return fn;
};

/**
 * Return whether an object is a navigator.
 */
const isNavigator = nav => typeof nav === "function" && nav[NAVIGATOR];

const resolveNavigator = nav => {
  if (isNavigator(nav)) {
    return nav;
  }
  switch (typeof nav) {
    case "string":
      return keypath(nav);
    case "number":
      return nthpath(nav);
    case "function":
      return pred(nav);
  }
};

/**
 * Navigate to every element in a collection. Can transform to NONE to remove
 * elements. Can navigate to elements in an array, entries in an object, or
 * substrings in a string.
 */
const ALL = navigator({
  select: next => struct =>
    _.flatMap(next, _.isObject(struct) ? _.entries(struct) : struct),
  transform: next => struct => {
    console.log("ALL", struct);
    return _.isObject(struct)
      ? _.mapEntries(next, struct)
      : _.map(next, struct);
  }
});

/**
 * Navigate to every value in a object. Can transform to NONE to remove object
 * entries.
 */
const MAP_VALS = navigator({
  select: next => struct =>
    _.flatMap(next, _.isObject(struct) ? _.values(struct) : struct),
  transform: next => struct =>
    _.isObject(struct) ? _.mapValues(next, struct) : _.map(next, struct)
});

/**
 * Navigate to every key in a object. Can transform to NONE to remove object
 * entries.
 */
const MAP_KEYS = navigator({
  select: next => struct => _.flatMap(next, _.keys(struct)),
  transform: next => struct => _.mapKeys(next, struct)
});

/**
 * Navigate to every key value pair in a object. Can transform to NONE to
 * remove object entries.
 */
const MAP_ENTRIES = navigator({
  select: next => struct => _.flatMap(next, _.entries(struct)),
  transform: next => struct => _.mapEntries(next, struct)
});

/**
 * Navigate to the first element of a array. If the array is empty. navigation
 * stops. Can tranform to NONE to remove elements.
 */
const FIRST = navigator({
  select: next => struct => (_.isEmpty(struct) ? [] : next(struct[0])),
  transform: next => struct =>
    _.isEmpty(struct) ? struct : _.updateArray(0, next, struct)
});

/**
 * Navigate to the last element of a array. If the array is empty. navigation
 * stops. Can tranform to NONE to remove elements.
 */
const LAST = navigator({
  select: next => struct => {
    return _.isEmpty(struct) ? [] : next(struct[struct.length - 1]);
  },

  transform: next => struct =>
    _.isEmpty(struct) ? struct : _.updateArray(struct.length - 1, next, struct)
});

const TAIL = navigator({
  select: next => struct => next(struct.slice(1)),
  transform: next => struct =>
    _.concat(struct.slice(0, 1), next(struct.slice(1)))
});

/**
 * Navigate to the empty array before the beginning of a array.
 */
const BEGINNING = navigator({
  select: next => struct => [],
  transform: next => struct => {
    const result = next([]);
    return _.isArray(result)
      ? _.concat(result, struct)
      : _.cons(result, struct);
  }
});

/**
 * Navigate to the empty array after the end of a array.
 */
const END = navigator({
  select: next => struct => [],
  transform: next => struct => {
    const result = next([]);
    return _.isArray(result)
      ? _.concat(struct, result)
      : _.conj(struct, result);
  }
});

/**
 * Navigate to the 'void' element before the array.
 */
const BEFORE_ELEM = navigator({
  select: next => struct => NONE,
  transform: next => struct => {
    const result = next(NONE);
    return result === NONE ? struct : _.cons(result, struct);
  }
});

/**
 * Navigate to the 'void' element after the array.
 */
const AFTER_ELEM = navigator({
  select: next => struct => NONE,
  transform: next => struct => {
    const result = next(NONE);
    return result === NONE ? struct : _.conj(struct, result);
  }
});

const keypath = key =>
  navigator({
    select: next => struct => next(struct[key]),
    transform: next => struct => {
      const result = next(struct[key]);
      return result === NONE ? _.omit(key, struct) : _.set(key, result, struct);
    }
  });

const nthpath = idx =>
  navigator({
    select: next => struct => next(struct[idx]),
    transform: next => struct => _.updateArray(idx, next, struct)
  });

const pred = pred =>
  navigator({
    select: next => struct => (pred(struct) ? next(struct) : []),
    transform: next => struct => (pred(struct) ? next(struct) : struct)
  });

const parser = (parse, unparse) =>
  navigator({
    select: next => struct => next(parse(struct)),
    transform: next => struct => unparse(next(parse(struct)))
  });

const submap = keys =>
  navigator({
    select: next => struct => next(_.pick(keys, struct)),
    transform: next => struct => _.merge(struct, next(_.pick(keys, struct)))
  });

const view = fn =>
  navigator({
    select: next => struct => next(fn(struct)),
    transform: next => struct => next(fn(struct))
  });

const isSelected = path => {
  path = core.compile(path);
  return navigator({
    select: next => struct =>
      core.select(path, struct).length ? next(struct) : [],
    transform: next => struct =>
      core.select(path, struct).length ? next(struct) : struct
  });
};

const subselect = path => {
  path = core.compile(path);
  return navigator({
    select: next => struct => next(core.select(path, struct)),
    transform: next => struct => {
      const transformed = next(core.select(path, struct));
      return core.transform(path, () => _.shift(transformed), struct);
    }
  });
};

const filterer = path => {
  path = core.compile(path);
  return navigator({
    select: next => struct =>
      next(core.select(subselect([ALL, isSelected(path)]), struct)),
    transform: next => struct =>
      core.transform(subselect([ALL, isSelected(path)]), next, struct)
  });
};

const branch = (...paths) => {
  // paths = _.map(core.compile, paths);
  return navigator({
    select: next => struct =>
      next(_.flatMap(path => core.select(path, struct), paths)),
    transform: next => struct => {
      return _.reduce(
        (acc, path) => core.transform(path, v => next([v]), acc),
        struct,
        paths
      );
    }
  });
};

const regex = pattern =>
  navigator({
    select: next => struct => {
      const match = struct.match(pattern);
      return match ? _.flatMap(next, match) : [];
    },
    transform: next => struct => {
      console.log("regex", struct);
      const replaced = struct.replace(pattern, next);
      console.log("result", replaced);
      return replaced;
    }
  });

module.exports = {
  navigator,
  isNavigator,
  resolveNavigator,
  ALL,
  MAP_VALS,
  MAP_KEYS,
  MAP_ENTRIES,
  FIRST,
  LAST,
  TAIL,
  BEGINNING,
  END,
  BEFORE_ELEM,
  AFTER_ELEM,
  keypath,
  nthpath,
  pred,
  parser,
  submap,
  view,
  filterer,
  isSelected,
  subselect,
  branch,
  regex
};
