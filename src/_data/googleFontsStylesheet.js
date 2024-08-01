const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const url =
  "https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;700;800&display=optional";

export default fetch(url).then((res) => res.text());
