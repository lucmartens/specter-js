const _ = require("./impl");
const navs = require("./navs");

const NONE = _.NONE;
const COMPILED = Symbol("COMPILED");

const isCompiled = obj => typeof obj === "function" && obj[COMPILED];

const compile = path => {
  if (isCompiled(path)) {
    return path;
  }

  path = Array.isArray(path) ? path : [path];
  let defer;

  const reducer = (acc, nav) => {
    return isCompiled(nav)
      ? op => struct => nav(op, acc(op), struct)
      : navs.resolveNavigator(nav)(acc);
  };

  const compiled = _.reduceRight(reducer, op => defer, path);

  const fn = (operation, leafFn, struct) => {
    defer = leafFn;
    return compiled(operation)(struct);
  };

  fn[COMPILED] = true;
  return fn;
};

const select = (path, struct) => compile(path)("select", v => [v], struct);

const selectOne = (path, struct) => compile(path)("select", v => v, struct);

const transform = (path, update, struct) =>
  compile(path)("transform", update, struct);

const setval = (path, value, struct) =>
  compile(path)("transform", () => value, struct);

module.exports = {
  compile,
  select,
  selectOne,
  transform,
  setval
};
