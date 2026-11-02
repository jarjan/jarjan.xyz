// slugify drops these Kazakh letters
const kkLatin = { ә: "a", ғ: "gh", қ: "q", ң: "ng", ө: "oe", ұ: "uu", ү: "ue", һ: "h", і: "i" };

export default function (eleventyConfig) {
  const slugify = eleventyConfig.getFilter("slugify");

  eleventyConfig.amendLibrary("md", (md) => {
    md.core.ruler.before("inline", "heading_ids", ({ tokens }) => {
      tokens.forEach((token, i) => {
        if (token.type !== "heading_open" || !["h2", "h3"].includes(token.tag)) return;
        const inline = tokens[i + 1];
        const [, title, id] = inline.content.match(/^(.*?)(?:\s*\{#([\w-]+)\})?$/);
        inline.content = title;
        token.attrSet("id", id ?? slugify(title.toLowerCase().replace(/[әғқңөұүһі]/g, (letter) => kkLatin[letter])));
      });
    });
  });

  eleventyConfig.addFilter("toc", (content) => {
    const headings = [];
    for (const [, level, id, html] of content.matchAll(/<h([23]) id="([^"]+)">(.*?)<\/h\1>/g)) {
      const heading = { id, text: html.replace(/<[^>]+>/g, ""), children: [] };
      if (level === "3" && headings.length) headings.at(-1).children.push(heading);
      else headings.push(heading);
    }
    return headings;
  });
}
