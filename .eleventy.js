const PluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/static": "./" });

  eleventyConfig.addPlugin(PluginRss);

  return {
    dir: {
      input: "./src",
    },
  };
};
