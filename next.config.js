const withSvgr = require("next-svgr");
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) =>
  withSvgr({
    env: {
      GA: process.env.GA,
      META_TAG_ID: process.env.META_TAG_ID,
    },
    experimental: {
      optimizeFonts: phase !== PHASE_DEVELOPMENT_SERVER,
    },
  });
