const Benchmark = require("benchmark");
const s = require("../src/core");
const _ = require("lodash/fp");

const obj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// arr = arr.concat(arr, arr, arr, arr, arr, arr, arr);
// arr = arr.concat(arr, arr, arr, arr, arr, arr, arr);

function report(event) {
  console.log(
    event.target.name.padEnd(25),
    parseInt(event.target.hz, 10)
      .toLocaleString()
      .padStart(15)
  );
}

const suffix = v => v + "suffix";
const inc = v => v + 1;
const fn = (...args) => args;

console.log("Function application");
new Benchmark.Suite()
  .add("spread", () => fn(...arr))
  .add("apply", () => fn.apply(null, arr))
  .on("cycle", report)
  .run();

console.log("Function binding");
new Benchmark.Suite()
  .add("bind", () => fn.bind(null)())
  .add("arrow", () => (() => fn())())
  .on("cycle", report)
  .run();

console.log();
console.log("Is Array?");
new Benchmark.Suite()
  .add("is array", () => Array.isArray(arr))
  .add("duck typing", () => arr && arr.length !== undefined)
  .on("cycle", report)
  .run();

console.log();
console.log("Array insert at end");
new Benchmark.Suite()
  .add("spread", () => [...arr, 11])
  .add("slice concat", () => arr.slice().concat(11))

  // fastest
  .add("slice push", () => {
    const r = arr.slice();
    r.push(11);
    return r;
  })
  .on("cycle", report)
  .run();

console.log();
console.log("Array insert at start");
new Benchmark.Suite()
  .add("spread", () => [11, ...arr])

  // fastest
  .add("concat", () => [11].concat(arr))
  .add("slice unshift", () => arr.slice().unshift(11))
  .on("cycle", report)
  .run();

console.log();
console.log("Array insert at index");
new Benchmark.Suite()
  .add("spread slice", () => [...arr.slice(0, 2), 3, ...arr.slice(3)])
  .add("slice concat", () => arr.slice(0, 2).concat(3, arr.slice(3)))

  // fastest
  .add("slice apply push slice", () => {
    const r = arr.slice(0, 3);
    r.push(3, ...arr.slice(3));
    return r;
  })

  .on("cycle", report)
  .run();

console.log();
console.log("Array concat");
new Benchmark.Suite()
  // fastest
  .add("concat", () => arr.concat(arr))
  .add("apply push", () => {
    const r = arr.slice();
    r.push(...arr);
    return r;
  })
  .on("cycle", report)
  .run();

console.log();
console.log("object iteration");
new Benchmark.Suite()
  .add("entries", () => Object.entries(obj))
  .add("values", () => Object.entries(obj))
  .add("keys", () => Object.keys(obj))
  .add("custom values", () => {
    const acc = [];
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      acc.push(obj[keys[i]]);
    }
    return acc;
  })
  .on("cycle", report)
  .run();

console.log();
console.log("Object lookup");
const symbol = Symbol("key");
new Benchmark.Suite()
  .add("string key", () => ({ a: 1 }["a"]))
  .add("symbol key", () => ({ [symbol]: 1 }[symbol]))
  .on("cycle", report)
  .run();

console.log();
console.log("merge objects");
new Benchmark.Suite()
  .add("spread", () => ({ ...obj, ...obj }))
  .add("Object.assign", () => Object.assign(obj, obj))
  .on("cycle", report)
  .run();

console.log();
console.log("set object value");
new Benchmark.Suite()
  .add("spread", () => ({ ...obj, x: 20 }))

  //fastest
  .add("Object.assign", () => Object.assign(obj, { x: 20 }))
  .on("cycle", report)
  .run();

console.log();
console.log("pick object keys");
let objKeys = ["a", "b", "c"];
new Benchmark.Suite()
  .add("reduce", () =>
    objKeys.reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {})
  )
  .add("for loop", () => {
    const acc = {};
    for (let i = 0; i < objKeys.length; i++) {
      const key = objKeys[i];
      acc[key] = obj[key];
    }
    return acc;
  })
  .on("cycle", report)
  .run();

console.log();
console.log("omit object keys");
new Benchmark.Suite()
  .add("copy and delete", () => {
    const acc = Object.assign({}, obj);
    for (let i = 0; i < objKeys.length; i++) {
      delete acc[objKeys[i]];
    }
    return acc;
  })

  //fastest
  .add("reduce object loop", () => {
    const acc = {};
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (objKeys.includes(key)) {
        continue;
      }
      acc[key] = obj[key];
    }
    return acc;
  })
  .on("cycle", report)
  .run();

console.log();
console.log("map object values");
let path = [s.MAP_VALS];
let precompiled = s.compile(path);
new Benchmark.Suite()
  .add("entries", function() {
    const acc = {};
    for (const [k, v] of Object.entries(obj)) {
      acc[k] = inc(v);
    }
    return acc;
  })
  //fastest
  .add("keys and lookup", function() {
    const acc = {};
    for (const k of Object.keys(obj)) {
      acc[k] = obj[k];
    }
    return acc;
  })
  .add("specter precompiled", () => {
    s.compiledTransform(precompiled, inc, obj);
  })
  .add("specter", () => {
    s.transform(path, inc, obj);
  })
  .on("cycle", report)
  .run();

console.log();
console.log("map array");
path = s.ALL;
precompiled = s.compile(path);
new Benchmark.Suite()
  .add("array.map", () => arr.map(inc))

  //fastest
  .add("for loop", () => {
    const acc = [];
    for (let i = 0; i < arr.length; i++) {
      acc.push(inc(arr[i]));
    }
    return acc;
  })
  .add("iterable", () => {
    const acc = [];
    for (let v of arr) {
      acc.push(inc(v));
    }
    return acc;
  })
  .add("Array.from", () => Array.from(arr, inc))
  .add("specter", () => {
    // s.ALL actually does a flatmap, reducing performance.
    s.transform(path, inc, arr);
  })
  .add("specter precompiled", () => {
    s.compiledTransform(precompiled, inc, arr);
  })
  .on("cycle", report)
  .run();
