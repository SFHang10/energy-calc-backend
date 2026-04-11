/**
 * Inlines data/orgs-directory-inline.js (and optionally companies-inline.js)
 * for Wix single-file uploads without ../data/ paths.
 *
 * Run: npm run build:finder-wix
 */
const fs = require("fs");
const path = require("path");

const gwb = path.join(__dirname, "..", "HTMLS GWM GWB");
const orgsPath = path.join(__dirname, "..", "data", "orgs-directory-inline.js");
const companiesPath = path.join(__dirname, "..", "data", "companies-inline.js");
const ORG_TAG = '<script src="../data/orgs-directory-inline.js"></script>';
const COMPANIES_TAG = '<script src="../data/companies-inline.js"></script>';

const pairs = [
  [
    "European Company - Case Study Finder Enhanced .html",
    "European Company - Case Study Finder Enhanced - Wix bundle.html",
    { inlineCompanies: true },
  ],
  [
    "European Company - Case Study Finder (Standalone).html",
    "European Company - Case Study Finder (Standalone) - Wix bundle.html",
    { inlineCompanies: true },
  ],
];

function main() {
  const orgs = fs.readFileSync(orgsPath, "utf8").trim();
  if (!orgs.includes("ORGS_DIRECTORY_INLINE")) {
    throw new Error("orgs file missing ORGS_DIRECTORY_INLINE — run: node scripts/build-orgs-directory-inline.js");
  }
  const orgsInline = `<script>\n${orgs}\n</script>`;
  const companies = fs.readFileSync(companiesPath, "utf8").trim();
  if (!companies.includes("COMPANIES_INLINE")) {
    throw new Error("companies-inline.js missing COMPANIES_INLINE");
  }
  const companiesInline = `<script>\n${companies}\n</script>`;

  for (const [srcName, outName, opts] of pairs) {
    const src = path.join(gwb, srcName);
    const out = path.join(gwb, outName);
    let html = fs.readFileSync(src, "utf8");
    if (!html.includes(ORG_TAG)) {
      throw new Error(`Expected external orgs script tag in ${srcName}`);
    }
    html = html.split(ORG_TAG).join(orgsInline);
    if (opts.inlineCompanies) {
      if (!html.includes(COMPANIES_TAG)) {
        throw new Error(`Expected companies-inline script tag in ${srcName}`);
      }
      html = html.split(COMPANIES_TAG).join(companiesInline);
    }
    fs.writeFileSync(out, html, "utf8");
    console.log("Wrote", outName);
  }
}

main();
