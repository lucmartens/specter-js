const curry = require("lodash/fp/curry");
const get = require("lodash/fp/get");
const set = require("lodash/fp/set");

const updateAt = (idx, fn, arr) => set(idx, fn(get(idx, arr)), arr);

// Collection
module.exports.map = require("lodash/fp/map");
module.exports.flatMap = require("lodash/fp/flatMap");
module.exports.filter = require("lodash/fp/filter");
module.exports.reduceRight = require("lodash/fp/reduceRight");

// Array
module.exports.head = require("lodash/fp/head");
module.exports.last = require("lodash/fp/last");
module.exports.updateAt = curry(updateAt);

// Object
module.exports.set = set;
module.exports.get = get;
module.exports.merge = require("lodash/fp/merge");
module.exports.update = require("lodash/fp/update");

// Function
module.exports.curry = curry;

// Util
module.exports.cond = require("lodash/fp/cond");
module.exports.constant = require("lodash/fp/constant");
module.exports.identity = require("lodash/fp/identity");
module.exports.stubTrue = require("lodash/fp/stubTrue");
module.exports.stubFalse = require("lodash/fp/stubFalse");

// Lang
module.exports.isFunction = require("lodash/fp/isFunction");
module.exports.isString = require("lodash/fp/isString");
module.exports.isEmpty = require("lodash/fp/isEmpty");
