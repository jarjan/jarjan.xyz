const PluginRss = require("@11ty/eleventy-plugin-rss");
const PluginLightningCSS = require("@11tyrocks/eleventy-plugin-lightningcss");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/static": "./" });

  eleventyConfig.addPlugin(PluginRss);
  eleventyConfig.addPlugin(PluginLightningCSS);

  return {
    dir: {
      input: "./src",
    },
  };
};
