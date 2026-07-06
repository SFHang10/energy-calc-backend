/**
 * Parse a saved export of greenwaysbuildings.com/greenways (markdown)
 * into data/wix-youtube-channels.json for Cheryce's media agent.
 *
 * Usage: node scripts/parse-greenways-wix-youtube.js [path-to-export.md]
 */

const fs = require('fs');
const path = require('path');
const {
  parseGreenwaysExport,
  buildCatalogPayload
} = require('../services/greenways-youtube-parser');

const DEFAULT_INPUT = path.join(__dirname, '../uploads/greenways-0.md');
const OUTPUT_PATH = path.join(__dirname, '../data/wix-youtube-channels.json');

function main() {
  const inputPath = process.argv[2] || DEFAULT_INPUT;
  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(inputPath, 'utf8');
  const videos = parseGreenwaysExport(markdown);
  const withIds = videos.filter((v) => v.videoId).length;

  const payload = buildCatalogPayload(videos, {
    description:
      'Curated YouTube videos synced into Wix Video channels on /greenways. Refresh by re-exporting the page and running this script.'
  });

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`✅ Wrote ${videos.length} videos (${withIds} with YouTube IDs) to ${OUTPUT_PATH}`);
}

main();
