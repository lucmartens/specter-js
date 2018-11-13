const s = require("../src/core");

const transform = (path, fn, struct, expected) =>
  expect(s.transform(path, fn, struct)).toEqual(expected);

const setval = (path, val, struct, expected) =>
  expect(s.setval(path, val, struct)).toEqual(expected);

const inc = v => v + 1;
const even = v => v % 2 == 0;
const odd = v => v % 2 !== 0;
const identity = v => v;
const constant = v => () => v;
const reverse = v => v.slice().reverse();

describe("transform", () => {
  test("Without navigators", () => {
    transform([], identity, 1, 1);
    transform([], identity, [], []);
  });

  test("ALL", () => {
    transform(s.ALL, inc, [], []);
    transform(s.ALL, inc, {}, {});
    transform(s.ALL, inc, [1, 2], [2, 3]);
    setval(s.ALL, ["b", 2], {a: 1}, {b: 2});
    transform(s.ALL, constant(s.NONE), [1, 2], []);
    transform(s.ALL, constant(s.NONE), { a: 1 }, {});
    transform(s.ALL, v => [v[0] + "x", inc(v[1])], { a: 1 }, { ax: 2 });
    transform([s.ALL, s.ALL], inc, [[1, 2], [3, 4]], [[2, 3], [4, 5]]);

  });

  test("MAP_VALS", () => {
    transform(s.MAP_VALS, inc, {}, {});
    transform(s.MAP_VALS, inc, { a: 1 }, { a: 2 });
    transform(s.MAP_VALS, constant(s.NONE), { a: 1 }, {});
  });

  test("MAP_KEYS", () => {
    transform(s.MAP_KEYS, inc, {}, {});
    transform(s.MAP_KEYS, v => v + "b", { a: "a" }, { ab: "a" });
    transform(s.MAP_KEYS, constant(s.NONE), { a: 1 }, {});
  });

  test("FIRST", () => {
    transform(s.FIRST, identity, [], []);
    transform(s.FIRST, inc, [1, 2], [2, 2]);
    transform([s.FIRST, s.FIRST], identity, [], []);
    transform([s.FIRST, s.FIRST], inc, [[1], 2], [[2], 2]);
    transform(s.FIRST, constant(s.NONE), [[1], 2], [2]);
  });

  test("LAST", () => {
    transform(s.LAST, identity, [], []);
    transform(s.LAST, inc, [1, 2], [1, 3]);
    transform([s.LAST, s.LAST], identity, [], []);
    transform([s.LAST, s.LAST], inc, [1, [2]], [1, [3]]);
    transform(s.LAST, constant(s.NONE), [[1], 2], [[1]]);
  });

  test("BEGINNING", () => {
    transform(s.BEGINNING, constant([3, 4]), [1, 2], [3, 4, 1, 2]);
    transform(s.BEGINNING, constant(3), [1, 2], [3, 1, 2]);
  });

  test("END", () => {
    transform(s.END, constant([3, 4]), [1, 2], [1, 2, 3, 4]);
    transform(s.END, constant(3), [1, 2], [1, 2, 3]);
  });

  test("BEFORE_ELEM", () => {
    transform(s.BEFORE_ELEM, constant([3, 4]), [1, 2], [[3, 4], 1, 2]);
    transform(s.BEFORE_ELEM, constant(3), [1, 2], [3, 1, 2]);
    transform(s.BEFORE_ELEM, constant(s.NONE), [1, 2], [1, 2]);
  });

  test("AFTER_ELEM", () => {
    transform(s.AFTER_ELEM, constant([3, 4]), [1, 2], [1, 2, [3, 4]]);
    transform(s.AFTER_ELEM, constant(3), [1, 2], [1, 2, 3]);
    transform(s.AFTER_ELEM, constant(s.NONE), [1, 2], [1, 2]);
  });

  test("key", () => {
    transform(["a"], inc, { a: 1, b: 2 }, { a: 2, b: 2 });
    transform(["a", "b"], inc, { a: { b: 1, a: 1 } }, { a: { b: 2, a: 1 } });
    transform(["a"], constant(s.NONE), { a: 1, b: 2 }, { b: 2 });
  });

  test("nth", () => {
    transform(0, inc, [0, 1, 2], [1, 1, 2]);
    transform([0, 0], inc, [[0], 1, 2], [[1], 1, 2]);
  });

  test("pred", () => {
    transform([even], inc, 1, 1);
    transform([even], inc, 2, 3);
  });

  test("parser", () => {
    const parse = time => time.split(".");
    const unparse = splitTime => splitTime.join(".");
    const parser = s.parser(parse, unparse);
    transform([parser], identity, "10.35", "10.35");
    transform([parser], v => [v[0]], "10.35", "10");
    transform([parser, s.FIRST], constant(s.NONE), "10.35", "35");
  });

  test("submap", () => {
    transform([s.submap([])], identity, { a: 1, b: 2 }, { a: 1, b: 2 });
    transform([s.submap([]), s.MAP_VALS], inc, { a: 1 }, { a: 1 });
    transform([s.submap(["a"]), s.MAP_VALS], inc, { a: 1 }, { a: 2 });
  });

  test("view", () => {
    transform(s.view(inc), inc, 0, 2);
    transform([s.ALL, s.view(inc)], inc, [0, 1, 2], [2, 3, 4]);
  });

  test("filterer", () => {
    expect(reverse([1, 2, 3])).toEqual([3, 2, 1]);
    transform(s.filterer(even), reverse, [1, 2, 3, 4, 5], [1, 4, 3, 2, 5]);
    transform(
      [s.filterer(even), s.ALL],
      constant(s.NONE),
      [1, 2, 3, 4, 5],
      [1, 3, 5]
    );
    transform(
      [s.filterer(odd), s.LAST],
      inc,
      [1, 2, 3, 4, 5, 6, 7, 8],
      [1, 2, 3, 4, 5, 6, 8, 8]
    );
  });

  test("complex", () => {
    transform([s.ALL, even], inc, [1, 2, 3], [1, 3, 3]);
    transform([s.ALL, even], constant(s.NONE), [1, 2, 3], [1, 3]);
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
