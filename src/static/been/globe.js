// Spinning globe for /been/. Borders come from world.json and the d3-geo
// bundle in geo.js (both made by scripts/been-globe.js), places from the
// page's #been-data.
(async () => {
  const { geoOrthographic, geoPath, feature, merge, mesh } = window.beenGeo;
  const figure = document.querySelector(".globe");
  const canvas = figure.querySelector(".globe__canvas");
  const label = figure.querySelector(".globe__label");
  const buttons = [...document.querySelectorAll(".been__city")];
  const ctx = canvas.getContext("2d");
  const places = JSON.parse(document.getElementById("been-data").textContent);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const darkMode = matchMedia("(prefers-color-scheme: dark)");

  const RAD = Math.PI / 180;
  const SPIN = 6; // degrees per second
  const RESUME = 2500; // ms of calm before spinning again
  const FLIGHT = 900; // ms to turn to a city
  const MARGIN = 10; // px around the globe for city rings

  const countryIds = new Set(places.countries.map((c) => c.id));

  const topo = await (await fetch("/been/world.json")).json();
  const map = (() => {
    const { countries, divisions } = topo.objects;
    const collection = (features) => ({ type: "FeatureCollection", features });
    return {
      // One shape for all land, so borders aren't traced twice
      land: merge(topo, countries.geometries),
      visited: collection(feature(topo, countries).features.filter((f) => countryIds.has(f.id))),
      divisions: collection(feature(topo, divisions).features.filter((f) => f.properties.v)),
      countryBorders: mesh(topo, countries, (a, b) => a !== b),
      divisionBorders: mesh(topo, divisions, (a, b) => a !== b),
    };
  })();

  const flags = Object.fromEntries(places.countries.map((c) => [c.code, c.flag]));
  const cities = places.cities.map((c) => ({
    ...c,
    sinLat: Math.sin(c.lat * RAD),
    cosLat: Math.cos(c.lat * RAD),
    x: 0,
    y: 0,
    z: -1,
  }));

  const projection = geoOrthographic().precision(1);
  const path = geoPath(projection, ctx);

  // View centre in degrees; starts between Europe and Kazakhstan
  const view = { lon: 40, lat: 32 };
  let size = 0;
  let dpr = 1;
  let colors = {};
  let hovered = null;
  let selected = null;
  let drag = null;
  let flight = null;
  let calmSince = 0;
  let onScreen = true;
  let frame = 0;
  let last = 0;

  function readColors() {
    const style = getComputedStyle(canvas);
    colors = Object.fromEntries(
      ["sea", "rim", "land", "country", "region", "border", "city", "ring"].map((name) => [
        name,
        style.getPropertyValue(`--globe-${name}`).trim(),
      ]),
    );
  }

  function resize() {
    size = canvas.clientWidth;
    dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.height = Math.round(size * dpr);
    request();
  }

  const radius = () => size / 2 - MARGIN;

  function fill(shape, color) {
    ctx.beginPath();
    path(shape);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function stroke(shape, color, width, alpha = 1) {
    ctx.beginPath();
    path(shape);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function draw() {
    const R = radius();
    const c = size / 2;
    projection.rotate([-view.lon, -view.lat]).scale(R).translate([c, c]);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    path({ type: "Sphere" });
    ctx.fillStyle = colors.sea;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.rim;
    ctx.stroke();

    fill(map.land, colors.land);
    fill(map.visited, colors.country);
    fill(map.divisions, colors.region);
    stroke(map.divisionBorders, colors.border, 0.3, 0.8);
    stroke(map.countryBorders, colors.border, 0.5);

    const sp0 = Math.sin(view.lat * RAD);
    const cp0 = Math.cos(view.lat * RAD);
    for (const city of cities) {
      // z > 0 is the visible hemisphere
      city.z = sp0 * city.sinLat + cp0 * city.cosLat * Math.cos((city.lon - view.lon) * RAD);
      [city.x, city.y] = projection([city.lon, city.lat]);
    }
    const focus = selected || hovered;
    const order = cities.filter((city) => city.z > 0 && city !== focus);
    if (focus && focus.z > 0) order.push(focus);
    ctx.fillStyle = colors.city;
    ctx.strokeStyle = colors.ring;
    for (const city of order) {
      const big = city === focus;
      ctx.beginPath();
      ctx.arc(city.x, city.y, (big ? 4 : 2.75) * (0.6 + 0.4 * city.z), 0, 2 * Math.PI);
      ctx.lineWidth = big ? 2 : 1.25;
      ctx.stroke();
      ctx.fill();
    }

    if (focus && focus.z > 0.05) {
      label.textContent = `${flags[focus.country]} ${focus.name}`;
      label.style.left = `${canvas.offsetLeft + focus.x}px`;
      label.style.top = `${canvas.offsetTop + focus.y}px`;
      label.hidden = false;
    } else {
      label.hidden = true;
    }
  }

  const spinning = () => !reduceMotion.matches && !selected && !drag;
  const animating = () => onScreen && (flight || spinning());

  function tick(now) {
    frame = 0;
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    if (flight) {
      const t = Math.min((now - flight.start) / FLIGHT, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      for (const k in flight.to) view[k] = flight.from[k] + flight.to[k] * e;
      if (t === 1) flight = null;
    } else if (spinning()) {
      // Ease back into the spin after the visitor lets go
      const ease = Math.min(Math.max((now - calmSince - RESUME) / 1000, 0), 1);
      view.lon = ((view.lon - SPIN * ease * dt + 540) % 360) - 180;
    }
    draw();
    if (animating()) request();
  }

  function request() {
    if (frame) return;
    frame = requestAnimationFrame((now) => {
      if (!last || now - last > 100) last = now;
      tick(now);
    });
  }

  // Turn to a city and hold it there, or let go with null
  function select(city) {
    selected = city;
    calmSince = performance.now();
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.city === city?.name));
    if (city) {
      const lat = Math.max(-60, Math.min(60, city.lat));
      if (reduceMotion.matches) {
        flight = null;
        Object.assign(view, { lon: city.lon, lat });
      } else {
        const dLon = ((city.lon - view.lon + 540) % 360) - 180;
        flight = { start: performance.now(), from: { ...view }, to: { lon: dLon, lat: lat - view.lat } };
      }
    }
    request();
  }

  function cityAt(event, reach) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let best = null;
    let bestDist = reach;
    for (const city of cities) {
      const d = Math.hypot(city.x - x, city.y - y);
      if (city.z > 0 && d < bestDist) [best, bestDist] = [city, d];
    }
    return best;
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    canvas.setPointerCapture(event.pointerId);
    drag = { x: event.clientX, y: event.clientY, lon: view.lon, lat: view.lat, moved: false };
    flight = null;
    canvas.classList.add("is-dragging");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drag) {
      const city = cityAt(event, 10);
      if (city !== hovered) {
        hovered = city;
        canvas.classList.toggle("is-pointing", !!city);
        request();
      }
      return;
    }
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    const R = radius();
    view.lon = ((drag.lon - dx / R / RAD + 540) % 360) - 180;
    view.lat = Math.max(-80, Math.min(80, drag.lat + dy / R / RAD));
    request();
  });

  const release = (event) => {
    if (!drag) return;
    const tapped = !drag.moved && event.type === "pointerup";
    drag = null;
    calmSince = performance.now();
    canvas.classList.remove("is-dragging");
    // Tapping a city turns to it, tapping anywhere else lets the globe spin again
    if (tapped) select(cityAt(event, event.pointerType === "mouse" ? 10 : 20));
    else request();
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("pointerleave", () => {
    if (hovered && !drag) {
      hovered = null;
      canvas.classList.remove("is-pointing");
      request();
    }
  });

  for (const button of buttons) {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const city = cities.find((c) => c.name === button.dataset.city);
      select(selected === city ? null : city);
      figure.scrollIntoView({ block: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selected) select(null);
  });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) request();
  }).observe(canvas);
  darkMode.addEventListener("change", () => {
    readColors();
    request();
  });
  reduceMotion.addEventListener("change", request);

  readColors();
  resize();
})();
