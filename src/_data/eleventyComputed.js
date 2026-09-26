export default {
  // UI strings for the page language; posts in other languages (e.g. ru) use English UI
  t: (data) => data.i18n[data.lang === "kk" ? "kk" : "en"],
};
