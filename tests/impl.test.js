const _ = require("../src/impl");

const arr = [1, 2, 3, 4];
const even = v => v % 2 === 0;
const inc = v => v + 1;

describe("map", () => {
  test("map", () => {
    expect(_.map(inc, arr)).toEqual([2, 3, 4, 5]);
  });

  test("remove value", () => {
    expect(_.map(v => (even(v) ? inc(v) : _.NONE), arr)).toEqual([3, 5]);
  });
});

describe("flatmap", () => {
  test("flatmap", () => {
    expect(_.flatMap(v => _.map(inc, v), [[1], [2], [3]])).toEqual([2, 3, 4]);
  });

  test("remove value", () => {
    expect(_.flatMap(v => _.NONE, [[1], [2], [3]])).toEqual([]);
  });
});

describe("mapValues", () => {
  test("mapValues", () => {
    expect(_.mapValues(inc, { a: 1, b: 2 })).toEqual({ a: 2, b: 3 });
  });

  test("remove value", () => {
    const data = { a: 1, b: 2, c: 3 };
    expect(_.mapValues(v => (even(v) ? inc(v) : _.NONE), data)).toEqual({
      b: 3
    });
  });
});

describe("mapKeys", () => {
  test("mapKeys", () => {
    expect(_.mapKeys(inc, { a: 1, b: 2 })).toEqual({ a1: 1, b1: 2 });
  });

  test("remove value", () => {
    expect(
      _.mapKeys(v => (v === "a" ? inc(v) : _.NONE), { a: 1, b: 2 })
    ).toEqual({ a1: 1 });
  });
});

describe("mapEntries", () => {
  test("mapEntries", () => {
    expect(_.mapEntries(v => [inc(v[0]), inc(v[1])], { a: 1, b: 2 })).toEqual({
      a1: 2,
      b1: 3
    });
  });

  test("remove value", () => {
    expect(
      _.mapEntries(v => (v[0] === "a" ? [inc(v[0]), inc(v[1])] : _.NONE), {
        a: 1,
        b: 2
      })
    ).toEqual({ a1: 2 });
  });
});

describe("cons", () => {
  test("adds to front", () => {
    expect(_.cons(0, arr)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe("conj", () => {
  test("adds to back", () => {
    expect(_.conj(arr, 0)).toEqual([1, 2, 3, 4, 0]);
  });
});

describe("insertArray", () => {
  test("inserts at index", () => {
    expect(_.insertArray(2, "v", arr)).toEqual([1, 2, "v", 3, 4]);
  });
});

describe("updateArray", () => {
  test("sets at index", () => {
    expect(_.updateArray(2, () => "v", arr)).toEqual([1, 2, "v", 4]);
  });

  test("remove at index", () => {
    expect(_.updateArray(2, () => _.NONE, arr)).toEqual([1, 2, 4]);
  });
});

describe("omit", () => {
  test("omits keys", () => {
    expect(_.omit(["a", "b"], { a: 1, b: 1, c: 1 })).toEqual({ c: 1 });
  });
});

describe("pick", () => {
  test("picks keys", () => {
    expect(_.pick(["a", "b"], { a: 1, b: 1, c: 1 })).toEqual({ a: 1, b: 1 });
  });
});

describe("merge", () => {
  test("merges objects", () => {
    const a = { a: 1, b: 1 };
    const b = { b: 2, c: 2 };
    expect(_.merge(a, b)).toEqual({ a: 1, b: 2, c: 2 });
  });
});

describe("set", () => {
  test("sets object value", () => {
    expect(_.set("a", 2, { a: 1, b: 1 })).toEqual({ a: 2, b: 1 });
  });
});

describe("concat", () => {
  test("concats arrays", () => {
    const a = [1, 2];
    const b = [3, 4];
    expect(_.concat(a, b)).toEqual([1, 2, 3, 4]);
  });
});

describe("reduce", () => {
  test("reduces array", () => {
    expect(_.reduce((acc, v) => acc + v, 0, arr)).toEqual(10);
  });
});

describe("reduce right", () => {
  test("reduces array", () => {
    expect(_.reduceRight((acc, v) => [...acc, v], [], arr)).toEqual([
      4,
      3,
      2,
      1
    ]);
  });
});
