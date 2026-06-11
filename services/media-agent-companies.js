const path = require('path');
const fs = require('fs/promises');

const companiesPath = path.join(__dirname, '..', 'data', 'companies.json');

const MAP_PAGE_HREF =
  './European%20Company%20-%20Case%20Study%20Finder%20(Standalone)%20-%20Wix%20bundle.html';

const SECTOR_ALIASES = {
  restaurant: ['hospitality', 'restaurant', 'food', 'catering'],
  hospitality: ['hospitality', 'restaurant', 'food'],
  sme: ['sme', 'retail', 'office', 'manufacturing'],
  any: []
};

const REGION_COUNTRY = {
  nl: ['netherlands', 'nl', 'dutch', 'amsterdam', 'rotterdam'],
  uk: ['uk', 'united kingdom', 'england', 'scotland', 'wales', 'britain'],
  ie: ['ireland', 'irish'],
  de: ['germany', 'german', 'deutsch'],
  eu: ['europe', 'eu', 'european']
};

let companiesCache = null;

async function loadCompanies() {
  if (companiesCache) return companiesCache;
  const raw = await fs.readFile(companiesPath, 'utf8');
  const parsed = JSON.parse(raw);
  companiesCache = Array.isArray(parsed) ? parsed : parsed.items || [];
  return companiesCache;
}

function profileSectorTokens(profile = {}) {
  const s = String(profile.sector || '').toLowerCase();
  return SECTOR_ALIASES[s] || (s && s !== 'any' ? [s] : []);
}

function hasMeasurableStats(company) {
  const stats = company?.stats || {};
  return !!(stats.savings || stats.energy || stats.payback);
}

function rankCompanies(question, profile, companies, limit = 8) {
  const q = String(question || '').toLowerCase();
  const sectorTokens = profileSectorTokens(profile);
  const region = String(profile.region || '').toLowerCase();
  const regionTokens = REGION_COUNTRY[region] || [];

  const scored = companies
    .map((c) => {
      let score = 0;
      const hay = [c.name, c.desc, c.sector, c.country, c.city].join(' ').toLowerCase();
      q.split(/\s+/)
        .filter((t) => t.length >= 3)
        .forEach((t) => {
          if (hay.includes(t)) score += t.length >= 6 ? 3 : 2;
        });
      if (/map|case study|example|organisation|organization|company/i.test(q)) score += 2;
      if (/energy saving|payback|kwh|technique|assessment|cost saving/i.test(q) && hasMeasurableStats(c)) {
        score += 4;
      }
      const cSector = String(c.sector || '').toLowerCase();
      if (sectorTokens.some((t) => cSector.includes(t) || hay.includes(t))) score += 5;
      if (regionTokens.some((t) => String(c.country || '').toLowerCase().includes(t))) score += 3;
      if (hasMeasurableStats(c)) score += 1;
      return { c, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length) {
    return scored.slice(0, limit).map((row) => row.c);
  }

  const sectorFiltered = companies.filter((c) => {
    if (!sectorTokens.length) return hasMeasurableStats(c);
    const cSector = String(c.sector || '').toLowerCase();
    return sectorTokens.some((t) => cSector.includes(t));
  });
  const pool = sectorFiltered.length ? sectorFiltered : companies.filter(hasMeasurableStats);
  return pool.slice(0, limit);
}

function formatCompanyBullet(c) {
  const stats = c.stats || {};
  const statLine = [
    stats.savings ? `savings ${stats.savings}` : '',
    stats.energy ? stats.energy : '',
    stats.payback ? `payback ${stats.payback}` : ''
  ]
    .filter(Boolean)
    .join(' · ');
  const desc = String(c.desc || '').slice(0, 150);
  return (
    `- **${c.name}** (${c.country || '—'}${c.sector ? ` · ${c.sector}` : ''})` +
    (statLine ? ` — _${statLine}_` : '') +
    `\n  ${desc}${String(c.desc || '').length > 150 ? '…' : ''}`
  );
}

function formatCompanyBullets(companies, limit = 6) {
  if (!companies?.length) return '';
  return companies.slice(0, limit).map(formatCompanyBullet).join('\n\n');
}

function getSectorSummary(companies) {
  const counts = {};
  companies.forEach((c) => {
    const s = c.sector || 'other';
    counts[s] = (counts[s] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k, n]) => `${k} (${n})`)
    .join(', ');
}

function companyToMediaSample(c) {
  const stats = c.stats || {};
  const tags = [stats.savings, stats.payback].filter(Boolean);
  return {
    id: `company-${c.id}`,
    name: c.name,
    label: String(c.desc || '').slice(0, 72) + (c.desc && c.desc.length > 72 ? '…' : ''),
    subcategory: (c.sector || 'CASE STUDY').toUpperCase(),
    imageUrl: c.imageUrl || '',
    topGrants: tags.length ? tags : [c.country || 'Case study'],
    grantsCount: 0,
    marketplaceHref: MAP_PAGE_HREF,
    type: 'company',
    source: 'sustainability-map'
  };
}

function resolveShowcaseCompanies(showcaseRows, allCompanies, limit = 3) {
  const byId = new Map(allCompanies.map((c) => [c.id, c]));
  const samples = [];
  for (const row of showcaseRows || []) {
    const c = byId.get(row.id);
    if (!c) continue;
    samples.push(
      companyToMediaSample({
        ...c,
        desc: row.label ? `${row.label} — ${c.desc || ''}`.trim() : c.desc
      })
    );
    if (samples.length >= limit) break;
  }
  return samples;
}

async function buildSustainabilityMapAnswer(question, profile, tip) {
  const companies = await loadCompanies();
  const picks = rankCompanies(question, profile, companies, 6);
  const sectors = getSectorSummary(companies);
  return {
    answer:
      `**Sustainability map** — **${companies.length}** organisations with case-study style examples (energy techniques, savings figures, and sectors to benchmark against):\n\n` +
      `**Sectors on the map:** ${sectors}\n\n` +
      `**Picks for your profile**${
        profile.sector || profile.region
          ? ` (${[profile.sector, profile.region].filter(Boolean).join(' · ')})`
          : ''
      }:\n\n` +
      `${formatCompanyBullets(picks, 6) || '_Browse the map for organisations in your sector._'}\n\n` +
      `**Open the interactive map:** ${MAP_PAGE_HREF}\n\n` +
      `Use these examples when assessing **energy cost savings** — compare published savings/payback to your site, and cross-check techniques with **monthly sustainability news** roundups.\n\n_${tip}_`,
    suggestions: [],
    intentId: 'sustainability_map',
    source: 'sustainability-map'
  };
}

async function buildEnergyExamplesAnswer(question, profile, tip) {
  const companies = await loadCompanies();
  const withStats = companies.filter(hasMeasurableStats);
  const picks = rankCompanies(
    question || 'energy savings payback kwh case study techniques',
    profile,
    withStats,
    6
  );
  return {
    answer:
      `**Energy savings examples** from the sustainability map — real organisations with published savings, kWh, or payback figures you can use when **assessing upgrade options** (illustrative unless you have your own meter data):\n\n` +
      `${formatCompanyBullets(picks, 6) || '_Open the map for more case studies with stats._'}\n\n` +
      `Pair with **Finance Agent** for payback on your kit, and **monthly sustainability news** for policy context.\n\n` +
      `**Map:** ${MAP_PAGE_HREF}\n\n_${tip}_`,
    suggestions: [],
    intentId: 'energy_examples',
    source: 'sustainability-map'
  };
}

async function buildMapNewsCrosslinkBlock(profile, question, limit = 3) {
  const companies = await loadCompanies();
  const picks = rankCompanies(question, profile, companies, limit);
  if (!picks.length) return '';
  return (
    `\n\n**Related case studies on the sustainability map** (techniques & savings benchmarks):\n` +
    `${formatCompanyBullets(picks, limit)}\n` +
    `→ ${MAP_PAGE_HREF}`
  );
}

function isMapRelatedQuestion(question) {
  return /sustainability map|company map|case study|case studies|organisations on the map|organizations on the map|who has saved|energy example|techniques to consider/i.test(
    String(question || '')
  );
}

module.exports = {
  MAP_PAGE_HREF,
  loadCompanies,
  rankCompanies,
  formatCompanyBullets,
  companyToMediaSample,
  resolveShowcaseCompanies,
  buildSustainabilityMapAnswer,
  buildEnergyExamplesAnswer,
  buildMapNewsCrosslinkBlock,
  isMapRelatedQuestion,
  hasMeasurableStats
};
