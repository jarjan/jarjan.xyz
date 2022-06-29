const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,js,njk}"],
  theme: {
    fontFamily: {
      sans: ["Alegreya Sans", ...defaultTheme.fontFamily.sans],
    },
  },
};
