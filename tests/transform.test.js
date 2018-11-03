const _ = require("../src/util");
const s = require("../src/core");

const transform = (path, fn, struct, expected) =>
  expect(s.transform(path, fn, struct)).toEqual(expected);

describe("transform", () => {
  test("Without navigators", () => {
    transform([], _.identity, 1, 1);
    transform([], _.identity, [], []);
  });
});
