export default {
  layout: "layouts/blogpost.njk",
  tags: "blog",
  eleventyComputed: {
    ogImage: (data) => `/og/${data.page.fileSlug}.png`,
  },
};
