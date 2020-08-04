const withSvgr = require("next-svgr");

module.exports = withSvgr({
  env: {
    GA: process.env.GA,
    META_TAG_ID: process.env.META_TAG_ID,
  },
  experimental: {
    optimizeFonts: true,
  },
});
