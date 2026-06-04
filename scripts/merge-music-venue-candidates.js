/**
 * Merges approved rows from data/music-venue-candidates.json into data/music-venues.json.
 * Modes: create (new pin) | enrich (fill empty fields on existing venueId).
 *
 * Run: node scripts/merge-music-venue-candidates.js
 *      node scripts/merge-music-venue-candidates.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const {
  CREATE_REQUIRED,
  ENRICH_FIELDS,
  isEmptyValue,
  shouldApplyField,
  pickVenuePayload
} = require('./lib/music-venue-fields');

const ROOT = path.join(__dirname, '..');
const CANDIDATES_PATH = path.join(ROOT, 'data', 'music-venue-candidates.json');
const VENUES_PATH = path.join(ROOT, 'data', 'music-venues.json');

const GENRE_COLORS = {
  jazz: '#c45e0a',
  'open-mic': '#e9c46a',
  'open-jam': '#2a9d8f',
  'gypsy-swing': '#f4845f',
  mixed: '#6c91c2',
  'live-music': '#8ecae6',
  other: '#aaa'
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function nextVenueId(items) {
  return items.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0) + 1;
}

function normalizeGenre(g) {
  const s = String(g || 'other').toLowerCase().trim();
  if (GENRE_COLORS[s]) return s;
  if (s.includes('open jam')) return 'open-jam';
  if (s.includes('open mic')) return 'open-mic';
  if (s.includes('jazz')) return 'jazz';
  if (s.includes('gypsy') || s.includes('swing')) return 'gypsy-swing';
  return 'other';
}

function applyPayload(target, payload, options) {
  const { overwriteAll, overwriteFields } = options;
  let changed = 0;
  for (const field of ENRICH_FIELDS) {
    if (payload[field] === undefined) continue;
    let val = payload[field];
    if (field === 'genre') val = normalizeGenre(val);
    if (field === 'vibeTags' && !Array.isArray(val)) {
      val = String(val)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (!shouldApplyField(field, target[field], val, overwriteAll, overwriteFields)) continue;
    target[field] = val;
    if (field === 'genre') target.color = GENRE_COLORS[target.genre] || GENRE_COLORS.other;
    changed += 1;
  }
  return changed;
}

function resolveEnrichIndex(items, candidate) {
  if (candidate.venueId != null) {
    const id = Number(candidate.venueId);
    const idx = items.findIndex((v) => Number(v.id) === id);
    if (idx >= 0) return idx;
  }
  const name = String(candidate.venueName || candidate.venue?.name || '').trim().toLowerCase();
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
    return true;
  });

  if (!toMerge.length) {
    console.log('No approved, unmerged venue candidates.', path.relative(ROOT, CANDIDATES_PATH));
    return;
  }

  const mergedAt = new Date().toISOString().slice(0, 10);
  let created = 0;
  let enriched = 0;

  for (const c of toMerge) {
    const mode = String(c.mode || (c.venueId ? 'enrich' : 'create')).toLowerCase();
    const payload = pickVenuePayload(c);
    const overwriteAll = c.overwrite === true;
    const overwriteFields = c.overwriteFields;

    if (mode === 'create') {
      let skipCreate = false;
      for (const req of CREATE_REQUIRED) {
        if (isEmptyValue(payload[req])) {
          console.warn('Skip create (missing ' + req + '):', c.id || payload.name);
          skipCreate = true;
          break;
        }
      }
      if (skipCreate) continue;
      const row = {
        youtubeVideos: [],
        mediaGallery: [],
        verificationStatus: 'unverified',
        lastVerified: new Date().toISOString().slice(0, 10),
        source: c.source || 'candidate',
        city: 'Amsterdam',
        country: 'Netherlands',
        lng: 4.9041,
        lat: 52.3676,
        ...payload
      };
      row.id = nextVenueId(items);
      row.genre = normalizeGenre(row.genre);
      row.color = GENRE_COLORS[row.genre] || GENRE_COLORS.other;
      if (!row.mapsUrl && row.address) {
        row.mapsUrl =
          'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(row.address);
      }
      items.push(row);
      c.mergedVenueId = row.id;
      created += 1;
      console.log(`  + create #${row.id} ${row.name}`);
    } else {
      const idx = resolveEnrichIndex(items, c);
      if (idx < 0) {
        console.warn('Skip enrich (venue not found):', c.id || c.venueName || c.venueId);
        continue;
      }
      const n = applyPayload(items[idx], payload, { overwriteAll, overwriteFields });
      c.mergedVenueId = items[idx].id;
      enriched += 1;
      console.log(`  ~ enrich #${items[idx].id} ${items[idx].name} (${n} field(s))`);
    }
    c.mergedAt = mergedAt;
  }

  if (dryRun) {
    console.log('[dry-run] Would create', created, 'and enrich', enriched, 'venue(s).');
    return;
  }

  venuesStore.items = items;
  writeJson(VENUES_PATH, venuesStore);
  writeJson(CANDIDATES_PATH, store);
  console.log('Done. Created', created, ', enriched', enriched, '.');
  console.log('Next: npm run propose:music-media-og  (optional) → merge:music-media → merge:music-discovery');
}

main();
