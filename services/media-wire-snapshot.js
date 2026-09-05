const path = require('path');
const fs = require('fs/promises');
const { loadFullNewsCatalog } = require('./media-news-loader');
const { loadMapCatalog } = require('./media-agent-companies');

const WIRE_FEED_PATH = path.join(__dirname, '..', 'data', 'media-wire-feed.json');
const VIDEO_PATH = path.join(__dirname, '..', 'data', 'wix-video-catalog.json');
const DAILY_BRIEF_PATH = path.join(__dirname, '..', 'data', 'media-daily-brief.json');

const LANE_LABELS = {
  news: 'News library',
  videos: 'Videos',
  map: 'Map profiles',
  sustainability: 'Sustainability',
  tech: 'New in Tech'
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

async function buildMediaWireSnapshot() {
  const now = Date.now();
  if (snapshotCache && now - cacheTimestamp < CACHE_MS) {
    return snapshotCache;
  }

  const [wireFeed, catalog, mapCatalog, videoCatalog, dailyBrief, briefStat] = await Promise.all([
    loadJson(WIRE_FEED_PATH, { spotlights: [] }),
    loadFullNewsCatalog().catch(() => ({ items: [], editions: [] })),
    loadMapCatalog(),
    loadJson(VIDEO_PATH, { videos: [] }),
    loadJson(DAILY_BRIEF_PATH, { meta: {}, stories: [] }),
    fs.stat(DAILY_BRIEF_PATH).catch(() => null)
  ]);

  const items = Array.isArray(catalog.items) ? catalog.items : [];
  const videos = Array.isArray(videoCatalog.videos) ? videoCatalog.videos : [];
  const caseStudies = Array.isArray(mapCatalog.caseStudies) ? mapCatalog.caseStudies : [];
  const directory = Array.isArray(mapCatalog.directory) ? mapCatalog.directory : [];
  const meta = dailyBrief.meta || {};

  const techCount = items.filter((row) => row.editionType === 'tech').length;
  const sustCount = items.length - techCount;

  const lanes = {
    news: items.length,
    videos: videos.length,
    map: caseStudies.length + directory.length,
    sustainability: meta.storyCount || sustCount,
    tech: meta.tech?.storyCount || techCount
  };

  const topLanes = [
    { code: 'news', name: LANE_LABELS.news, count: lanes.news },
    { code: 'videos', name: LANE_LABELS.videos, count: lanes.videos },
    { code: 'map', name: LANE_LABELS.map, count: lanes.map }
  ].filter((row) => row.count > 0);

  // Catalogue counts for wire marquee (not “new this week” — companies.json has no addedAt).
  const topMapLanes = [
    { code: 'case-studies', name: 'Case studies', count: caseStudies.length, deskTab: 'map' },
    { code: 'directory', name: 'Directory', count: directory.length, deskTab: 'map' },
    { code: 'map-total', name: 'Map profiles', count: lanes.map, deskTab: 'map' }
  ].filter((row) => row.count > 0);

  const mapHighlights = caseStudies
    .slice(0, 6)
    .map((row) => ({
      id: row.id || row.name,
      name: row.name || row.title || row.id || 'Organisation',
      kind: 'case-study',
      deskTab: 'map'
    }))
    .filter((row) => row.name);

  const headlines = (dailyBrief.stories || [])
    .slice(0, 8)
    .map((story) => ({
      id: story.id,
      title: story.title || story.id,
      edition: story.edition || meta.edition || '',
      editionType: story.editionType || 'sustainability'
    }));

  const refreshedAt =
    (briefStat && briefStat.mtime.toISOString().slice(0, 10)) ||
    (meta.generatedAt && String(meta.generatedAt).slice(0, 10)) ||
    wireFeed.updatedAt ||
    null;

  const snapshot = {
    ok: true,
    generatedAt: new Date().toISOString(),
    source: 'media-daily-brief.json + news catalog',
    totalNewsItems: meta.catalogItems || items.length,
    sustainabilityStories: lanes.sustainability,
    techStories: lanes.tech,
    videoCount: lanes.videos,
    mapCaseStudies: caseStudies.length,
    mapDirectory: directory.length,
    mapTotal: lanes.map,
    latestEdition: meta.edition || '',
    latestTechEdition: meta.tech?.edition || '',
    lanes,
    topLanes,
    topMapLanes,
    mapHighlights,
    headlines,
    spotlights: wireFeed.spotlights || [],
    meta: {
      illustrativeSpotlights: Boolean(wireFeed.meta && wireFeed.meta.illustrative),
      editionTitle: meta.editionTitle || '',
      countsTrust: 'live',
      laneTrust: 'live',
      mapCatalogueTrust: 'live',
      headlinesTrust: 'live',
      spotlightsTrust: wireFeed.meta && wireFeed.meta.illustrative ? 'illustrative' : 'live',
      trustLine: refreshedAt
        ? `Live counts from news catalog, map catalogue + daily brief · refreshed ${refreshedAt}`
        : 'Live counts from news catalog, map catalogue + daily brief',
      spotlightsTrustLine: wireFeed.meta && wireFeed.meta.illustrative
        ? 'Wire scan lane cards are illustrative quick links — content counts, map catalogue, and headlines above are live; full map and editions live on the media desk below'
        : 'Wire scan lanes from media wire feed'
    }
  };

  snapshotCache = snapshot;
  cacheTimestamp = now;
  return snapshot;
}

module.exports = {
  buildMediaWireSnapshot,
  LANE_LABELS
};
