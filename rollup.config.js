const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const pkg = require("./package.json");

module.exports = [
  {
    input: "src/core.js",
    output: {
      name: "specterJs",
      file: pkg.browser,
      format: "umd"
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: "src/core.js",
    external: ["lodash"],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" }
    ]
  }
];
