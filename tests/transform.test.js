const _ = require("lodash/fp");
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
    transform(s.ALL, _.identity, [1], [1]);
    transform(s.ALL, inc, [1, 2], [2, 3]);
    transform([s.ALL, s.ALL], inc, [[1, 2], [3, 4]], [[2, 3], [4, 5]]);
    transform(s.ALL, _.constant(s.NONE), [1, 2, 3], []);
  });

  test("MAP_VALS", () => {
    transform(s.MAP_VALS, inc, {}, {});
    transform(s.MAP_VALS, inc, { a: 1 }, { a: 2 });
  });

  test("MAP_KEYS", () => {
    transform(s.MAP_KEYS, inc, {}, {});
    transform(s.MAP_KEYS, v => v + "b", { a: "a" }, { ab: "a" });
  });

  test("MAP_ENTRIES", () => {
    transform(s.MAP_ENTRIES, _.identity, {}, {});
    transform(
      s.MAP_ENTRIES,
      ([k, v]) => [k + "b", v + "b"],
      { a: "a" },
      { ab: "ab" }
    );
  });

  test("FIRST", () => {
    transform(s.FIRST, _.identity, 1, 1); // clojure would throw an exception
    transform(s.FIRST, _.identity, [], []);
    transform(s.FIRST, inc, [1, 2], [2, 2]);
    transform([s.FIRST, s.FIRST], inc, [[1], 2], [[2], 2]);
    transform(s.FIRST, _.constant(s.NONE), [[1], 2], [2]);
  });

  test("LAST", () => {
    transform(s.LAST, _.identity, 1, 1); // clojure would throw an exception
    transform(s.LAST, _.identity, [], []);
    transform(s.LAST, inc, [1, 2], [1, 3]);
    transform([s.LAST, s.LAST], inc, [1, [2]], [1, [3]]);
    transform(s.LAST, _.constant(s.NONE), [[1], 2], [[1]]);
  });

  test("BEGINNING", () => {
    transform(s.BEGINNING, _.constant([3, 4]), [1, 2], [3, 4, 1, 2]);
    transform(s.BEGINNING, _.constant(3), [1, 2], [3, 1, 2]);
    transform(s.BEGINNING, _.constant([1, 2]), undefined, [1, 2]);
  });

  test("END", () => {
    transform(s.END, _.constant([3, 4]), [1, 2], [1, 2, 3, 4]);
    transform(s.END, _.constant(3), [1, 2], [1, 2, 3]);
    transform(s.END, _.constant([1, 2]), undefined, [1, 2]);
  });

  test("BEFORE_ELEM", () => {
    transform(s.BEFORE_ELEM, _.constant([3, 4]), [1, 2], [[3, 4], 1, 2]);
    transform(s.BEFORE_ELEM, _.constant(3), [1, 2], [3, 1, 2]);
    transform(s.BEFORE_ELEM, _.constant(s.NONE), [1, 2], [1, 2]);
  });

  test("AFTER_ELEM", () => {
    transform(s.AFTER_ELEM, _.constant([3, 4]), [1, 2], [1, 2, [3, 4]]);
    transform(s.AFTER_ELEM, _.constant(3), [1, 2], [1, 2, 3]);
    transform(s.AFTER_ELEM, _.constant(s.NONE), [1, 2], [1, 2]);
  });

  test("key", () => {
    transform(["a"], _.identity, 1, 1); // clojure would throw an exception
    transform(["a"], _.identity, [], []);
    transform(["a"], inc, { a: 1, b: 2 }, { a: 2, b: 2 });
    transform(["a", "b"], inc, { a: { b: 1, a: 1 } }, { a: { b: 2, a: 1 } });
    transform(["a"], _.constant(s.NONE), { a: 1, b: 2 }, { b: 2 });
  });

  test("pred", () => {
    transform([even], inc, 1, 1);
    transform([even], inc, 2, 3);
  });

  test("parser", () => {
    const parse = time => time.split(".");
    const unparse = splitTime => splitTime.join(".");
    const parser = s.parser(parse, unparse);
    transform([parser], _.identity, "10.35", "10.35");
    transform([parser], v => [v[0]], "10.35", "10");
    transform([parser, s.FIRST], _.constant(s.NONE), "10.35", "35");
  });

  test("submap", () => {
    transform([s.submap([])], _.identity, { a: 1, b: 2 }, { a: 1, b: 2 });
    transform([s.submap([]), s.MAP_VALS], inc, { a: 1 }, { a: 1 });
    transform([s.submap(["a"]), s.MAP_VALS], inc, { a: 1 }, { a: 2 });
  });

  test("complex", () => {
    transform([s.ALL, even], inc, [1, 2, 3], [1, 3, 3]);
    transform([s.ALL, even], _.constant(s.NONE), [1, 2, 3], [1, 3]);
  });
});

describe("transform variants", () => {
  const data = [{ a: 1 }, { a: 2 }];
  const expected = [{ a: 1 }, { a: 3 }];
  const path = [s.ALL, "a", v => v > 1];
  const compiledPath = s.compile(path);

  test("transform", () => {
    expect(s.transform(path, inc, data)).toEqual(expected);
  });

  test("compiled transform", () => {
    expect(s.compiledTransform(compiledPath, inc, data)).toEqual(expected);
  });

  test("setval", () => {
    expect(s.setval(path, 3, data)).toEqual(expected);
  });

  test("compiled setval", () => {
    expect(s.compiledSetval(compiledPath, 3, data)).toEqual(expected);
  });
});
