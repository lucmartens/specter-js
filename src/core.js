const _ = require("./impl");
const navs = require("./navs");

const COMPILED = Symbol("compiled");

const isCompiled = obj => typeof obj === "function" && obj[COMPILED];

const resolveNavigator = nav => {
  if (navs.isNavigator(nav)) {
    return nav;
  }

  switch (typeof nav) {
    case "string":
      return navs.keypath(nav);
    case "number":
      return navs.nthpath(nav);
    case "function":
      return navs.pred(nav);
  }
};

const compile = path => {
  if (isCompiled(path)) {
    return path;
  }

  path = Array.isArray(path) ? path : [path];
  let defer;

  const reducer = (acc, nav) => {
    return isCompiled(nav)
      ? op => struct => nav(op, acc(op), struct)
      : resolveNavigator(nav)(acc);
  };

  const compiled = _.reduceRight(reducer, op => defer, path);

  const fn = (operation, leafFn, struct) => {
    defer = leafFn;
    return compiled(operation)(struct);
  };

  fn[COMPILED] = true;
  return fn;
};

module.exports.compile = compile;

module.exports.select = (path, struct) =>
  compile(path)("select", v => [v], struct);

module.exports.selectOne = (path, struct) =>
  compile(path)("select", v => v, struct);

module.exports.transform = (path, update, struct) =>
  compile(path)("transform", update, struct);

module.exports.setval = (path, value, struct) =>
  compile(path)("transform", () => value, struct);
