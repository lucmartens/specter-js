const NONE = Symbol("NONE");
module.exports.NONE = NONE;

module.exports.map = (fn, struct) => {
  const acc = [];
  for (let i = 0; i < struct.length; i++) {
    const result = fn(struct[i]);
    if (result !== NONE) {
      acc.push(result);
    }
  }
  return acc;
};

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

module.exports.concat = (a, b) => a.concat(b);

module.exports.reduceRight = (fn, initial, struct) => {
  let acc = initial;
  for (let i = struct.length - 1; i >= 0; i--) {
    acc = fn(acc, struct[i]);
  }
  return acc;
};

module.exports.reduce = (fn, initial, struct) => {
  let acc = initial;
  for (let i = 0; i < struct.length; i++) {
    acc = fn(acc, struct[i]);
  }
  return acc;
};

module.exports.cons = (a, b) => [a].concat(b);

module.exports.conj = (a, b) => {
  const r = a.slice();
  r.push(b);
  return r;
};

module.exports.insertArray = (idx, value, struct) => {
  const r = struct.slice(0, idx);
  r.push(value, ...struct.slice(idx));
  return r;
};

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

module.exports.isArray = Array.isArray;

module.exports.isEmpty = struct => !struct || struct.length === 0;

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

module.exports.pick = (keys, struct) => {
  const acc = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    acc[key] = struct[key];
  }
  return acc;
};

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

module.exports.set = (key, value, struct) =>
  module.exports.merge(struct, { [key]: value });

module.exports.keys = Object.keys;

module.exports.values = obj => {
  const acc = [];
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    acc.push(obj[keys[i]]);
  }
  return acc;
};

module.exports.entries = obj => {
  const acc = [];
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    acc.push([key, obj[key]]);
  }
  return acc;
};
