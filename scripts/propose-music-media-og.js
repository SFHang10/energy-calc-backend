/**
 * Fetches venue listing URLs and proposes og:image (or twitter:image) rows
 * into data/music-media-candidates.json (approved: false).
 *
 * Run: node scripts/propose-music-media-og.js
 *      node scripts/propose-music-media-og.js --limit=5
 *      node scripts/propose-music-media-og.js --venue-id=5
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { galleryItemKey, candidateToGalleryItem } = require('./lib/music-media-gallery');

const ROOT = path.join(__dirname, '..');
const CANDIDATES_PATH = path.join(ROOT, 'data', 'music-media-candidates.json');
const VENUES_PATH = path.join(ROOT, 'data', 'music-venues.json');

const FETCH_TIMEOUT_MS = 12000;
const USER_AGENT =
  'GreenwaysLiveMusicFinder/1.0 (venue og:image proposal; +https://energy-calc-backend.onrender.com)';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function parseArg(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : null;
}

function extractOgImage(html) {
  if (!html || typeof html !== 'string') return '';
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      const url = m[1].trim();
      if (/^https?:\/\//i.test(url)) return url;
    }
  }
  return '';
}

function resolveUrl(base, maybeRelative) {
  try {
    return new URL(maybeRelative, base).href;
  } catch {
    return maybeRelative;
  }
}

function existingCandidateKeys(candidates) {
  const keys = new Set();
  for (const c of candidates) {
    const item = candidateToGalleryItem(c);
    if (item) keys.add(galleryItemKey(item));
    if (c.id) keys.add(`id:${c.id}`);
  }
  return keys;
}

function venueTargetUrl(venue) {
  const u = String(venue.url || venue.agendaUrl || '').trim();
  if (u && /^https?:\/\//i.test(u)) return u;
  return '';
}

async function fetchOgImage(pageUrl) {
  const res = await axios.get(pageUrl, {
    timeout: FETCH_TIMEOUT_MS,
    maxRedirects: 5,
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
    responseType: 'text',
    validateStatus: (s) => s >= 200 && s < 400
  });
  const raw = extractOgImage(res.data);
  return raw ? resolveUrl(pageUrl, raw) : '';
}

function main() {
  return run().catch((err) => {
    console.error(err.message || err);
    process.exitCode = 1;
  });
}

async function run() {
  const dryRun = process.argv.includes('--dry-run');
  const missingOnly = !process.argv.includes('--all-with-url');
  const limit = Math.max(1, Number(parseArg('limit')) || 20);
  const venueIdFilter = parseArg('venue-id');

  const venuesStore = readJson(VENUES_PATH);
  const items = venuesStore.items || [];
  const store = readJson(CANDIDATES_PATH);
  if (!Array.isArray(store.candidates)) store.candidates = [];

  const keys = existingCandidateKeys(store.candidates);
  let venues = items.filter((v) => venueTargetUrl(v));

  if (venueIdFilter != null) {
    venues = venues.filter((v) => String(v.id) === String(venueIdFilter));
  }
  if (missingOnly) {
    venues = venues.filter((v) => {
      const hasGallery = Array.isArray(v.mediaGallery) && v.mediaGallery.some((m) => m.type === 'image');
      const pending = store.candidates.some(
        (c) =>
          Number(c.venueId) === Number(v.id) &&
          c.type === 'image' &&
          c.approved !== true &&
          !c.mergedAt
      );
      return !v.imageUrl && !hasGallery && !pending;
    });
  }

  venues = venues.slice(0, limit);
  if (!venues.length) {
    console.log('No venues to probe (check --venue-id, --all-with-url, or URLs in music-venues.json).');
    return;
  }

  console.log('Probing', venues.length, 'venue URL(s) for og:image…');
  let added = 0;

  for (const venue of venues) {
    const pageUrl = venueTargetUrl(venue);
    let imageUrl = '';
    try {
      imageUrl = await fetchOgImage(pageUrl);
    } catch (err) {
      console.warn(`  ${venue.name}: fetch failed — ${err.message}`);
      continue;
    }
    if (!imageUrl) {
      console.warn(`  ${venue.name}: no og:image on ${pageUrl}`);
      continue;
    }

    const slug = String(venue.name || 'venue')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);
    const id = `mc-${slug}-og-${Date.now().toString(36)}`;
    const item = { type: 'image', url: imageUrl };
    const key = galleryItemKey(item);
    if (keys.has(key) || keys.has(`id:${id}`)) {
      console.log(`  ${venue.name}: already proposed`);
      continue;
    }

    const row = {
      id,
      venueId: venue.id,
      venueName: venue.name,
      type: 'image',
      url: imageUrl,
      caption: `From venue site (${venue.city || 'Netherlands'})`,
      source: 'og-image',
      sourceUrl: pageUrl,
      region: venue.city || 'Netherlands',
      approved: false,
      proposedAt: new Date().toISOString().slice(0, 10),
      mergedAt: null,
      notes: 'Review image rights/quality; prefer Wix upload for production.'
    };

    if (dryRun) {
      console.log(`  [dry-run] Would propose ${venue.name}:`, imageUrl.slice(0, 80) + '…');
    } else {
      store.candidates.push(row);
      keys.add(key);
      keys.add(`id:${id}`);
      added += 1;
      console.log(`  + ${venue.name}:`, imageUrl.slice(0, 72) + (imageUrl.length > 72 ? '…' : ''));
    }
  }

  if (!dryRun && added) {
    store.meta = {
      ...(store.meta || {}),
      lastProposedAt: new Date().toISOString()
    };
    writeJson(CANDIDATES_PATH, store);
  }

  console.log(dryRun ? 'Dry run complete.' : `Added ${added} proposal(s) to music-media-candidates.json`);
  if (added) console.log('Review rows → set "approved": true → npm run merge:music-media');
}

main();
