const _ = require("lodash/fp");
const Benchmark = require("benchmark");
const s = require("../src/core");

const suite = new Benchmark.Suite();

const data = { a: [{ aa: 1, bb: 2 }, { cc: 3 }], b: [{ dd: 4 }] };
const inc = v => v + 1;
const even = v => v % 2 === 0;

const compiled = s.compile([s.MAP_VALS, s.ALL, s.MAP_KEYS]);

suite
  .add("naive native", function() {
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
  })
  .add("uncompiled", function() {
    s.transform([s.MAP_VALS, s.ALL, s.MAP_KEYS], v => v, data);
  })
  .add("precompiled", function() {
    s.compiledTransform(compiled, inc, data);
  })
  .add("lodash", function() {
    _.mapValues(_.map(_.mapValues(inc)), data);
  })

  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
