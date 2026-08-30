const path = require('path');
const fs = require('fs/promises');

const SCHEMES_PATH = path.join(__dirname, '..', 'schemes.json');
const FEED_PATH = path.join(__dirname, '..', 'data', 'grants-wire-feed.json');

const REGION_LABELS = {
  uk: 'United Kingdom',
  nl: 'Netherlands',
  eu: 'EU-wide',
  ie: 'Ireland',
  de: 'Germany',
  fr: 'France',
  be: 'Belgium',
  es: 'Spain',
  pt: 'Portugal'
};

let snapshotCache = null;
let cacheTimestamp = 0;
const CACHE_MS = 5 * 60 * 1000;

function parseDeadlineValue(deadline) {
  const raw = String(deadline || '').trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}$/.test(raw)) return `${raw}-12-31`;
  return null;
}

async function loadJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

async function buildGrantsWireSnapshot() {
  const now = Date.now();
  if (snapshotCache && now - cacheTimestamp < CACHE_MS) {
    return snapshotCache;
  }

  const [schemes, feed, schemesStat] = await Promise.all([
    loadJson(SCHEMES_PATH, []),
    loadJson(FEED_PATH, { spotlights: [], spotlightSchemeIds: [] }),
    fs.stat(SCHEMES_PATH).catch(() => null)
  ]);

  const regions = {};
  const types = {};
  let activeSchemes = 0;
  const upcomingDeadlines = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + 120);

  (Array.isArray(schemes) ? schemes : []).forEach((scheme) => {
    const status = String(scheme.status || 'active').toLowerCase();
    if (!scheme.status || status === 'active') activeSchemes += 1;

    const region = String(scheme.region || 'other').toLowerCase();
    regions[region] = (regions[region] || 0) + 1;

    const type = String(scheme.type || 'scheme').toLowerCase();
    types[type] = (types[type] || 0) + 1;

    const deadline = parseDeadlineValue(scheme.deadline);
    if (!deadline) return;
    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) return;
    if (deadlineDate >= today && deadlineDate <= horizon) {
      upcomingDeadlines.push({
        id: scheme.id,
        title: scheme.title || scheme.id,
        region: scheme.region || '',
        deadline,
        type: scheme.type || ''
      });
    }
  });

  upcomingDeadlines.sort((a, b) => a.deadline.localeCompare(b.deadline));

  const schemeById = new Map((Array.isArray(schemes) ? schemes : []).map((row) => [row.id, row]));
  const spotlightIds = (feed.spotlightSchemeIds || []).filter(Boolean);
  const spotlightSchemes = spotlightIds
    .map((id) => {
      const scheme = schemeById.get(id);
      if (!scheme) return null;
      return {
        id: scheme.id,
        title: scheme.title || scheme.id,
        region: scheme.region || '',
        type: scheme.type || '',
        deadline: scheme.deadline || '',
        maxFunding: scheme.maxFunding || ''
      };
    })
    .filter(Boolean);

  const refreshedAt =
    (schemesStat && schemesStat.mtime.toISOString().slice(0, 10)) || feed.updatedAt || null;

  const snapshot = {
    ok: true,
    generatedAt: new Date().toISOString(),
    source: 'schemes.json',
    totalSchemes: Array.isArray(schemes) ? schemes.length : 0,
    activeSchemes,
    regions,
    types,
    topRegions: Object.entries(regions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([code, count]) => ({
        code,
        name: REGION_LABELS[code] || code.toUpperCase(),
        count
      })),
    upcomingDeadlines: upcomingDeadlines.slice(0, 8),
    spotlightSchemes,
    spotlights: feed.spotlights || [],
    meta: {
      illustrativeSpotlights: Boolean(feed.meta && feed.meta.illustrative),
      countsTrust: 'live',
      deadlineTrust: 'live',
      schemePicksTrust: spotlightSchemes.length ? 'live' : 'illustrative',
      spotlightsTrust: feed.meta && feed.meta.illustrative ? 'illustrative' : 'live',
      trustLine: refreshedAt
        ? `Live scheme catalogue from schemes.json · refreshed ${refreshedAt}`
        : 'Live scheme catalogue from schemes.json',
      spotlightsTrustLine: feed.meta && feed.meta.illustrative
        ? 'Desk spotlight cards are illustrative curated links — counts and deadlines above are live'
        : 'Desk spotlights from grants wire feed'
    }
  };

  snapshotCache = snapshot;
  cacheTimestamp = now;
  return snapshot;
}

module.exports = {
  buildGrantsWireSnapshot,
  REGION_LABELS
};
