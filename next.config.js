const withSvgr = require("next-svgr");

module.exports = (phase) =>
  withSvgr({
    env: {
      GA: process.env.GA,
      META_TAG_ID: process.env.META_TAG_ID,
    },
  });
