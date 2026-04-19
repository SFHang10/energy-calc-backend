/**
 * Update imageUrl for one org in ORGS_DIRECTORY_INLINE (Case Study Finder bundle).
 * Usage: node scripts/update-org-imageurl.js "Exact Name" "https://static.wixstatic.com/..."
 */
const fs = require("fs");
const path = require("path");

const defaultBundle = path.join(
  __dirname,
  "..",
  "HTMLS GWM GWB",
  "European Company - Case Study Finder (Standalone) - Wix bundle.html"
);

const name = process.argv[2];
const imageUrl = process.argv[3];
const bundlePath = process.argv[4]
  ? path.isAbsolute(process.argv[4])
    ? process.argv[4]
    : path.join(__dirname, "..", process.argv[4])
  : defaultBundle;
if (!name || !imageUrl) {
  console.error(
    'Usage: node scripts/update-org-imageurl.js "Name" "https://..." [relative-or-absolute-path-to-bundle.html]'
  );
  process.exit(1);
}

function extractArrayBounds(html, marker) {
  const i = html.indexOf(marker);
  if (i === -1) throw new Error("Not found: " + marker);
  let start = i + marker.length;
  while (start < html.length && /\s/.test(html[start])) start++;
  if (html[start] !== "[") throw new Error("Expected [");
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let j = start; j < html.length; j++) {
    const ch = html[j];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "[") depth++;
    if (ch === "]") {
      depth--;
      if (depth === 0) {
        let end = j + 1;
        if (html[end] === ";") end++;
        return { start: i, arrayStart: start, closeBracket: j, endExclusive: end };
      }
    }
  }
  throw new Error("Unclosed array");
}

const html = fs.readFileSync(bundlePath, "utf8");
const marker = "window.ORGS_DIRECTORY_INLINE=";
const bounds = extractArrayBounds(html, marker);
const orgs = JSON.parse(html.slice(bounds.arrayStart, bounds.closeBracket + 1));

let hit = 0;
for (const o of orgs) {
  if (o.name === name) {
    o.imageUrl = imageUrl;
    hit++;
  }
}
if (!hit) {
  console.error("No org with exact name:", JSON.stringify(name));
  process.exit(1);
}

const newChunk = marker + JSON.stringify(orgs) + ";";
const out = html.slice(0, bounds.start) + newChunk + html.slice(bounds.endExclusive);

const bak =
  bundlePath + ".bak-org-" + new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19) + ".html";
fs.copyFileSync(bundlePath, bak);
fs.writeFileSync(bundlePath, out, "utf8");
console.log("Updated", hit, "row(s). Backup:", bak);
