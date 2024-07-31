import pluginRss from "@11ty/eleventy-plugin-rss";
import pluginLightningCSS from "@11tyrocks/eleventy-plugin-lightningcss";
import pluginSitemap from "@quasibit/eleventy-plugin-sitemap";

export default function (eleventyConfig) {
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
}
