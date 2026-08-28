const path = require('path');
const fs = require('fs/promises');

const FEED_PATH = path.join(__dirname, '..', 'data', 'deals-feed.json');
const WIRE_FEED_PATH = path.join(__dirname, '..', 'data', 'deals-wire-feed.json');

const LANE_LABELS = {
  energy: 'Energy',
  water: 'Water',
  sustainability: 'Sustainability'
};

let snapshotCache = null;
let cacheTimestamp = 0;
const CACHE_MS = 5 * 60 * 1000;

async function loadJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

async function buildDealsWireSnapshot() {
  const now = Date.now();
  if (snapshotCache && now - cacheTimestamp < CACHE_MS) {
    return snapshotCache;
  }

  const [feed, wireFeed, feedStat] = await Promise.all([
    loadJson(FEED_PATH, { deals: [], highlights: [], meta: {} }),
    loadJson(WIRE_FEED_PATH, { spotlights: [] }),
    fs.stat(FEED_PATH).catch(() => null)
  ]);

  const deals = Array.isArray(feed.deals) ? feed.deals : [];
  const lanes = { energy: 0, water: 0, sustainability: 0 };
  const regions = {};
  let newCount = 0;

  deals.forEach((deal) => {
    const cat = String(deal.category || 'sustainability').toLowerCase();
    if (lanes[cat] != null) lanes[cat] += 1;
    else lanes.sustainability += 1;

    const region = String(deal.region || 'EU').toUpperCase();
    regions[region] = (regions[region] || 0) + 1;
    if (deal.isNew) newCount += 1;
  });

  const topLanes = Object.entries(lanes)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({
      code,
      name: LANE_LABELS[code] || code,
      count
    }));

  const newThisMonth = deals
    .filter((deal) => deal.isNew)
    .slice(0, 6)
    .map((deal) => ({
      id: deal.id,
      title: deal.title || deal.id,
      category: deal.category || '',
      region: deal.region || ''
    }));

  const showcase = (feed.highlights || []).slice(0, 6).map((row) => ({
    label: row.title || row.id,
    category: row.category || '',
    cta: row.cta || ''
  }));

  const refreshedAt =
    (feedStat && feedStat.mtime.toISOString().slice(0, 10)) ||
    (feed.meta && feed.meta.generatedAt && String(feed.meta.generatedAt).slice(0, 10)) ||
    wireFeed.updatedAt ||
    null;

  const snapshot = {
    ok: true,
    generatedAt: new Date().toISOString(),
    source: 'deals-feed.json',
    totalDeals: deals.length,
    newCount,
    lanes,
    topLanes,
    regions,
    newThisMonth,
    showcase,
    highlights: (feed.highlights || []).slice(0, 3),
    spotlights: wireFeed.spotlights || [],
    meta: {
      illustrativeSpotlights: Boolean(wireFeed.meta && wireFeed.meta.illustrative),
      trustLine: refreshedAt
        ? `Deals feed from deals-feed.json · refreshed ${refreshedAt}`
        : 'Deals feed from deals-feed.json'
    }
  };

  snapshotCache = snapshot;
  cacheTimestamp = now;
  return snapshot;
}

module.exports = {
  buildDealsWireSnapshot,
  LANE_LABELS
};
