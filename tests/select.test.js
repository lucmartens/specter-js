const _ = require("lodash/fp");
const s = require("../src/core");

const select = (path, struct, expected) =>
  expect(s.select(path, struct)).toEqual(expected);

describe("select", () => {
  test("Without navigators", () => {
    select([], 1, [1]);
    select([], [], [[]]);
  });

  test("ALL", () => {
    select(s.ALL, undefined, []);
    select(s.ALL, [], []);
    select(s.ALL, [1, 2], [1, 2]);
    select(s.ALL, [[1, 2]], [[1, 2]]);
    select([s.ALL, s.ALL], [[1, 2]], [1, 2]);
  });

  test("MAP_VALS", () => {
    select(s.MAP_VALS, undefined, []);
    select(s.MAP_VALS, {}, []);
    select(s.MAP_VALS, { a: 1, b: 2 }, [1, 2]);
  });

  test("FIRST", () => {
    select(s.FIRST, undefined, []);
    select(s.FIRST, [], []);
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
    select("a", undefined, [undefined]);
    select("a", [], [undefined]);
    select("a", { a: 1 }, [1]);
    select(["a", "b"], { a: { b: 1 } }, [1]);
    select([0], [1], [1]);
    select([1], [1], [undefined]);
  });

  test("pred", () => {
    select([_.stubFalse], 1, []);
    select([_.stubTrue], 1, [1]);
    select([v => v === 1], 1, [1]);
    select([v => v !== 1], 1, []);
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

  test("complex", () => {
    select([s.ALL, s.FIRST], undefined, []);
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
