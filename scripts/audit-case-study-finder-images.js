/**
 * One-off audit: COMPANIES_INLINE + ORGS_DIRECTORY_INLINE imageUrl classification.
 * Run: node scripts/audit-case-study-finder-images.js
 */
const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "..",
  "HTMLS GWM GWB",
  "European Company - Case Study Finder (Standalone) - Wix bundle.html"
);

const html = fs.readFileSync(file, "utf8");

/** Extract a top-level JSON array after `window.NAME=` (handles `]; // comment`). */
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

function classify(url) {
  if (url == null || String(url).trim() === "") return "empty";
  const u = String(url).trim();
  if (/^data:/i.test(u)) return "data_uri";
  if (/static\.wixstatic\.com/i.test(u)) return "wix_official";
  if (/upload\.wikimedia\.org|wikimedia\.org/i.test(u)) return "wikipedia";
  if (/placeholder|placehold|via\.placeholder|dummyimage|picsum/i.test(u)) {
    return "placeholder_service";
  }
  if (/^https?:\/\//i.test(u)) return "other_http";
  return "other";
}

function summarize(list) {
  const rows = [];
  for (const o of list) {
    const cls = classify(o.imageUrl);
    rows.push({ name: o.name, id: o.id, cls, imageUrl: o.imageUrl });
  }
  const byCls = {};
  for (const r of rows) {
    byCls[r.cls] = (byCls[r.cls] || 0) + 1;
  }
  return { total: list.length, byCls, rows };
}

const companies = extractArrayAfterMarker("window.COMPANIES_INLINE=");
const orgs = extractArrayAfterMarker("window.ORGS_DIRECTORY_INLINE=");

const s1 = summarize(companies);
const s2 = summarize(orgs);

const needWork = (r) => r.cls !== "wix_official";
const bad1 = s1.rows.filter(needWork);
const bad2 = s2.rows.filter(needWork);

console.log("File:", file);
console.log("");
console.log("COMPANIES_INLINE (case-study pins)");
console.log("  total:", s1.total);
console.log("  by imageUrl type:", s1.byCls);
console.log("  not Wix official (needs upload or empty fix):", bad1.length);
console.log("");
console.log("ORGS_DIRECTORY_INLINE (directory orgs)");
console.log("  total:", s2.total);
console.log("  by imageUrl type:", s2.byCls);
console.log("  not Wix official (needs upload or empty fix):", bad2.length);
console.log("");
console.log("COMBINED not Wix official:", bad1.length + bad2.length);
console.log("");

const byReason = {};
for (const r of [...bad1, ...bad2]) {
  byReason[r.cls] = (byReason[r.cls] || 0) + 1;
}
console.log("Combined breakdown (non-Wix only):", byReason);
console.log("");

console.log("--- COMPANIES_INLINE: non-Wix (all) ---");
bad1.forEach((r) => console.log(`  [${r.cls}] ${r.name}`));

console.log("");
console.log("--- ORGS_DIRECTORY_INLINE: non-Wix (first 80) ---");
bad2.slice(0, 80).forEach((r) => console.log(`  [${r.cls}] ${r.name}`));
if (bad2.length > 80) {
  console.log(`  ... and ${bad2.length - 80} more`);
}
