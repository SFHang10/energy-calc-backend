const path = require('path');
const fs = require('fs/promises');
const { buildEnergyTickerPayload } = require('./energy-ticker-service');
const { loadEnergySnapshot, formatChange } = require('./finance-agent-energy');
const { loadFinanceDailyReview } = require('./finance-daily-review');

const NEWS_FEED_PATH = path.join(__dirname, '..', 'data', 'finance-news-feed.json');
const WIRE_FEED_PATH = path.join(__dirname, '..', 'data', 'finance-wire-feed.json');

const LANE_LABELS = {
  news: 'News',
  funding: 'Funding',
  prices: 'Prices',
  policy: 'Policy'
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

function countLanes(items) {
  const lanes = { news: 0, funding: 0, prices: 0, policy: 0 };
  (items || []).forEach((item) => {
    const tag = String(item.tag || item.newsCategory || '').toUpperCase();
    if (tag === 'FUNDING') lanes.funding += 1;
    else if (tag === 'BRIEF' || tag === 'WIRE' || tag === 'WHOLESALE') lanes.prices += 1;
    else if (tag === 'POLICY' || tag === 'EU') lanes.policy += 1;
    else lanes.news += 1;
  });
  return lanes;
}

function mapSpotlightItem(item) {
  return {
    id: item.id,
    title: item.title || item.id,
    summary: item.summary || item.excerpt || '',
    tag: item.tag || item.newsCategory || 'News',
    source: item.source || 'Vincent finance feed',
    href: item.href || '/greenways/finance-news',
    date: item.date || item.edition || ''
  };
}

async function buildFinanceWireSnapshot() {
  const now = Date.now();
  if (snapshotCache && now - cacheTimestamp < CACHE_MS) {
    return snapshotCache;
  }

  const [ticker, energySnapshot, newsFeed, wireFeed, dailyReview, newsStat] = await Promise.all([
    buildEnergyTickerPayload(),
    loadEnergySnapshot(),
    loadJson(NEWS_FEED_PATH, { items: [], meta: {} }),
    loadJson(WIRE_FEED_PATH, { spotlights: [] }),
    loadFinanceDailyReview(),
    fs.stat(NEWS_FEED_PATH).catch(() => null)
  ]);

  const items = Array.isArray(newsFeed.items) ? newsFeed.items : [];
  const lanes = countLanes(items);
  const topLanes = Object.entries(lanes)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({
      code,
      name: LANE_LABELS[code] || code,
      count
    }));

  const spotlights = items.slice(0, 6).map(mapSpotlightItem);
  const focusMarket = (ticker.allEnergy || []).find((r) => r.code === 'NL') || (ticker.allEnergy || [])[0];
  const refreshedAt =
    (newsStat && newsStat.mtime.toISOString().slice(0, 10)) ||
    newsFeed.meta?.updatedAt ||
    newsFeed.meta?.briefDate ||
    wireFeed.updatedAt ||
    null;

  const daily = dailyReview
    ? {
        headline: dailyReview.headline,
        bullets: (dailyReview.bullets || []).slice(0, 4),
        meta: {
          briefDate: dailyReview.meta?.briefDate || null,
          generatedAt: dailyReview.meta?.generatedAt || null
        }
      }
    : newsFeed.meta?.dailyReview
      ? {
          headline: newsFeed.meta.dailyReview.headline,
          bullets: [],
          meta: { briefDate: newsFeed.meta.dailyReview.briefDate || null }
        }
      : null;

  const snapshot = {
    ok: true,
    generatedAt: new Date().toISOString(),
    source: 'finance-news-feed.json + energy ticker + finance-daily-review.json',
    hubCount: (ticker.allEnergy || []).length,
    renewableHubCount: (ticker.renewableShare || []).length,
    spotlightCount: items.length,
    lanes,
    topLanes,
    focusMarket: focusMarket
      ? {
          code: focusMarket.code,
          name: focusMarket.name,
          priceEurMwh: Number(focusMarket.priceEurMwh),
          changePct: Number(focusMarket.changePct),
          changeLabel: formatChange(focusMarket.changePct)
        }
      : null,
    ticker: {
      updatedAt: ticker.updatedAt,
      isLive: Boolean(ticker.isLive),
      source: ticker.source,
      allEnergy: ticker.allEnergy || [],
      renewableShare: ticker.renewableShare || []
    },
    modellingTariffs: energySnapshot.modellingTariffs || null,
    dailyReview: daily,
    spotlights,
    deskSpotlights: wireFeed.spotlights || [],
    meta: {
      edition: newsFeed.meta?.edition || null,
      illustrativeSpotlights: Boolean(wireFeed.meta && wireFeed.meta.illustrative),
      trustLine: refreshedAt
        ? `Finance wire from finance-news-feed.json + wholesale ticker · refreshed ${refreshedAt}`
        : 'Finance wire from finance-news-feed.json + wholesale ticker'
    }
  };

  snapshotCache = snapshot;
  cacheTimestamp = now;
  return snapshot;
}

module.exports = {
  buildFinanceWireSnapshot,
  LANE_LABELS
};
