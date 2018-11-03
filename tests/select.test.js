const _ = require("../src/util");
const s = require("../src/core");

const select = (path, struct, expected) =>
  expect(s.select(path, struct)).toEqual(expected);

describe("select", () => {
  test("Without navigators", () => {
    select([], 1, [1]);
    select([], [], [[]]);
  });

  test("ALL", () => {
    select([s.ALL], undefined, []);
    select([s.ALL], [], []);
    select([s.ALL], [1, 2], [1, 2]);
    select([s.ALL], [[1, 2]], [[1, 2]]);
    select([s.ALL, s.ALL], [[1, 2]], [1, 2]);
  });

  test("FIRST", () => {
    select([s.FIRST], undefined, [undefined]);
    select([s.FIRST], [], [undefined]);
    select([s.FIRST], [1, 2], [1]);
    select([s.FIRST], [[1, 2]], [[1, 2]]);
    select([s.FIRST, s.FIRST], [[1, 2]], [1]);
  });

  test("key", () => {
    select(["a"], undefined, [undefined]);
    select(["a"], [], [undefined]);
    select(["a"], { a: 1 }, [1]);
    select(["a", "b"], { a: { b: 1 } }, [1]);
  });

  test("pred", () => {
    select([_.stubFalse], 1, []);
    select([_.stubTrue], 1, [1]);
    select([v => v === 1], 1, [1]);
    select([v => v !== 1], 1, []);
  });

  test("filter", () => {
    select([s.filter(_.stubTrue)], undefined, [[]]);
    select([s.filter(_.stubTrue)], [], [[]]);
    select([s.filter(v => v > 1)], [1, 2, 3], [[2, 3]]);
  });

  test("complex", () => {
    select([s.ALL, s.FIRST], undefined, []);
    select([s.ALL, s.FIRST], [[1, 2], [1, 2]], [1, 1]);
    select([s.ALL, "a"], [{ a: 1 }, { a: 1 }], [1, 1]);
    select([s.ALL, "a", v => v > 1], [{ a: 1 }, { a: 2 }], [2]);
  });
});
