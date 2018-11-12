const navs = require("./navs");
const core = require("./core");
const impl = require("./impl");

module.exports = Object.assign({}, core, navs, { NONE: impl.NONE });
