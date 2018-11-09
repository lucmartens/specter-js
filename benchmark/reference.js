const Benchmark = require("benchmark");
const impl = require("../src/impl");
const s = require("../src/core");

const obj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

console.log();
console.log("Function binding");
new Benchmark.Suite()
  .add("bind", () => fn.bind(null)())
  .add("arrow", () => (() => fn())())
  .on("cycle", report)
  .run();

console.log();
console.log("Array insert at end");
new Benchmark.Suite()
  .add("spread", () => [...arr, 11])
  .add("slice concat", () => arr.slice().concat(11))
  .add("impl.conj", () => impl.conj(arr, 11))
  .on("cycle", report)
  .run();

console.log();
console.log("Array insert at start");
new Benchmark.Suite()
  .add("spread", () => [11, ...arr])
  .add("slice unshift", () => arr.slice().unshift(11))
  .add("impl.cons", () => impl.cons(11, arr))
  .on("cycle", report)
  .run();

console.log();
console.log("Array insert at index");
new Benchmark.Suite()
  .add("spread slice", () => [...arr.slice(0, 2), 3, ...arr.slice(2)])
  .add("slice concat", () => arr.slice(0, 2).concat(3, arr.slice(2)))
  .add("impl.insertArray", () => impl.insertArray(2, 3, arr))
  .on("cycle", report)
  .run();

console.log();
console.log("Array remove at index");
new Benchmark.Suite()
  .add("spread slice", () => [...arr.slice(0, 2), ...arr.slice(3)])
  .add("slice concat", () => arr.slice(0, 2).concat(arr.slice(3)))
  .add("impl.updateArray", () => impl.updateArray(2, () => impl.NONE, arr))
  .on("cycle", report)
  .run();

console.log();
console.log("Array concat");
new Benchmark.Suite()
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
  .add("impl.values", () => impl.values(obj))
  .on("cycle", report)
  .run();

console.log();
console.log("merge objects");
new Benchmark.Suite()
  .add("spread", () => ({ ...obj, ...obj }))
  .add("Object.assign", () => Object.assign({}, obj, obj))
  .add("impl.merge", () => impl.merge(obj, obj))
  .on("cycle", report)
  .run();

console.log();
console.log("set object value");
new Benchmark.Suite()
  .add("spread", () => ({ ...obj, x: 20 }))
  .add("Object.assign", () => Object.assign({}, obj, { x: 20 }))
  .add("impl.set", () => impl.set("x", 20, obj))
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
  .add("impl.pick", () => impl.pick(objKeys, obj))
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
  .add("impl.omit", () => impl.omit(objKeys, obj))
  .on("cycle", report)
  .run();

console.log();
console.log("map object values");
new Benchmark.Suite()
  .add("reduce entries", () =>
    Object.entries(obj).reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {})
  )
  .add("impl.mapValues", () => impl.mapValues(inc, obj))
  .on("cycle", report)
  .run();

console.log();
console.log("map array");
new Benchmark.Suite()
  .add("array.map", () => arr.map(inc))
  .add("iterable", () => {
    const acc = [];
    for (let v of arr) {
      acc.push(inc(v));
    }
    return acc;
  })
  .add("Array.from", () => Array.from(arr, inc))
  .add("impl.map", () => impl.map(inc, arr))
  .on("cycle", report)
  .run();
