/**
 * Syncs MUSIC_VENUES_FALLBACK in live-music-finder.html from data/music-venues.json
 * Run: node scripts/sync-music-venues-fallback.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const venuesPath = path.join(root, 'data', 'music-venues.json');
const htmlPath = path.join(root, 'HTMLS GWM GWB', 'live-music-finder.html');

const venues = JSON.parse(fs.readFileSync(venuesPath, 'utf8'));
let html = fs.readFileSync(htmlPath, 'utf8');

const replacement = `const MUSIC_VENUES_FALLBACK = ${JSON.stringify(venues.items)};`;
const re = /const MUSIC_VENUES_FALLBACK = \[[\s\S]*?\];/;
if (!re.test(html)) {
  console.error('MUSIC_VENUES_FALLBACK not found in', htmlPath);
  process.exitCode = 1;
  process.exit(1);
}

html = html.replace(re, replacement);
fs.writeFileSync(htmlPath, html);
console.log('Synced', venues.items.length, 'venues to live-music-finder.html fallback');
