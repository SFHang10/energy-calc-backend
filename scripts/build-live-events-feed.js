/**
 * Builds consumer-facing data/live-events-feed.json from:
 *   - data/live-events-seeds.json (curated rows + highlights)
 *   - data/live-events-weekly-input.json (optional approved agent rows)
 *
 * Run: node scripts/build-live-events-feed.js
 * Or: npm run build:live-events-feed
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEEDS_PATH = path.join(ROOT, 'data', 'live-events-seeds.json');
const WEEKLY_PATH = path.join(ROOT, 'data', 'live-events-weekly-input.json');
const VENUES_PATH = path.join(ROOT, 'data', 'music-venues.json');
const OUT_PATH = path.join(ROOT, 'data', 'live-events-feed.json');

const LANE_JAMS = new Set(['open-mic', 'open-jam', 'jazz', 'jams']);
const LANE_GIGS = new Set(['gigs', 'festival', 'concert']);

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function weeklyToFeedEvents(weekly, generatedAt) {
  if (!weekly || !Array.isArray(weekly.events)) return [];
  return weekly.events
    .filter((e) => e && e.title && e.approved !== false)
    .map((e, i) => ({
      id: e.id || `weekly-${i}-${Date.now()}`,
      category: e.category || 'gigs',
      date: e.date || 'TBC',
      title: e.title,
      line: e.line || '',
      venue: e.venue || '',
      venueId: e.venueId,
      desc: e.desc || e.line || '',
      href: e.href || '',
      web: e.web,
      webUrl: e.webUrl || e.href,
      email: e.email,
      phone: e.phone,
      source: e.source || 'weekly-intake',
      spotlight: Boolean(e.spotlight),
      isNew: Boolean(e.isNew),
      newHint: e.newHint || e.newBadgeHint || '',
      addedAt: e.addedAt || generatedAt.slice(0, 10)
    }));
}

function venueImageById() {
  const store = readJsonSafe(VENUES_PATH);
  const items = store?.items || (Array.isArray(store) ? store : []);
  const map = new Map();
  for (const v of items) {
    if (v && v.id != null && v.imageUrl) map.set(Number(v.id), v.imageUrl);
  }
  return map;
}

function attachVenueImages(events, venueImages) {
  return events.map((e) => {
    if (e.imageUrl || !e.venueId) return e;
    const img = venueImages.get(Number(e.venueId));
    return img ? { ...e, imageUrl: img } : e;
  });
}

function main() {
  const seeds = readJsonSafe(SEEDS_PATH);
  if (!seeds || !Array.isArray(seeds.events)) {
    console.error('Missing or invalid', SEEDS_PATH);
    process.exitCode = 1;
    return;
  }

  const generatedAt = new Date().toISOString();
  const weekly = readJsonSafe(WEEKLY_PATH);
  const venueImages = venueImageById();
  const merged = attachVenueImages(
    [...seeds.events, ...weeklyToFeedEvents(weekly, generatedAt)],
    venueImages
  );

  const jams = merged.filter((e) => LANE_JAMS.has(String(e.category || '').toLowerCase()));
  const gigs = merged.filter((e) => LANE_GIGS.has(String(e.category || '').toLowerCase()));
  const other = merged.filter(
    (e) => !LANE_JAMS.has(String(e.category || '').toLowerCase()) && !LANE_GIGS.has(String(e.category || '').toLowerCase())
  );

  const payload = {
    meta: {
      ...(seeds.meta || {}),
      version: 1,
      generatedAt,
      sources: ['live-events-seeds.json', 'live-events-weekly-input.json (approved rows)'],
      counts: { total: merged.length, jams: jams.length, gigs: gigs.length, other: other.length }
    },
    events: merged,
    lanes: { jams, gigs, other },
    highlights: Array.isArray(seeds.highlights) ? seeds.highlights : []
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));
  console.log('Written', path.relative(ROOT, OUT_PATH));
  console.log('Events:', merged.length, '| Jams lane:', jams.length, '| Gigs lane:', gigs.length);
}

main();
