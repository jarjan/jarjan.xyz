import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const require = createRequire(import.meta.url);
const font = (family, subset, weight) =>
  readFileSync(require.resolve(`@fontsource/${family}/files/${family}-${subset}-${weight}-normal.woff`));

// Satori only falls back between differently named fonts
const subsets = ["latin", "latin-ext", "cyrillic", "cyrillic-ext"];
const fonts = subsets.flatMap((subset) => [
  { name: `serif-${subset}`, data: font("source-serif-4", subset, 700), weight: 700 },
  { name: `sans-${subset}`, data: font("source-sans-3", subset, 400), weight: 400 },
]);
const family = (name) => subsets.map((subset) => `${name}-${subset}`).join(", ");
const logo = `data:image/svg+xml;base64,${readFileSync("src/static/favicon.svg").toString("base64")}`;

const h = (type, style, ...children) => ({ type, props: { style, children } });

export const data = {
  pagination: { data: "collections.blog", size: 1, alias: "post" },
  permalink: ({ post }) => `/og/${post.page.fileSlug}.png`,
  eleventyExcludeFromCollections: true,
};

export async function render({ post, i18n }) {
  const t = i18n[post.data.lang === "kk" ? "kk" : "en"];
  const title = post.data.title;
  const svg = await satori(
    h(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 80,
        boxSizing: "border-box",
        backgroundColor: "#f9fbfc",
        fontFamily: family("sans"),
        lineHeight: 1.2,
        color: "#59667c",
        fontSize: 32,
      },
      h(
        "div",
        { display: "flex", alignItems: "center", gap: 24 },
        { type: "img", props: { src: logo, width: 72, height: 72, style: { transform: "rotate(3deg)" } } },
        t.name,
      ),
      h(
        "div",
        {
          fontFamily: family("serif"),
          fontWeight: 700,
          fontSize: title.length > 40 ? 64 : 80,
          lineHeight: 1.15,
          color: "#0f172a",
        },
        title,
      ),
      h(
        "div",
        { display: "flex", justifyContent: "space-between" },
        post.date.toLocaleDateString("kk-KZ"),
        h("span", { color: "#2f6bbf" }, "jarjan.xyz"),
      ),
    ),
    { width: 1200, height: 630, fonts },
  );
  return new Resvg(svg).render().asPng();
}
