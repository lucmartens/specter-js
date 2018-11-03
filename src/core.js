const _ = require("./util");
const navigators = require("./nav");

const compile = _.cond([
  [_.isString, navigators.key],
  [_.isFunction, navigators.pred],
  [_.stubTrue, _.identity]
]);

module.exports.select = (path, struct) =>
  _.reduceRight((nav, next) => compile(nav).select(next), v => [v], path)(
    struct
  );

module.exports.transform = (path, update, struct) =>
  _.reduceRight((nav, next) => compile(nav).transform(next), update, path)(
    struct
  );

module.exports = _.merge(module.exports, navigators);
