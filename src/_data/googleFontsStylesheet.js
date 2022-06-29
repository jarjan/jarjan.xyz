const fetch = require("node-fetch");

const url =
  "https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;700;800&display=swap";

module.exports = fetch(url).then((res) => res.text());
