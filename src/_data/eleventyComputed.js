export default {
  // UI strings; languages other than kk use English
  t: (data) => data.i18n[data.lang === "kk" ? "kk" : "en"],
};
