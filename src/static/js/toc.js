// Table of contents scrollspy. Browsers with scroll-target-group mark the
// current link with :target-current; others get a .target-current class.
// Either way the current link also gets aria-current for screen readers.
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
  // Like :target-current: the last heading above the top third of the
  // screen, or the first one before any is
  const sync = () => {
    let index = 0;
    headings.forEach((heading, i) => {
      if (heading && heading.getBoundingClientRect().top <= innerHeight / 3) index = i;
    });
    setCurrent(links[index]);
  };
  // Everything above that line counts as intersecting, so this fires whenever
  // a heading crosses it, in either direction
  const observer = new IntersectionObserver(sync, { rootMargin: "1000000px 0px -67% 0px" });
  for (const heading of headings) if (heading) observer.observe(heading);
}
