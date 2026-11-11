// Builds the data behind the hidden /been/ globe:
//   src/static/been/world.json  TopoJSON with every country and the visited
//                               first-level administrative divisions
//   src/static/been/geo.js      d3-geo and topojson-client, bundled: the site's
//                               CSP only runs scripts it serves itself
//   src/_data/divisions.json    visited divisions per country, for the page
//
// Rerun after changing src/_data/places.js:
//
//   npm i --no-save world-atlas@2 topojson-client@3 topojson-server@3 \
//     topojson-simplify@3 d3-geo@3 polygon-clipping@0.15 esbuild@0.25
//   node scripts/been-globe.js
//
// Countries come from Natural Earth (via world-atlas). Divisions come from
// geoBoundaries, except where it does not have today's first-level divisions
// (see OVERRIDES and fixKazakhstan). Downloads are cached in the OS temp dir.

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { geoArea, geoCentroid, geoContains, geoDistance } from "d3-geo";
import { build } from "esbuild";
import pc from "polygon-clipping";
import { feature, merge, quantize } from "topojson-client";
import { topology } from "topojson-server";
import {
  filter,
  filterWeight,
  presimplify,
  simplify,
  sphericalRingArea,
  sphericalTriangleArea,
} from "topojson-simplify";
import places from "../src/_data/places.js";

const ROOT = new URL("..", import.meta.url).pathname;
const CACHE = join(tmpdir(), "been-globe-cache");
const GB = "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen";
const NE_ADMIN1 =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";

// Simplification: drop points whose triangle, and rings whose area, is smaller
// than this many steradians (1e-5 sr ≈ 400 km², about a pixel on the globe)
const MIN_AREA = 1e-5;

// geoBoundaries has statistical regions or outdated divisions for these, so
// group Natural Earth's admin-1 units into today's first-level divisions instead
const NOR_2024 = {
  Hordaland: "Vestland",
  "Sogn og Fjordane": "Vestland",
  "Nord-Trøndelag": "Trøndelag",
  "Sør-Trøndelag": "Trøndelag",
  Hedmark: "Innlandet",
  Oppland: "Innlandet",
  "Aust-Agder": "Agder",
  "Vest-Agder": "Agder",
  Svalbard: null,
  "Bouvet Island": null,
};
const OVERRIDES = {
  ITA: (p) => p.region, // 20 regions, from 107 provinces
  GRC: (p) => p.name, // 13 regions and Mount Athos
  SVN: (p) => p.name, // municipalities
  NOR: (p) => (p.name in NOR_2024 ? NOR_2024[p.name] : p.name), // 15 counties since 2024
};

// English names for divisions that are shown on the page
const ENGLISH = {
  Bayern: "Bavaria",
  Hessen: "Hesse",
  "Mecklenburg-Vorpommern": "Mecklenburg-Western Pomerania",
  Niedersachsen: "Lower Saxony",
  "Nordrhein-Westfalen": "North Rhine-Westphalia",
  "Rheinland-Pfalz": "Rhineland-Palatinate",
  Sachsen: "Saxony",
  "Sachsen-Anhalt": "Saxony-Anhalt",
  Thüringen: "Thuringia",
  Kärnten: "Carinthia",
  Niederösterreich: "Lower Austria",
  Oberösterreich: "Upper Austria",
  Steiermark: "Styria",
  Tirol: "Tyrol",
  Wien: "Vienna",
  "Brussels Hoofdstedelijk": "Brussels-Capital Region",
  "Vlaams Gewest": "Flanders",
  "Wallonne Gewest": "Wallonia",
  "Hlavní město Praha": "Prague",
  Hovedstaden: "Capital Region of Denmark",
  Attiki: "Attica",
  "Noord-Holland": "North Holland",
  "Zuid-Holland": "South Holland",
  "Al Wakra": "Al Wakrah",
  "Cataluña/Catalunya": "Catalonia",
  "Comunidad de Madrid": "Community of Madrid",
  "Comunitat Valenciana": "Valencian Community",
  "Illes Balears": "Balearic Islands",
  İstanbul: "Istanbul",
};

const require = createRequire(import.meta.url);
await mkdir(CACHE, { recursive: true });

async function download(url, name) {
  const file = join(CACHE, name);
  if (!existsSync(file)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(await readFile(file, "utf8"));
}

const polygons = (g) => (g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : []);

// d3 wants clockwise outer rings and counter-clockwise holes; sources vary
function rewind(f) {
  const coordinates = polygons(f.geometry).map((rings) =>
    rings.map((ring, i) => {
      const big = geoArea({ type: "Polygon", coordinates: [ring] }) > 2 * Math.PI;
      return (i === 0) === big ? [...ring].reverse() : ring;
    }),
  );
  return { ...f, geometry: { type: "MultiPolygon", coordinates } };
}

const contains = (f, point) => geoContains(f, point);

// Merge features that share a key into one, exactly, along shared borders
function dissolve(features, key) {
  const groups = new Map();
  features.forEach((f, i) => {
    const k = key(f.properties);
    if (k == null) return;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(i);
  });
  const topo = topology({ f: { type: "FeatureCollection", features } }, 1e7);
  const geoms = topo.objects.f.geometries;
  return [...groups].map(([name, ids]) => ({
    type: "Feature",
    properties: { name },
    geometry: merge(
      topo,
      ids.map((i) => geoms[i]),
    ),
  }));
}

// geoBoundaries still has Kazakhstan's regions from before 2018 and 2022:
// Shymkent left South Kazakhstan (now Turkistan Region), and Abai, Jetisu and
// Ulytau were cut from East Kazakhstan, Almaty and Karaganda regions. Each new
// region is its old region intersected with its districts' outline.
async function fixKazakhstan(regions) {
  const districts = (
    await download(`${GB}/KAZ/ADM2/geoBoundaries-KAZ-ADM2_simplified.geojson`, "KAZ-ADM2.json")
  ).features.map(rewind);
  const byName = (name) => regions.find((f) => f.properties.name === name);
  const area = (poly) => geoArea({ type: "Polygon", coordinates: poly });
  const split = (parentName, districtNames, name) => {
    const parent = byName(parentName);
    const inParent = (d) => contains(parent, geoCentroid(d));
    const parts = districtNames.map((n) => {
      const d = districts.find((d) => d.properties.shapeName === n && inParent(d));
      if (!d) throw new Error(`No district ${n} in ${parentName}`);
      return d.geometry.coordinates;
    });
    // Districts leave out some towns; filling holes puts them back
    const outline = pc.union(...parts).map((poly) => [poly[0]]);
    const old = parent.geometry.coordinates;
    // Slivers where the two datasets' borders disagree are dropped
    const keep = (multi) =>
      multi.filter(
        (poly) => area(rewind({ geometry: { type: "Polygon", coordinates: poly } }).geometry.coordinates[0]) > 5e-6,
      );
    parent.geometry = { type: "MultiPolygon", coordinates: keep(pc.difference(old, outline)) };
    regions.push({
      type: "Feature",
      properties: { name },
      geometry: { type: "MultiPolygon", coordinates: keep(pc.intersection(old, outline)) },
    });
  };
  split("South Kazakhstan Region", ["Shymkent"], "Shymkent");
  byName("South Kazakhstan Region").properties.name = "Turkistan Region";
  split(
    "East Kazakhstan Region",
    [
      "Abayskiy",
      "Ayagozskiy",
      "Beskaragayskiy",
      "Borodulikhinskiy",
      "Kokpektinskiy",
      "Semipalatinskiy",
      "Urdzharskiy",
      "Zharminskiy",
    ],
    "Abai Region",
  );
  split(
    "Almaty Region",
    [
      "Aksuskiy",
      "Alakolskiy",
      "Karatal`skiy",
      "Kerbulakskiy",
      "Koksuskiy",
      "Panfilovskiy",
      "Sarkandskiy",
      "Taldyqorghan",
    ],
    "Jetisu Region",
  );
  split("Karaganda Region", ["Ulytauskiy", "Zhanaarkinskiy"], "Ulytau Region");
  return regions.map(rewind);
}

async function divisionsOf(country) {
  const { iso3 } = country;
  let features;
  if (OVERRIDES[iso3]) {
    const ne = await download(NE_ADMIN1, "ne_10m_admin_1.json");
    features = dissolve(
      ne.features.filter((f) => f.properties.adm0_a3 === iso3),
      OVERRIDES[iso3],
    ).map(rewind);
  } else {
    const gb = await download(`${GB}/${iso3}/ADM1/geoBoundaries-${iso3}-ADM1_simplified.geojson`, `${iso3}-ADM1.json`);
    features = gb.features.map((f) => rewind({ ...f, properties: { name: f.properties.shapeName } }));
    if (iso3 === "KAZ") features = await fixKazakhstan(features);
  }
  return features.map((f) => {
    let name = ENGLISH[f.properties.name] ?? f.properties.name;
    // Singapore's are in capitals
    if (name === name.toUpperCase()) name = name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    return { type: "Feature", properties: { c: country.code, n: name }, geometry: f.geometry };
  });
}

// Nearest division for cities that fall just outside (coasts, simplified borders)
function divisionAt(list, point) {
  const inside = list.find((f) => contains(f, point));
  if (inside) return inside;
  let best = null;
  let bestDist = Infinity;
  for (const f of list) {
    for (const poly of f.geometry.coordinates) {
      for (const p of poly[0]) {
        const d = geoDistance(p, point);
        if (d < bestDist) [best, bestDist] = [f, d];
      }
    }
  }
  if (bestDist * 6371 > 30) throw new Error(`${point} is ${Math.round(bestDist * 6371)} km from any division`);
  return best;
}

const world = require("world-atlas/countries-50m.json");
const countries = feature(world, world.objects.countries).features.map((f) => ({
  type: "Feature",
  id: f.id,
  properties: {},
  geometry: f.geometry,
}));

const divisions = [];
const visited = {};
for (const country of places.countries) {
  const list = await divisionsOf(country);
  const names = new Set();
  for (const city of places.cities.filter((c) => c.country === country.code)) {
    names.add(divisionAt(list, [city.lon, city.lat]).properties.n);
  }
  for (const extra of places.divisions.filter((d) => d.country === country.code)) {
    if (!list.some((f) => f.properties.n === extra.name)) throw new Error(`Unknown division ${extra.name}`);
    names.add(extra.name);
  }
  for (const f of list) if (names.has(f.properties.n)) f.properties.v = 1;
  visited[country.code] = [...names].sort((a, b) => a.localeCompare(b));
  divisions.push(...list);
  console.log(`${country.name}: ${list.length} divisions, visited ${visited[country.code].join(", ")}`);
}

// Only visited divisions are drawn, so only they are kept
const full = topology(
  {
    countries: { type: "FeatureCollection", features: countries },
    divisions: { type: "FeatureCollection", features: divisions.filter((f) => f.properties.v) },
  },
  1e6,
);
const topo = simplify(presimplify(full, sphericalTriangleArea), MIN_AREA);
const out = quantize(filter(topo, filterWeight(topo, MIN_AREA, sphericalRingArea)), 1e5);
await writeFile(join(ROOT, "src/static/been/world.json"), JSON.stringify(out));
await writeFile(join(ROOT, "src/_data/divisions.json"), JSON.stringify(visited, null, 2) + "\n");

await build({
  stdin: {
    contents: `export { geoOrthographic, geoPath } from "d3-geo";
      export { feature, merge, mesh } from "topojson-client";`,
    resolveDir: ROOT,
  },
  bundle: true,
  minify: true,
  format: "iife",
  globalName: "beenGeo",
  legalComments: "eof",
  outfile: join(ROOT, "src/static/been/geo.js"),
  logLevel: "warning",
});
console.log("Wrote world.json, geo.js and divisions.json");
