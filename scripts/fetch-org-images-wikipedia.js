/**
 * Fetches Wikipedia article thumbnails for organisations listed in
 * HTMLS GWM GWB/400 countries.html via the Wikimedia Action API.
 *
 * Policy: https://foundation.wikimedia.org/wiki/Policy:User-Agent_policy
 * Images are subject to Wikimedia / Commons licensing — we store the article
 * URL for attribution in the map popup.
 *
 * Usage:
 *   node scripts/fetch-org-images-wikipedia.js           # fill missing ids only
 *   node scripts/fetch-org-images-wikipedia.js --all   # refetch all
 *   node scripts/fetch-org-images-wikipedia.js --limit=20
 *
 * Outputs: data/org-wikipedia-images.json
 * Optional overrides (merged on top): data/org-wikipedia-images.manual.json
 *   Shape: { "1": { "thumbnail": "https://...", "pageTitle": "...", "article": "https://en.wikipedia.org/wiki/..." } }
 *   Keys are org numbers (n) from 400 countries.html — manual entries are never overwritten by fetch.
 *
 * Then: npm run build:orgs-directory
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "HTMLS GWM GWB", "400 countries.html");
const outPath = path.join(root, "data", "org-wikipedia-images.json");
const manualPath = path.join(root, "data", "org-wikipedia-images.manual.json");

/** Required by Wikimedia — identify the tool; change contact if you ship publicly. */
const USER_AGENT =
  "GreenwaysOrgDirectory/1.0 (https://github.com/energy-cal-backend; organisational directory thumbnails) Node.js";

const DELAY_MS = 400;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const a = process.argv.slice(2);
  return {
    all: a.includes("--all"),
    limit: (() => {
      const x = a.find((s) => s.startsWith("--limit="));
      return x ? Math.max(1, parseInt(x.slice(8), 10) || 0) : 0;
    })(),
  };
}

function parseOrgsFromHtml() {
  const html = fs.readFileSync(htmlPath, "utf8");
  const i = html.indexOf("const orgs = [");
  if (i < 0) throw new Error("const orgs = [ not found");
  const j = html.indexOf("\n];", i);
  if (j < 0) throw new Error("closing ]; not found");
  const expr = html.slice(i + "const orgs = ".length, j + 2);
  // eslint-disable-next-line no-eval
  return eval(expr);
}

function searchVariants(name) {
  const trimmed = name.trim();
  const out = [trimmed];
  const noParens = trimmed.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (noParens && noParens !== trimmed) out.push(noParens);
  const noSuffix = trimmed.replace(/\s*\([^)]*\)\s*$/u, "").trim();
  if (noSuffix && !out.includes(noSuffix)) out.push(noSuffix);
  return [...new Set(out)];
}

async function fetchWikiThumbnail(searchTerm) {
  const u = new URL("https://en.wikipedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("format", "json");
  u.searchParams.set("generator", "search");
  u.searchParams.set("gsrsearch", searchTerm);
  u.searchParams.set("gsrlimit", "6");
  u.searchParams.set("gsrnamespace", "0");
  u.searchParams.set("prop", "pageimages");
  u.searchParams.set("piprop", "thumbnail");
  u.searchParams.set("pithumbsize", "320");

  const r = await fetch(u, { headers: { "User-Agent": USER_AGENT } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const pages = j.query && j.query.pages;
  if (!pages) return null;

  const list = Object.values(pages);
  for (const p of list) {
    if (p.pageid < 0) continue;
    if (p.thumbnail && p.thumbnail.source) {
      const title = p.title;
      const slug = title.replace(/ /g, "_");
      const article = `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
      return {
        thumbnail: p.thumbnail.source,
        pageTitle: title,
        article,
      };
    }
  }
  return null;
}

async function pickThumbnailForOrg(org) {
  for (const q of searchVariants(org.name)) {
    const hit = await fetchWikiThumbnail(q);
    await sleep(DELAY_MS);
    if (hit) return hit;
  }
  return null;
}

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function normalizeStore(raw) {
  if (raw && raw.entries && typeof raw.entries === "object") return { ...raw.entries };
  if (raw && typeof raw === "object") {
    const { _meta, ...rest } = raw;
    return rest;
  }
  return {};
}

function main() {
  const { all, limit } = parseArgs();
  const orgs = parseOrgsFromHtml();

  const manualOnly = normalizeStore(loadJson(manualPath));
  let entries = normalizeStore(loadJson(outPath));
  entries = { ...entries, ...manualOnly };

  let processed = 0;

  (async () => {
    for (const org of orgs) {
      const key = String(org.n);
      if (!all && entries[key] && (entries[key].thumbnail || entries[key].miss || entries[key].error))
        continue;
      if (manualOnly[key]) continue;

      if (limit && processed >= limit) break;

      process.stdout.write(`#${org.n} ${org.name.slice(0, 50)}… `);
      try {
        const hit = await pickThumbnailForOrg(org);
        if (hit) {
          entries[key] = {
            thumbnail: hit.thumbnail,
            pageTitle: hit.pageTitle,
            article: hit.article,
            fetchedAt: new Date().toISOString(),
          };
          console.log("OK");
        } else {
          entries[key] = { miss: true, checkedAt: new Date().toISOString() };
          console.log("no image");
        }
      } catch (e) {
        console.log("ERR", e.message);
        entries[key] = { error: String(e.message), checkedAt: new Date().toISOString() };
      }
      processed++;

      fs.writeFileSync(
        outPath,
        JSON.stringify(
          {
            _meta: {
              updatedAt: new Date().toISOString(),
              note: "Thumbnails from English Wikipedia; check licenses on Commons. See article link in each entry.",
            },
            entries,
          },
          null,
          2
        ),
        "utf8"
      );
    }

    console.log("Done. Run: npm run build:orgs-directory");
  })();
}

main();
