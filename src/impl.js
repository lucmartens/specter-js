const NONE = Symbol("NONE");
module.exports.NONE = NONE;

/**
 * Map over an array or string. NONE values are removed.
 */
module.exports.map = (fn, struct) => {
  const acc = [];
  for (let i = 0; i < struct.length; i++) {
    const result = fn(struct[i]);
    if (result !== NONE) {
      acc.push(result);
    }
  }
  return typeof struct === "string" ? acc.join("") : acc;
};

/**
 * Map over an array and concat the results. NONE values are removed.
 */
module.exports.flatMap = (fn, struct) => {
  const acc = [];
  for (let i = 0; i < struct.length; i++) {
    const result = fn(struct[i]);
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

/**
 * Reduce array from left to right.
 */
module.exports.reduce = (fn, initial, struct) => {
  let acc = initial;
  for (let i = 0; i < struct.length; i++) {
    acc = fn(acc, struct[i]);
  }
  return acc;
};

/**
 * Reduce array from right to left.
 */
module.exports.reduceRight = (fn, initial, struct) => {
  let acc = initial;
  for (let i = struct.length - 1; i >= 0; i--) {
    acc = fn(acc, struct[i]);
  }
  return acc;
};

/**
 * concat 2 arrays.
 */
module.exports.concat = (a, b) => a.concat(b);

/**
 * Add a value to the beginning of an array.
 */
module.exports.cons = (a, b) => [a].concat(b);

/**
 * Add a value to the end of an array.
 */
module.exports.conj = (a, b) => {
  const r = a.slice();
  r.push(b);
  return r;
};

/**
 * Remove and return the first element from an array. Transforms undefined
 * values to NONE. This operation mutates the array.
 */
module.exports.shift = struct => {
  const v = struct.shift();
  return v === undefined ? NONE : v;
};

/**
 * Insert element in an array at index.
 */
module.exports.insertArray = (idx, value, struct) => {
  const r = struct.slice(0, idx);
  r.push(value, ...struct.slice(idx));
  return r;
};

/**
 * Update element in an array at index. NONE values are removed.
 */
module.exports.updateArray = (idx, fn, struct) => {
  const result = fn(struct[idx]);
  if (result === NONE) {
    const r = struct.slice(0, idx);
    r.push(...struct.slice(idx + 1));
    return r;
  } else {
    const r = struct.slice(0, idx);
    r.push(result, ...struct.slice(idx + 1));
    return r;
  }
};

/**
 * Return whether a value is an array.
 */
module.exports.isArray = Array.isArray;

/**
 * Return whether an array is empty.
 */
module.exports.isEmpty = struct => !struct || struct.length === 0;

/**
 * Return whether a value is an object.
 */
module.exports.isObject = struct =>
  typeof struct === "object" &&
  struct !== null &&
  struct.constructor === Object;

/**
 * Omit collection of keys from an object.
 */
module.exports.omit = (keys, struct) => {
  const acc = {};
  const Objkeys = Object.keys(struct);
  for (let i = 0; i < Objkeys.length; i++) {
    const key = Objkeys[i];
    if (!keys.includes(key)) {
      acc[key] = struct[key];
    }
  }
  return acc;
};

/**
 * Pick collection of keys from an object.
 */
module.exports.pick = (keys, struct) => {
  const acc = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    acc[key] = struct[key];
  }
  return acc;
};

/**
 * Merge 2 objects.
 */
module.exports.merge = (a, b) => {
  const acc = {};
  const keysA = Object.keys(a);
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    const value = a[key];
    acc[key] = value;
  }
  const keysB = Object.keys(b);
  for (let i = 0; i < keysB.length; i++) {
    const key = keysB[i];
    const value = b[key];
    acc[key] = value;
  }
  return acc;
};

/**
 * Map over an object's values. NONE values are removed.
 */
module.exports.mapValues = (fn, struct) => {
  const acc = {};
  const keys = Object.keys(struct);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = struct[k];
    const result = fn(v);
    if (result !== NONE) {
      acc[k] = result;
    }
  }
  return acc;
};

/**
 * Map over an object's keys. NONE values are removed.
 */
module.exports.mapKeys = (fn, struct) => {
  const acc = {};
  const keys = Object.keys(struct);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = struct[k];
    const result = fn(k);
    if (result !== NONE) {
      acc[result] = v;
    }
  }
  return acc;
};

/**
 * Map over an object's entries. NONE values are removed.
 */
module.exports.mapEntries = (fn, struct) => {
  const acc = {};
  const keys = Object.keys(struct);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = struct[k];
    const result = fn([k, v]);
    if (result !== NONE) {
      acc[result[0]] = result[1];
    }
  }
  return acc;
};

module.exports.getIn = (keys, struct) => {
  let acc = struct;
  for (let i = 0; i < keys.length; i++) {
    acc = acc[keys[i]];
  }
  return acc;
};

module.exports.set = (key, value, struct) =>
  module.exports.merge(struct, { [key]: value });

/**
 * Return array of object's keys.
 */
module.exports.keys = Object.keys;

/**
 * Return array of object's values.
 */
module.exports.values = obj => {
  const acc = [];
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    acc.push(obj[keys[i]]);
  }
  return acc;
};

/**
 * Return array of object's entries.
 */
module.exports.entries = obj => {
  const acc = [];
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    acc.push([key, obj[key]]);
  }
  return acc;
};
