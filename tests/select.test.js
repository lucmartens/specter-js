const _ = require("../src/util");
const s = require("../src/core");

describe("select", () => {
  test("Without navigators", () => {
    expect(s.select([], 1)).toEqual([1]);
    expect(s.select([], [])).toEqual([[]]);
  });

  test("ALL", () => {
    expect(s.select([s.ALL], undefined)).toEqual([]);
    expect(s.select([s.ALL], [])).toEqual([]);
    expect(s.select([s.ALL], [1, 2])).toEqual([1, 2]);
    expect(s.select([s.ALL], [[1, 2]])).toEqual([[1, 2]]);
    expect(s.select([s.ALL, s.ALL], [[1, 2]])).toEqual([1, 2]);
  });

  test("FIRST", () => {
    expect(s.select([s.FIRST], undefined)).toEqual([undefined]);
    expect(s.select([s.FIRST], [])).toEqual([undefined]);
    expect(s.select([s.FIRST], [1, 2])).toEqual([1]);
    expect(s.select([s.FIRST], [[1, 2]])).toEqual([[1, 2]]);
    expect(s.select([s.FIRST, s.FIRST], [[1, 2]])).toEqual([1]);
  });

  test("key", () => {
    expect(s.select(["a"], undefined)).toEqual([undefined]);
    expect(s.select(["a"], [])).toEqual([undefined]);
    expect(s.select(["a"], { a: 1 })).toEqual([1]);
  });

  test("pred", () => {
    expect(s.select([_.stubFalse], 1)).toEqual([]);
    expect(s.select([_.stubTrue], 1)).toEqual([1]);
    expect(s.select([v => v === 1], 1)).toEqual([1]);
    expect(s.select([v => v !== 1], 1)).toEqual([]);
  });

  test("filter", () => {
    expect(s.select([s.filter(_.stubTrue)], undefined)).toEqual([[]]);
    expect(s.select([s.filter(_.stubTrue)], [])).toEqual([[]]);
    expect(s.select([s.filter(v => v > 1)], [1, 2, 3])).toEqual([[2, 3]]);
  });
});
