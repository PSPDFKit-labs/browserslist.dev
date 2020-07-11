const withSvgr = require("next-svgr");

module.exports = withSvgr({
  env: {
    GA: process.env.GA,
  },
});
