const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginLightningCSS = require("@11tyrocks/eleventy-plugin-lightningcss");
const pluginSitemap = require("@quasibit/eleventy-plugin-sitemap");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy({ "src/static": "./" });

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginLightningCSS);
  eleventyConfig.addPlugin(pluginSitemap, {
    sitemap: {
      hostname: "https://jarjan.xyz",
    },
  });

  return {
    dir: {
      input: "./src",
    },
  };
};
