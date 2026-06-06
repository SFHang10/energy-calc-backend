const fs = require('fs');
const path = require('path');

const DEALS_PATH = path.join(__dirname, '..', 'data', 'deals-feed.json');
const SCHEMES_PATH = path.join(__dirname, '..', 'schemes.json');
const PROFILES_PATH = path.join(__dirname, '..', 'data', 'assistant-site-profiles.json');

function envInt(name, fallback) {
  const n = parseInt(process.env[name], 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const cache = {
  profiles: { mtime: null, data: null },
  deals: { mtime: null, data: null },
  schemes: { mtime: null, data: null }
};

function readJsonCached(filePath, bucket) {
  try {
    const st = fs.statSync(filePath);
    if (!cache[bucket].data || cache[bucket].mtime !== st.mtimeMs) {
      const raw = fs.readFileSync(filePath, 'utf8');
      cache[bucket].data = JSON.parse(raw);
      cache[bucket].mtime = st.mtimeMs;
    }
    return cache[bucket].data;
  } catch {
    return null;
  }
}

function loadProfilesDoc() {
  const doc = readJsonCached(PROFILES_PATH, 'profiles');
  if (!doc || typeof doc !== 'object') {
    return {
      default: {
        siteLabel: 'Restaurant site',
        country: 'NL',
        regionCodes: ['nl', 'eu'],
        priorityUtilities: ['electricity', 'gas', 'water'],
        segment: 'hospitality',
        notes: ''
      }
    };
  }
  return doc;
}

function mergeProfile(base, extra) {
  return {
    ...base,
    ...extra,
    regionCodes: extra.regionCodes || base.regionCodes,
    priorityUtilities: extra.priorityUtilities || base.priorityUtilities
  };
}

/**
 * Resolve restaurant / operator profile: default → byCompanyId → w2w portfolio (if site id matches) → bySiteId.
 */
function resolveRestaurantProfile(siteId, companyId) {
  const doc = loadProfilesDoc();
  let profile = { ...(doc.default || {}) };
  const sid = String(siteId || '').trim();
  const cid = String(companyId || '').trim();

  if (cid && doc.byCompanyId && doc.byCompanyId[cid]) {
    profile = mergeProfile(profile, doc.byCompanyId[cid]);
  }
  if (sid && (sid.startsWith('w2w-') || /wok/i.test(sid))) {
    profile = mergeProfile(profile, doc.w2wPortfolio || {});
  }
  if (sid && doc.bySiteId && doc.bySiteId[sid]) {
    profile = mergeProfile(profile, doc.bySiteId[sid]);
  }
  return profile;
}

function regionMatch(dealRegion, country) {
  const dr = String(dealRegion || '').toUpperCase();
  const c = String(country || '').toUpperCase();
  if (!dr || dr === 'EU') return 1;
  if (dr === c) return 3;
  if (c === 'NL' && dr === 'NL') return 3;
  return 0;
}

function utilityTagScore(tags, priorityUtilities) {
  const pu = (priorityUtilities || []).map((u) => String(u).toLowerCase());
  const tagL = (tags || []).map((t) => String(t).toLowerCase());
  let score = 0;
  for (const u of pu) {
    const idx = pu.indexOf(u);
    const weight = Math.max(1, pu.length - idx);
    for (const t of tagL) {
      if (t.includes(u) || u.includes(t)) score += 2 * weight;
    }
  }
  return score;
}

function buildDealsContext(restaurantProfile, dealsFeed) {
  const deals = Array.isArray(dealsFeed?.deals) ? [...dealsFeed.deals] : [];
  const pri = restaurantProfile.priorityUtilities || ['gas', 'electricity'];
  const country = restaurantProfile.country || 'NL';

  deals.sort((a, b) => {
    const sa = utilityTagScore(a.tags, pri) + regionMatch(a.region, country);
    const sb = utilityTagScore(b.tags, pri) + regionMatch(b.region, country);
    return sb - sa;
  });

  const topDeals = deals.slice(0, 12).map((d) => ({
    id: d.id,
    category: d.category,
    title: d.title,
    line: d.line,
    region: d.region,
    tags: d.tags,
    href: d.href
  }));

  const highlights = (dealsFeed?.highlights || []).slice(0, 6).map((h) => ({
    id: h.id,
    category: h.category,
    title: h.title,
    desc: h.desc,
    cta: h.cta
  }));

  return {
    feedGeneratedAt: dealsFeed?.meta?.generatedAt || null,
    feedSummary: dealsFeed?.meta?.summary || '',
    topDeals,
    highlights
  };
}

function schemeRegionOk(schemeRegion, regionCodes) {
  const sr = String(schemeRegion || 'eu').toLowerCase();
  const rc = (regionCodes || ['eu', 'nl']).map((r) => String(r).toLowerCase());
  if (rc.includes(sr)) return true;
  if (sr === 'eu' && rc.includes('eu')) return true;
  return false;
}

function schemeKeywordScore(scheme, restaurantProfile) {
  const pri = (restaurantProfile.priorityUtilities || []).join(' ').toLowerCase();
  const seg = String(restaurantProfile.segment || '').toLowerCase();
  const blob = `${scheme.title || ''} ${scheme.description || ''} ${(scheme.keywords || []).join(' ')}`.toLowerCase();
  let score = 0;
  for (const u of ['gas', 'electricity', 'electric', 'water', 'restaurant', 'hospitality', 'sme', 'business']) {
    if ((pri.includes(u) || seg.includes('wok') || seg.includes('restaurant')) && blob.includes(u)) {
      score += u === 'gas' && pri.includes('gas') ? 5 : 2;
    }
  }
  return score;
}

function buildSchemesSnippet(restaurantProfile, schemesArr, maxItems = 14) {
  if (!Array.isArray(schemesArr)) return { schemes: [], truncated: 0 };

  const filtered = schemesArr
    .filter((s) => schemeRegionOk(s.region, restaurantProfile.regionCodes))
    .map((s) => ({ s, score: schemeKeywordScore(s, restaurantProfile) }))
    .sort((a, b) => b.score - a.score);

  const picked = filtered.slice(0, maxItems).map(({ s }) => ({
    id: s.id,
    title: s.title,
    type: s.type,
    region: s.region,
    description: String(s.description || '').slice(0, 220),
    relevance: s.relevance || ''
  }));

  return {
    schemes: picked,
    truncated: Math.max(0, schemesArr.length - picked.length)
  };
}

/**
 * Loads deals feed + schemes subset + merged restaurant profile for LLM / API responses.
 */
function buildAssistantSiteContext(siteId, companyId) {
  const restaurantProfile = resolveRestaurantProfile(siteId, companyId);
  const dealsFeed = readJsonCached(DEALS_PATH, 'deals') || { deals: [], highlights: [], meta: {} };
  const schemesArr = readJsonCached(SCHEMES_PATH, 'schemes');
  const dealsContext = buildDealsContext(restaurantProfile, dealsFeed);
  const schemesContext = buildSchemesSnippet(
    restaurantProfile,
    schemesArr || [],
    envInt('ASSISTANT_SCHEMES_MAX', 10)
  );

  return {
    restaurantProfile,
    dealsContext,
    schemesContext
  };
}

module.exports = {
  resolveRestaurantProfile,
  buildAssistantSiteContext,
  buildDealsContext,
  buildSchemesSnippet
};
