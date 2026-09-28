import pluginRss from "@11ty/eleventy-plugin-rss";
import pluginLightningCSS from "@11tyrocks/eleventy-plugin-lightningcss";
import pluginSitemap from "@quasibit/eleventy-plugin-sitemap";
import pluginTimeToRead from "eleventy-plugin-time-to-read";
import htmlmin from "html-minifier-terser";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/static": "./" });

  eleventyConfig.addFilter("isoDate", (date) => date.toISOString().slice(0, 10));
  eleventyConfig.addFilter("monthYear", (date, lang) =>
    date.toLocaleDateString(lang === "kk" ? "kk-KZ" : "en-GB", { month: "long", year: "numeric" }),
  );

  // minified HTML
  eleventyConfig.addTransform("htmlmin", function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      });

      return minified;
    }

    // If not an HTML output, return content as-is
    return content;
  });

  eleventyConfig.addPlugin(pluginTimeToRead);
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
