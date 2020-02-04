const fs = require("fs");
const path = require("path");
const postcss = require("postcss");

const fileName = "styles.css";

module.exports = class {
  async data() {
    const rawFilepath = path.join(__dirname, `../_includes/postcss/${fileName}`);
    return {
      permalink: `css/${fileName}`,
      rawFilepath,
      rawCss: await fs.readFileSync(rawFilepath)
    };
  }

  async render({ rawCss, rawFilepath }) {
    return await postcss([
      require("postcss-import"),
      require("tailwindcss")("./tailwind.config.js"),
      require("autoprefixer"),
      require("@fullhuman/postcss-purgecss")({
        content: ["./src/**/*.html", "./src/**/*.njk"],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
      }),
      require("cssnano")
    ])
      .process(rawCss, { from: rawFilepath })
      .then(result => result.css);
  }
};
