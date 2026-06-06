/**
 * Build a self-contained HTML for the Company Map by inlining companies data.
 * Input: HTMLS GWM GWB/European Company - Case Study Finder Enhanced .html
 * Data:  data/companies.json  (items array)
 * Output: HTMLS GWM GWB/European Company - Case Study Finder (Standalone).html
 */
const fs = require('fs');
const path = require('path');

const INPUT_HTML = path.join(process.cwd(), 'HTMLS GWM GWB', 'European Company - Case Study Finder Enhanced .html');
const DATA_JSON  = path.join(process.cwd(), 'data', 'companies.json');
const OUTPUT_HTML = path.join(process.cwd(), 'HTMLS GWM GWB', 'European Company - Case Study Finder (Standalone).html');

function main() {
  const html = fs.readFileSync(INPUT_HTML, 'utf8');
  const dataRaw = fs.readFileSync(DATA_JSON, 'utf8');
  const parsed = JSON.parse(dataRaw);
  const items = Array.isArray(parsed) ? parsed : parsed.items;
  if (!Array.isArray(items) || !items.length) {
    throw new Error('No items found in data/companies.json');
  }
  const inlineScript = `<script>\nwindow.COMPANIES_INLINE=${JSON.stringify(items)};\n</script>`;

  // Replace external companies-inline.js script with inline payload if present,
  // otherwise insert our inline script right before the main <script> that follows.
  let out = html;
  const externalTag = /<script\s+src=["']\.\.\/data\/companies-inline\.js["']><\/script>\s*/i;
  if (externalTag.test(out)) {
    out = out.replace(externalTag, inlineScript + '\n');
  } else {
    // Fallback: inject after opening <body ...> line
    out = out.replace(/<body[^>]*>\s*/i, (m) => m + '\n' + inlineScript + '\n');
  }

  // Ensure the body data-api-url uses absolute API but our code will skip network when inline is present
  // Nothing else to change.

  fs.writeFileSync(OUTPUT_HTML, out, 'utf8');
  console.log('Wrote standalone HTML:', OUTPUT_HTML);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('Standalone build failed:', e.message);
    process.exit(1);
  }
}

