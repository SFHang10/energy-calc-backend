/**
 * Reads HTMLS GWM GWB/400 countries.html → writes data/orgs-directory-inline.js
 * for Case Study Finder (map pins + sidebar + Visit links).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "HTMLS GWM GWB", "400 countries.html");
const outPath = path.join(root, "data", "orgs-directory-inline.js");
const wikiPath = path.join(root, "data", "org-wikipedia-images.json");

function loadWikiEntries() {
  try {
    const raw = JSON.parse(fs.readFileSync(wikiPath, "utf8"));
    if (raw && raw.entries && typeof raw.entries === "object") return raw.entries;
    const { _meta, ...rest } = raw;
    return rest;
  } catch {
    return {};
  }
}

const COUNTRY_COORDS = {
  "United Kingdom": { lng: -1.5, lat: 52.5 },
  UK: { lng: -1.5, lat: 52.5 },
  USA: { lng: -98, lat: 39 },
  Canada: { lng: -106, lat: 56 },
  Mexico: { lng: -102, lat: 23 },
  Brazil: { lng: -51, lat: -14 },
  Chile: { lng: -71, lat: -35 },
  Peru: { lng: -75, lat: -10 },
  Argentina: { lng: -64, lat: -34 },
  Colombia: { lng: -74, lat: 4.5 },
  Netherlands: { lng: 5.3, lat: 52.1 },
  Germany: { lng: 10.4, lat: 51.2 },
  France: { lng: 2.3, lat: 46.6 },
  Spain: { lng: -3.7, lat: 40.4 },
  Portugal: { lng: -8.2, lat: 39.4 },
  Italy: { lng: 12.5, lat: 41.9 },
  Belgium: { lng: 4.5, lat: 50.5 },
  Ireland: { lng: -8.2, lat: 53.3 },
  Sweden: { lng: 18, lat: 59.3 },
  Denmark: { lng: 10.2, lat: 56 },
  Norway: { lng: 10.7, lat: 59.9 },
  Switzerland: { lng: 8.2, lat: 46.8 },
  Austria: { lng: 14.5, lat: 47.5 },
  Poland: { lng: 19.1, lat: 52.2 },
  Finland: { lng: 26, lat: 64 },
  Scotland: { lng: -4.2, lat: 56.5 },
  "East Africa": { lng: 38, lat: -2 },
  "West Africa": { lng: -2, lat: 10 },
  Africa: { lng: 20, lat: 5 },
  Kenya: { lng: 37.9, lat: -0.02 },
  Uganda: { lng: 32.3, lat: 1.4 },
  Rwanda: { lng: 29.9, lat: -1.94 },
  Tanzania: { lng: 35, lat: -6 },
  Ethiopia: { lng: 39, lat: 9 },
  "South Africa": { lng: 25, lat: -29 },
  Nigeria: { lng: 8, lat: 9 },
  Ghana: { lng: -1, lat: 7.95 },
  Morocco: { lng: -7, lat: 32 },
  Egypt: { lng: 30, lat: 26 },
  Bangladesh: { lng: 90.4, lat: 23.7 },
  India: { lng: 78, lat: 22 },
  China: { lng: 104, lat: 35 },
  Japan: { lng: 139, lat: 36 },
  "South Korea": { lng: 127.8, lat: 35.9 },
  Myanmar: { lng: 96, lat: 21 },
  Thailand: { lng: 100.5, lat: 13.8 },
  Vietnam: { lng: 108, lat: 14 },
  Singapore: { lng: 103.8, lat: 1.35 },
  Malaysia: { lng: 101.7, lat: 3.14 },
  Indonesia: { lng: 113, lat: -0.8 },
  Philippines: { lng: 122, lat: 11 },
  Nepal: { lng: 84, lat: 28 },
  Pakistan: { lng: 69.3, lat: 30.4 },
  Taiwan: { lng: 121, lat: 23.7 },
  Israel: { lng: 34.8, lat: 31 },
  UAE: { lng: 54.4, lat: 24.5 },
  Australia: { lng: 134, lat: -25 },
  "New Zealand": { lng: 172, lat: -41 },
  Global: { lng: 10, lat: 35 },
  Pacific: { lng: 160, lat: -10 },
  Americas: { lng: -75, lat: 15 },
  Asia: { lng: 95, lat: 25 },
  "Middle East": { lng: 45, lat: 28 },
};

function jitter(id, lng, lat) {
  const a = ((id * 7919) % 1000) / 1000 - 0.5;
  const b = ((id * 4999) % 1000) / 1000 - 0.5;
  return { lng: lng + a * 2.2, lat: lat + b * 1.4 };
}

function displayCountry(c) {
  if (c === "United Kingdom") return "UK";
  if (c === "USA") return "USA";
  return c;
}

function coordsFor(org) {
  const c = org.country;
  const r = org.region;
  let base = COUNTRY_COORDS[c];
  if (!base && r && COUNTRY_COORDS[r]) base = COUNTRY_COORDS[r];
  if (!base && r === "Global") base = COUNTRY_COORDS.Global;
  if (!base && r === "Africa") base = COUNTRY_COORDS.Africa;
  if (!base && r === "Americas") base = COUNTRY_COORDS.Americas;
  if (!base && r === "Asia") base = COUNTRY_COORDS.Asia;
  if (!base && r === "Pacific") base = COUNTRY_COORDS.Pacific;
  if (!base && r === "Europe") base = { lng: 10, lat: 52 };
  if (!base) {
    console.warn("Missing coords for country:", c, "region:", r, org.name);
    base = COUNTRY_COORDS.Global;
  }
  return jitter(100000 + org.n, base.lng, base.lat);
}

function clearbitHost(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function main() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const i = html.indexOf("const orgs = [");
  if (i < 0) throw new Error("const orgs = [ not found");
  const j = html.indexOf("\n];", i);
  if (j < 0) throw new Error("closing ]; not found");
  // j points at newline before `];` — slice through `]` (exclusive end j+2)
  const expr = html.slice(i + "const orgs = ".length, j + 2);
  // eslint-disable-next-line no-eval
  const orgs = eval(expr);
  const wiki = loadWikiEntries();

  const mapped = orgs.map((org) => {
    const { lng, lat } = coordsFor(org);
    const host = clearbitHost(org.url);
    const wk = wiki[String(org.n)];
    let imageUrl;
    let wikipediaUrl;
    if (wk && wk.thumbnail) {
      imageUrl = wk.thumbnail;
      wikipediaUrl = wk.article || undefined;
    } else {
      imageUrl = host ? `https://logo.clearbit.com/${host}` : undefined;
    }
    return {
      id: 100000 + org.n,
      name: org.name,
      country: displayCountry(org.country),
      city: org.country,
      lng,
      lat,
      sector: "directory",
      region: org.region,
      color: "#7fd9a8",
      desc: org.desc,
      url: org.url.startsWith("http") ? org.url : `https://${org.url}`,
      imageUrl,
      wikipediaUrl,
      stats: {
        savings: org.type || "Organisation",
        energy: org.sector || "Sustainability",
        co2: org.region || "",
        payback: "Directory",
      },
    };
  });

  const banner = `// Auto-generated by scripts/build-orgs-directory-inline.js — do not edit by hand\n`;
  const body = `${banner}window.ORGS_DIRECTORY_INLINE=${JSON.stringify(mapped)};\n`;
  fs.writeFileSync(outPath, body, "utf8");
  console.log("Wrote", outPath, "entries:", mapped.length);
}

main();
