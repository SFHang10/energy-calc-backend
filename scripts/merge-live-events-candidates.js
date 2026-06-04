/**
 * Merges approved rows from data/live-events-candidates.json into
 * data/live-events-seeds.json, then rebuilds the public feed.
 *
 * Run: node scripts/merge-live-events-candidates.js
 *      node scripts/merge-live-events-candidates.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CANDIDATES_PATH = path.join(ROOT, 'data', 'live-events-candidates.json');
const SEEDS_PATH = path.join(ROOT, 'data', 'live-events-seeds.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function normalizeEvent(raw, fallbackId) {
  if (!raw || !raw.title) return null;
  const id =
    String(raw.id || '').trim() ||
    `cand-${String(raw.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40)}-${Date.now().toString(36)}`;
  return {
    id,
    category: raw.category || 'jazz',
    date: raw.date || 'TBC',
    title: raw.title,
    line: raw.line || '',
    venue: raw.venue || '',
    venueId: raw.venueId,
    desc: raw.desc || raw.line || '',
    href: raw.href || raw.webUrl || '',
    web: raw.web,
    webUrl: raw.webUrl || raw.href || '',
    email: raw.email,
    phone: raw.phone,
    source: raw.source || 'candidate',
    spotlight: raw.spotlight !== false,
    isNew: Boolean(raw.isNew),
    newHint: raw.newHint || '',
    addedAt: raw.addedAt || new Date().toISOString().slice(0, 10),
    imageUrl: raw.imageUrl || ''
  };
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const skipBuild = process.argv.includes('--skip-build');

  const store = readJson(CANDIDATES_PATH);
  const seeds = readJson(SEEDS_PATH);
  if (!Array.isArray(seeds.events)) seeds.events = [];

  const candidates = Array.isArray(store.candidates) ? store.candidates : [];
  const existingIds = new Set(seeds.events.map((e) => e.id).filter(Boolean));

  const toMerge = candidates.filter((c) => {
    if (!c || c.approved !== true) return false;
    if (c.mergedAt && !force) return false;
    const ev = c.event && typeof c.event === 'object' ? c.event : c;
    return ev && ev.title;
  });

  if (!toMerge.length) {
    console.log('No approved, unmerged event candidates.', path.relative(ROOT, CANDIDATES_PATH));
    return;
  }

  const mergedAt = new Date().toISOString().slice(0, 10);
  let added = 0;

  for (const c of toMerge) {
    const raw = c.event && typeof c.event === 'object' ? c.event : c;
    const row = normalizeEvent(raw, c.id);
    if (!row) continue;
    if (existingIds.has(row.id) && !force) {
      console.warn('Skip duplicate id:', row.id);
      continue;
    }
    if (dryRun) {
      console.log('  [dry-run] Would add event:', row.title, row.venueId ? `(venue ${row.venueId})` : '');
    } else {
      seeds.events.push(row);
      existingIds.add(row.id);
      c.mergedAt = mergedAt;
      added += 1;
      console.log('  + event:', row.id, '—', row.title);
    }
  }

  if (dryRun) {
    console.log('[dry-run] Would add', toMerge.length, 'event(s).');
    return;
  }

  writeJson(SEEDS_PATH, seeds);
  writeJson(CANDIDATES_PATH, store);
  console.log('Added', added, 'event(s) to live-events-seeds.json');

  if (!skipBuild) {
    execSync('node scripts/build-live-events-feed.js', { cwd: ROOT, stdio: 'inherit' });
  }
}

main();
