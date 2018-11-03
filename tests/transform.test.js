const _ = require("../src/util");
const s = require("../src/core");

const transform = (path, fn, struct, expected) =>
  expect(s.transform(path, fn, struct)).toEqual(expected);

const inc = v => v + 1;
const even = v => v % 2 == 0;

describe("transform", () => {
  test("Without navigators", () => {
    transform([], _.identity, 1, 1);
    transform([], _.identity, [], []);
  });

  test("ALL", () => {
    transform([s.ALL], _.identity, [1], [1]);
    transform([s.ALL], inc, [1, 2], [2, 3]);
    transform([s.ALL, s.ALL], inc, [[1, 2], [3, 4]], [[2, 3], [4, 5]]);
  });

  test("FIRST", () => {
    transform([s.FIRST], _.identity, 1, 1); // clojure would throw an exception
    transform([s.FIRST], _.identity, [], []);
    transform([s.FIRST], inc, [1, 2], [2, 2]);
    transform([s.FIRST, s.FIRST], inc, [[1], 2], [[2], 2]);
  });

  test("LAST", () => {
    transform([s.LAST], _.identity, 1, 1); // clojure would throw an exception
    transform([s.LAST], _.identity, [], []);
    transform([s.LAST], inc, [1, 2], [1, 3]);
    transform([s.LAST, s.LAST], inc, [1, [2]], [1, [3]]);
  });

  test("key", () => {
    transform(["a"], _.identity, 1, 1); // clojure would throw an exception
    transform(["a"], _.identity, [], []);
    transform(["a"], inc, { a: 1, b: 2 }, { a: 2, b: 2 });
    transform(["a", "b"], inc, { a: { b: 1, a: 1 } }, { a: { b: 2, a: 1 } });
  });

  test("pred", () => {
    transform([even], inc, 1, 1);
    transform([even], inc, 2, 3);
  });

  test("complex", () => {
    transform([s.ALL, even], inc, [1, 2, 3], [1, 3, 3]);
  });
});
