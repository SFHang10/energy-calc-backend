/**
 * Merges approved rows from data/music-media-candidates.json into
 * data/music-venues.json → mediaGallery (and imageUrl when empty).
 *
 * Run: node scripts/merge-music-media-candidates.js
 *      node scripts/merge-music-media-candidates.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const { mergeGalleryItems, candidateToGalleryItem } = require('./lib/music-media-gallery');

const ROOT = path.join(__dirname, '..');
const CANDIDATES_PATH = path.join(ROOT, 'data', 'music-media-candidates.json');
const VENUES_PATH = path.join(ROOT, 'data', 'music-venues.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function resolveVenueIndex(items, candidate) {
  if (candidate.venueId != null) {
    const id = Number(candidate.venueId);
    const idx = items.findIndex((v) => Number(v.id) === id);
    if (idx >= 0) return idx;
  }
  const name = String(candidate.venueName || '').trim().toLowerCase();
  if (!name) return -1;
  return items.findIndex((v) => String(v.name || '').trim().toLowerCase() === name);
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');

  const store = readJson(CANDIDATES_PATH);
  const venuesStore = readJson(VENUES_PATH);
  const items = venuesStore.items || [];
  const candidates = Array.isArray(store.candidates) ? store.candidates : [];

  const toMerge = candidates.filter((c) => {
    if (!c || c.approved !== true) return false;
    if (c.mergedAt && !force) return false;
    return Boolean(candidateToGalleryItem(c));
  });

  if (!toMerge.length) {
    console.log('No approved, unmerged media candidates. Edit', path.relative(ROOT, CANDIDATES_PATH));
    return;
  }

  const byVenue = new Map();
  for (const c of toMerge) {
    const idx = resolveVenueIndex(items, c);
    if (idx < 0) {
      console.warn('Skip (venue not found):', c.id || c.venueName || c.venueId);
      continue;
    }
    if (!byVenue.has(idx)) byVenue.set(idx, []);
    byVenue.get(idx).push(c);
  }

  const mergedAt = new Date().toISOString().slice(0, 10);
  let venueCount = 0;
  let itemCount = 0;

  for (const [idx, group] of byVenue.entries()) {
    const venue = items[idx];
    const incoming = group.map(candidateToGalleryItem).filter(Boolean);
    const before = (venue.mediaGallery || []).length;
    venue.mediaGallery = mergeGalleryItems(venue.mediaGallery, incoming);
    const added = venue.mediaGallery.length - before;
    if (!venue.imageUrl) {
      const firstImage = venue.mediaGallery.find((m) => m.type === 'image');
      if (firstImage) venue.imageUrl = firstImage.url;
    }
    venueCount += 1;
    itemCount += group.length;
    group.forEach((c) => {
      c.mergedAt = mergedAt;
    });
    console.log(
      `  ${venue.name} (id ${venue.id}): +${Math.max(added, group.length)} item(s), gallery size ${venue.mediaGallery.length}`
    );
  }

  if (dryRun) {
    console.log('[dry-run] Would merge', itemCount, 'candidate(s) into', venueCount, 'venue(s).');
    return;
  }

  writeJson(VENUES_PATH, venuesStore);
  writeJson(CANDIDATES_PATH, store);
  console.log('Merged', itemCount, 'candidate(s) into', venueCount, 'venue(s).');
  console.log('Next: npm run sync:music-venues-fallback');
}

main();
