// "Now" statuses, newest first. Add a new entry at the top to update the intro line;
// older entries are kept as history. url is optional and links the text.
export default [
  {
    date: new Date("2026-11-16"),
    url: null,
    text: {
      en: "surviving flu season :(",
      kk: "тұмауратып :(",
    },
  },
  {
    date: new Date("2026-10-04"),
    url: "https://www.linkedin.com/posts/zharzhan_8-years-at-delivery-hero-ugcPost-7511742501612081153-g3sc/",
    text: {
      en: "celebrating 8 years at Delivery Hero",
      kk: "Delivery Hero-дағы 8 жылдығымды тойлап жатырмын",
    },
  },
  {
    date: new Date("2026-09-28"),
    url: null,
    text: {
      en: "focusing on my family",
      kk: "отбасыма көңіл бөліп жүрмін",
    },
  },
].sort((a, b) => b.date - a.date);
