const _ = require("../src/util");
const s = require("../src/core");

describe("transform", () => {
  test("Without navigators", () => {
    expect(s.transform([], _.identity, 1)).toEqual(1);
    expect(s.transform([], _.identity, [])).toEqual([]);
  });
});
