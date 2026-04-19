/**
 * Writes content-ops/case-study-finder-missing-images.md — name-only list (empty imageUrl).
 * Run: node scripts/export-case-study-finder-missing-image-names.js
 */
const fs = require("fs");
const path = require("path");

const bundlePath = path.join(
  __dirname,
  "..",
  "HTMLS GWM GWB",
  "European Company - Case Study Finder (Standalone) - Wix bundle.html"
);

const outPath = path.join(
  __dirname,
  "..",
  "content-ops",
  "case-study-finder-missing-images.md"
);

const html = fs.readFileSync(bundlePath, "utf8");

function extractArrayAfterMarker(marker) {
  const i = html.indexOf(marker);
  if (i === -1) throw new Error("Could not find " + marker);
  let start = i + marker.length;
  while (start < html.length && /\s/.test(html[start])) start++;
  if (html[start] !== "[") throw new Error("Expected [ after " + marker);
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
        return JSON.parse(html.slice(start, j + 1));
      }
    }
  }
  throw new Error("Unclosed JSON array for " + marker);
}

function isEmptyUrl(u) {
  return u == null || String(u).trim() === "";
}

const companies = extractArrayAfterMarker("window.COMPANIES_INLINE=");
const names = companies
  .filter((o) => isEmptyUrl(o.imageUrl))
  .map((o) => o.name)
  .sort((a, b) => a.localeCompare(b, "en"));

const today = new Date().toISOString().slice(0, 10);

const lines = [
  `# Case Study Finder — names missing images`,
  ``,
  `Generated: **${today}** (rows in \`COMPANIES_INLINE\` with empty \`imageUrl\`).`,
  ``,
  `**${names.length}** organisations — add Wix media URLs when you have them.`,
  ``,
  `---`,
  ``,
  ...names.map((n) => `- ${n}`),
  ``,
];

fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log("Wrote", outPath, "count:", names.length);
