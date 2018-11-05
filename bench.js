const _ = require("lodash/fp");
const s = require("./src/core");

const bench = (label, n, fn) => {
  const start = new Date();
  for (let i = 0; i < n; i++) {
    fn();
  }
  const stop = new Date();
  console.log(label.padEnd(20), "\t", stop.getTime() - start.getTime());
};

const data = { a: [{ aa: 1, bb: 2 }, { cc: 3 }], b: [{ dd: 4 }] };
const inc = v => v + 1;
const even = v => v % 2 === 0;

const a = () =>
  Object.entries(data).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: v.map(v =>
        Object.entries(v).reduce(
          (acc2, [k2, v2]) => ({
            ...acc2,
            [k2]: inc(v2)
          }),
          {}
        )
      )
    }),
    {}
  );

const b = () => s.transform([s.MAP_VALS, s.ALL, s.MAP_VALS], inc, data);

const compiled = s.compile([s.MAP_VALS, s.ALL, s.MAP_VALS]);
const c = () => s.compiledTransform(compiled, inc, data);

const d = () => _.mapValues(_.map(_.mapValues(inc)), data);

console.log(a());
console.log(b());
console.log(c());
console.log(d());

bench("native", 500000, a);
bench("uncompiled", 500000, b);
bench("compiled", 500000, c);
bench("lodash", 500000, d);
