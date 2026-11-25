// Marks the current TOC link; .target-current is the :target-current fallback
const links = [...document.querySelectorAll(".toc a")];
const setCurrent = (current) => {
  for (const link of links) {
    link.classList.toggle("target-current", link === current);
    if (link === current) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
};

if (CSS.supports("scroll-target-group: auto")) {
  const sync = () => setCurrent(document.querySelector(".toc a:target-current"));
  sync();
  // :target-current settles a couple of frames after scrolling ends
  document.addEventListener("scrollend", () => setTimeout(sync, 100));
} else {
  const headings = links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))));
  // Last heading above the top third, like :target-current
  const sync = () => {
    let index = 0;
    headings.forEach((heading, i) => {
      if (heading && heading.getBoundingClientRect().top <= innerHeight / 3) index = i;
    });
    setCurrent(links[index]);
  };
  // Fires whenever a heading crosses that line
  const observer = new IntersectionObserver(sync, { rootMargin: "1000000px 0px -67% 0px" });
  for (const heading of headings) if (heading) observer.observe(heading);
}
