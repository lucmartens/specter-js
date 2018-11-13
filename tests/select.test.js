const s = require("../src/core");

const select = (path, struct, expected) =>
  expect(s.select(path, struct)).toEqual(expected);

const inc = v => v + 1;
const even = v => v % 2 == 0;

describe("select", () => {
  test("Without navigators", () => {
    select([], 1, [1]);
    select([], [], [[]]);
  });

  test("ALL", () => {
    select(s.ALL, [], []);
    select(s.ALL, {}, []);
    select(s.ALL, [1, 2], [1, 2]);
    select(s.ALL, [[1, 2]], [[1, 2]]);
    select(s.ALL, { a: 1 }, [["a", 1]]);
    select([s.ALL, s.ALL], [[1, 2]], [1, 2]);
  });

  test("MAP_VALS", () => {
    select(s.MAP_VALS, {}, []);
    select(s.MAP_VALS, { a: 1, b: 2 }, [1, 2]);
  });

  test("MAP_KEYS", () => {
    select(s.MAP_KEYS, {}, []);
    select(s.MAP_KEYS, { a: 1, b: 2 }, ["a", "b"]);
  });

  test("FIRST", () => {
    select(s.FIRST, undefined, []);
    select(s.FIRST, [], []);
    select([s.FIRST, s.FIRST], [], []);
    select(s.FIRST, [1, 2], [1]);
    select(s.FIRST, [[1, 2]], [[1, 2]]);
    select([s.FIRST, s.FIRST], [[1, 2]], [1]);
  });

  test("LAST", () => {
    select(s.LAST, undefined, []);
    select(s.LAST, [], []);
    select(s.LAST, [1, 2], [2]);
    select(s.LAST, [[1, 2]], [[1, 2]]);
    select([s.LAST, s.LAST], [[1, 2]], [2]);
  });

  test("BEGINNING", () => {
    select(s.BEGINNING, undefined, []);
    select(s.BEGINNING, [], []);
  });

  test("END", () => {
    select(s.END, undefined, []);
    select(s.END, [], []);
  });

  test("BEFORE_ELEM", () => {
    select(s.BEFORE_ELEM, [], s.NONE);
  });

  test("AFTER_ELEM", () => {
    select(s.AFTER_ELEM, [], s.NONE);
  });

  test("key", () => {
    select("a", { a: 1 }, [1]);
    select(["a", "b"], { a: { b: 1 } }, [1]);
  });

  test("nth", () => {
    select(0, [0, 1, 2], [0]);
    select([1, 1], [0, [1, 2]], [2]);
    select([1], [1], [undefined]);
  });

  test("pred", () => {
    select(even, 2, [2]);
    select(even, 1, []);
    select([s.ALL, even], [1, 2, 3, 4], [2, 4]);
  });

  test("parser", () => {
    const parse = time => time.split(".");
    const unparse = splitTime => splitTime.join(".");
    select([s.parser(parse, unparse)], "10.35", [["10", "35"]]);
  });

  test("submap", () => {
    select([s.submap(["a", "b"])], { a: 1, b: 2, c: 3 }, [{ a: 1, b: 2 }]);
    select([s.submap([])], { a: 1, b: 2, c: 3 }, [{}]);
  });

  test("view", () => {
    select(s.view(inc), 1, [2]);
    select([s.FIRST, s.view(inc)], [1, 2, 3], [2]);
  });

  test("filterer", () => {
    select(s.filterer(even), [1, 2, 3, 4], [[2, 4]]);
    select([s.filterer(even), s.ALL], [1, 2, 3, 4], [2, 4]);
  });

  test("complex", () => {
    select([s.ALL, s.FIRST], [[1, 2], [1, 2]], [1, 1]);
    select([s.ALL, "a"], [{ a: 1 }, { a: 1 }], [1, 1]);
    select([s.ALL, "a", v => v > 1], [{ a: 1 }, { a: 2 }], [2]);
  });
});

describe("select variants", () => {
  const data = [{ a: 1 }, { a: 2 }];
  const path = [s.ALL, "a", v => v > 1];
  const compiledPath = s.compile(path);

  test("select", () => {
    expect(s.select(path, data)).toEqual([2]);
  });

  test("compiled select", () => {
    expect(s.compiledSelect(compiledPath, data)).toEqual([2]);
  });

  test("select-one", () => {
    expect(s.selectOne(path, data)).toEqual([2]);
  });

  test("compiled select-one", () => {
    expect(s.compiledSelectOne(compiledPath, data)).toEqual([2]);
  });
});
