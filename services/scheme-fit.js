/**
 * Scheme Fit — heuristic shortlist by region + equipment lane (not formal eligibility).
 */
const path = require('path');
const fs = require('fs/promises');
const {
  loadSchemes,
  rankSchemes,
  schemeMatchesRegion,
  primaryLink,
  schemeHaystack
} = require('./greenways-agent-shared');

const lanesPath = path.join(__dirname, '..', 'data', 'scheme-fit-lanes.json');
let lanesCache = null;

async function loadLanesBundle() {
  if (lanesCache) return lanesCache;
  const raw = await fs.readFile(lanesPath, 'utf8');
  lanesCache = JSON.parse(raw);
  return lanesCache;
}

function whyFit(scheme, lane) {
  const hay = schemeHaystack(scheme);
  const hits = (lane.tokens || []).filter((t) => hay.includes(String(t).toLowerCase()));
  if (hits.length) return `Matched: ${hits.slice(0, 4).join(', ')}`;
  if (scheme.priority) return 'Priority catalogue row for this region';
  return 'Ranked for restaurant / efficiency context';
}

function toFitRow(scheme, lane) {
  return {
    id: scheme.id,
    title: scheme.title,
    region: scheme.region,
    type: scheme.type || '',
    description: String(scheme.description || '').slice(0, 220),
    deadline: scheme.deadline || null,
    status: scheme.status || null,
    maxFunding: scheme.maxFunding || null,
    url: primaryLink(scheme) || '',
    whyFit: whyFit(scheme, lane),
    priority: !!scheme.priority
  };
}

async function getSchemeFitPayload({ region = 'nl', laneId = 'fridge', limit = 8 } = {}) {
  const bundle = await loadLanesBundle();
  const regions = bundle.regions || [];
  const lanes = bundle.lanes || [];
  const regionRow = regions.find((r) => r.id === region) || regions.find((r) => r.id === 'nl') || regions[0];
  const lane = lanes.find((l) => l.id === laneId) || lanes.find((l) => l.id === 'fridge') || lanes[0];
  if (!lane || !regionRow) return null;

  const schemes = await loadSchemes();
  const regionId = regionRow.id;
  const regional = schemes.filter(
    (s) => schemeMatchesRegion(s, regionId) || (regionId !== 'eu' && String(s.region || '').toLowerCase() === 'eu')
  );
  const pool = regional.length ? regional : schemes;
  const profile = { region: regionId, sector: 'restaurant', focus: 'equipment' };
  const ranked = rankSchemes(pool, lane.query || lane.title, profile, Math.max(limit * 2, 12));
  const picks = (ranked.length ? ranked : pool.slice(0, limit)).slice(0, limit).map((s) => toFitRow(s, lane));

  return {
    ok: true,
    meta: bundle.meta || {},
    region: regionRow,
    lane,
    availableRegions: regions.map((r) => ({ id: r.id, title: r.title, blurb: r.blurb })),
    availableLanes: lanes.map((l) => ({ id: l.id, title: l.title, blurb: l.blurb })),
    schemes: picks,
    totals: {
      matched: picks.length,
      catalogueScanned: pool.length
    },
    trustNote: (bundle.meta && bundle.meta.trustNote) || ''
  };
}

module.exports = {
  loadLanesBundle,
  getSchemeFitPayload
};
