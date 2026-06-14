const path = require('path');
const fs = require('fs/promises');

const { toLinkItem, REGION_LABELS } = require('./greenways-agent-shared');

const companiesPath = path.join(__dirname, '..', 'data', 'companies.json');
const orgsInlinePath = path.join(__dirname, '..', 'data', 'orgs-directory-inline.js');

const MAP_PAGE_HREF =
  './European%20Company%20-%20Case%20Study%20Finder%20(Standalone)%20-%20Wix%20bundle.html';

/** Wix placeholder when a case study row has no imageUrl (banner cards). */
const DEFAULT_COMPANY_CARD_IMAGE =
  'https://static.wixstatic.com/media/c123de_cdf6d4209eeb4dd190dd900b5b5d4263~mv2.jpeg';

const LOCAL_VARIANT_NOTE =
  'If the example is not in your geography, treat it as a **playbook** — the same product category, technique, or sector approach often works with a more local supplier or grant path.';

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
let orgsCache = null;

async function loadCompanies() {
  if (companiesCache) return companiesCache;
  const raw = await fs.readFile(companiesPath, 'utf8');
  const parsed = JSON.parse(raw);
  companiesCache = Array.isArray(parsed) ? parsed : parsed.items || [];
  return companiesCache;
}

async function loadOrgsDirectory() {
  if (orgsCache) return orgsCache;
  try {
    const raw = await fs.readFile(orgsInlinePath, 'utf8');
    const match = raw.match(/ORGS_DIRECTORY_INLINE=(\[[\s\S]*\]);/);
    orgsCache = match ? JSON.parse(match[1]) : [];
  } catch (_) {
    orgsCache = [];
  }
  return orgsCache;
}

async function loadMapCatalog() {
  const [caseStudies, directory] = await Promise.all([loadCompanies(), loadOrgsDirectory()]);
  return { caseStudies, directory };
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
  return (sectorFiltered.length ? sectorFiltered : companies.filter(hasMeasurableStats)).slice(0, limit);
}

function formatCompanyBullet(c) {
  const stats = c.stats || {};
  const statLine = [stats.savings, stats.energy, stats.payback].filter(Boolean).join(' · ');
  const desc = String(c.desc || '').slice(0, 150);
  return (
    `- **${c.name}** (${c.country || '—'}${c.city ? ` · ${c.city}` : ''})` +
    (statLine ? ` — _${statLine}_` : '') +
    `\n  ${desc}${String(c.desc || '').length > 150 ? '…' : ''}`
  );
}

function formatDirectoryBullet(org) {
  const stats = org.stats || {};
  const tagLine = [stats.energy, stats.co2, stats.savings].filter(Boolean).join(' · ');
  const desc = String(org.desc || '').slice(0, 140);
  const link = org.url ? `\n  → ${org.url}` : '';
  return (
    `- **${org.name}** (${org.country || '—'}${org.region ? ` · ${org.region}` : ''})` +
    (tagLine ? ` — _${tagLine}_` : '') +
    `\n  ${desc}${String(org.desc || '').length > 140 ? '…' : ''}${link}`
  );
}

function rankDirectoryOrgs(question, profile, orgs, limit = 4) {
  const q = String(question || '').toLowerCase();
  const region = String(profile.region || '').toLowerCase();
  const regionTokens = REGION_COUNTRY[region] || [];

  const scored = orgs
    .map((o) => {
      let score = 0;
      const hay = [o.name, o.desc, o.country, o.region, o.sector].join(' ').toLowerCase();
      q.split(/\s+/)
        .filter((t) => t.length >= 3)
        .forEach((t) => {
          if (hay.includes(t)) score += t.length >= 6 ? 3 : 2;
        });
      if (/directory|organisation|organization|ngo|foundation|network/i.test(q)) score += 3;
      if (regionTokens.some((t) => hay.includes(t))) score += 4;
      return { o, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length) return scored.slice(0, limit).map((row) => row.o);
  return orgs.slice(0, limit);
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
    imageUrl: c.imageUrl || DEFAULT_COMPANY_CARD_IMAGE,
    topGrants: tags.length ? tags : [c.country || 'Case study'],
    grantsCount: 0,
    marketplaceHref: MAP_PAGE_HREF,
    type: 'company',
    source: 'sustainability-map'
  };
}

function companyToLinkItem(c, prefix = '') {
  const stats = c.stats || {};
  const statBits = [stats.savings, stats.energy, stats.payback].filter(Boolean).join(' · ');
  const place = [c.country, c.city].filter(Boolean).join(' · ') || '—';
  const desc = [
    statBits,
    String(c.desc || '').slice(0, 110)
  ]
    .filter(Boolean)
    .join(' — ');
  const title = prefix ? `${prefix}${c.name}` : c.name;
  return toLinkItem(`${title} (${place})`, MAP_PAGE_HREF, desc);
}

function orgToLinkItem(org) {
  const stats = org.stats || {};
  const tagLine = [stats.energy, stats.co2, stats.savings].filter(Boolean).join(' · ');
  const desc = [tagLine, String(org.desc || '').slice(0, 110)].filter(Boolean).join(' — ');
  const place = [org.country, org.region].filter(Boolean).join(' · ') || 'Europe';
  const url = org.url || MAP_PAGE_HREF;
  return toLinkItem(`${org.name} (${place})`, url, desc);
}

function buildMapExampleLinkItems(picks, dirPicks, maxCase = 5, maxDir = 3) {
  const items = [];
  for (const c of picks || []) {
    if (items.length >= maxCase) break;
    items.push(companyToLinkItem(c, 'Case study · '));
  }
  const dirItems = [];
  for (const o of dirPicks || []) {
    if (dirItems.length >= maxDir) break;
    dirItems.push(orgToLinkItem(o));
  }
  return { caseStudyLinks: items, directoryLinks: dirItems };
}

function mapFollowUpQuestion(profile = {}) {
  const sector = String(profile.sector || '').toLowerCase();
  if (sector === 'restaurant' || sector === 'hospitality') {
    return 'Want me to explain how a kitchen or HVAC technique from these examples could work for you — or match equipment with **Artemis**?';
  }
  return 'Should I explain any terms in these stories, or find examples closer to your sector?';
}

function mapAnswerBlocks(caseStudyLinks, directoryLinks) {
  const blocks = [];
  if (caseStudyLinks?.length) {
    blocks.push({ type: 'link', items: caseStudyLinks });
  }
  if (directoryLinks?.length) {
    blocks.push({ type: 'link', items: directoryLinks });
  }
  return blocks;
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

async function buildSustainabilityMapExplainedAnswer(question, profile, tip, intentId = 'sustainability_map_explained') {
  const { caseStudies, directory } = await loadMapCatalog();
  const ranked = rankCompanies(question, profile, caseStudies, 10);
  const bannerPicks = ranked.slice(0, 3);
  const blockPicks = ranked.slice(3, 8);
  const dirPicks = rankDirectoryOrgs(question, profile, directory, 4);
  const regionLabel = profile.region
    ? REGION_LABELS[profile.region] || String(profile.region).toUpperCase()
    : 'your region';
  const sectorLabel =
    profile.sector && profile.sector !== 'any' ? profile.sector : 'your sector';
  const { caseStudyLinks, directoryLinks } = buildMapExampleLinkItems(blockPicks, dirPicks, 5, 3);

  return {
    answer:
      `The **sustainability map** is Greenways’ interactive atlas of **companies and organisations worldwide** making a measurable impact on energy, water, and the circular economy — **${caseStudies.length} case studies** with savings stats and **${directory.length} directory leaders** (networks, banks, NGOs, and innovators).\n\n` +
      `It helps you **learn before you invest**: see how others achieve results through **products, equipment, and processes**, and use those stories as inspiration for your own site. If an example is not in your region, treat it as a **playbook** — the same technique often works with local suppliers, ETL products, or grants.\n\n` +
      `For **${regionLabel}** and **${sectorLabel}**, I've picked a few headline examples above and more case studies and directory organisations on the right. When you're ready for the full interactive atlas, use **Open map** below.\n\n` +
      `${mapFollowUpQuestion(profile)}\n\n_${tip}_`,
    suggestions: [],
    intentId,
    source: 'sustainability-map',
    productSamples: bannerPicks.map(companyToMediaSample),
    blocks: mapAnswerBlocks(caseStudyLinks, directoryLinks)
  };
}

async function buildSustainabilityMapAnswer(question, profile, tip) {
  return buildSustainabilityMapExplainedAnswer(question, profile, tip, 'sustainability_map');
}

async function buildEnergyExamplesAnswer(question, profile, tip) {
  const companies = await loadCompanies();
  const withStats = companies.filter(hasMeasurableStats);
  const picks = rankCompanies(
    question || 'energy savings payback kwh case study techniques',
    profile,
    withStats,
    5
  );
  const caseStudyLinks = picks.map((c) => companyToLinkItem(c, 'Example · '));

  return {
    answer:
      `These are **real energy savings examples** from the sustainability map — organisations with published kWh, € savings, or payback you can use as **benchmarks** when comparing upgrades (illustrative until you have your own meter data).\n\n` +
      `Each story shows **products, equipment, or processes** that made the difference. Open the cards on the right for the map entry, or ask me to explain how a technique could translate to your site.\n\n` +
      `${mapFollowUpQuestion(profile)}\n\n_${tip}_`,
    suggestions: [],
    intentId: 'energy_examples',
    source: 'sustainability-map',
    productSamples: picks.slice(0, 3).map(companyToMediaSample),
    blocks: caseStudyLinks.length ? [{ type: 'link', items: caseStudyLinks }] : []
  };
}

async function buildMapNewsCrosslinkBlock() {
  return '';
}

async function buildMapNewsCrosslinkItems(profile, question, limit = 3) {
  const companies = await loadCompanies();
  const picks = rankCompanies(question, profile, companies, limit);
  return picks.map((c) => companyToLinkItem(c, 'Related · '));
}

function isMapRelatedQuestion(question) {
  return /sustainability map|company map|case study|case studies|organisations on the map|organizations on the map|who has saved|energy example|techniques to consider/i.test(
    String(question || '')
  );
}

module.exports = {
  MAP_PAGE_HREF,
  LOCAL_VARIANT_NOTE,
  loadCompanies,
  loadOrgsDirectory,
  loadMapCatalog,
  rankCompanies,
  rankDirectoryOrgs,
  formatCompanyBullets,
  formatDirectoryBullet,
  companyToMediaSample,
  companyToLinkItem,
  buildMapExampleLinkItems,
  resolveShowcaseCompanies,
  buildSustainabilityMapAnswer,
  buildSustainabilityMapExplainedAnswer,
  buildEnergyExamplesAnswer,
  buildMapNewsCrosslinkBlock,
  buildMapNewsCrosslinkItems,
  isMapRelatedQuestion
};
