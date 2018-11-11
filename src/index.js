const core = require("./core");
const navs = require("./navs");
const impl = require("./impl");

module.exports = {
  ...core,
  ...navs,
  NONE: impl.NONE
};
