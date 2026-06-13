const path = require('path');
const fs = require('fs/promises');
const { loadIntentsFrom, matchIntent, PORTAL_LINKS, toLinkItem } = require('./greenways-agent-shared');
const { applyPersona, loadAgentVoice, pickTip } = require('./greenways-agent-persona');
const {
  loadEnergySnapshot,
  formatModellingTariffLine,
  formatWholesaleBullets,
  volatilityHint
} = require('./finance-agent-energy');
const { getVideosForAgent } = require('./wix-media-service');
const {
  loadFullNewsCatalog,
  rankNewsItems,
  formatNewsBullets,
  filterByCategory,
  getLatestEdition,
  pickEditionChips
} = require('./media-news-loader');
const {
  MAP_PAGE_HREF,
  loadCompanies,
  loadMapCatalog,
  rankCompanies,
  resolveShowcaseCompanies,
  buildSustainabilityMapAnswer,
  buildEnergyExamplesAnswer,
  buildMapNewsCrosslinkBlock,
  isMapRelatedQuestion,
  companyToMediaSample
} = require('./media-agent-companies');
const { moduleBlockFor } = require('./greenways-content-modules');

const intentsPath = path.join(__dirname, '..', 'data', 'media-agent-intents.json');
const showcasePath = path.join(__dirname, '..', 'data', 'media-agent-showcase.json');
const briefingPath = path.join(__dirname, '..', 'data', 'media-agent-briefing.json');
const voicePath = path.join(__dirname, '..', 'data', 'media-agent-voice.json');
const referencesPath = path.join(__dirname, '..', 'data', 'media-agent-references.json');

const REGION_LABELS = { nl: 'Netherlands', uk: 'United Kingdom', eu: 'EU-wide' };

const MEDIA_PAGES = {
  sustainabilityNews: './January%20Sustainable%20News%20Original%20.html',
  sustainableReferences: './Sustainable%20References%20.HTML',
  importanceMonitoring: './Importance%20of%20Energy%20Monitoring.html',
  waterGuide: './water-saving-finder.html',
  dealsHub: './deals-ticker-hub.html',
  sustainabilityMap: MAP_PAGE_HREF,
  energyTicker: PORTAL_LINKS.energyTicker
};

const VIDEO_CATEGORIES = {
  restaurant: 'Restaurant Energy Savings',
  energy: 'Home & business energy savings',
  water: 'Water & resource saving',
  solar: 'Solar & renewables',
  hvac: 'Heating, cooling & HVAC',
  lighting: 'LED & lighting',
  monitoring: 'Energy monitoring',
  etl: 'ETL & efficient products',
  news: 'News & reviews',
  refurbishment: 'Refurbishment ideas',
  building: 'Green building',
  rooftop: 'Rooftop & urban farming',
  general: 'General sustainability'
};

async function loadBriefing() {
  try {
    const raw = await fs.readFile(briefingPath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

async function loadReferences() {
  try {
    const raw = await fs.readFile(referencesPath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { internalGuides: [] };
  }
}

function buildHandoffs(briefing, question, intentId = '') {
  const out = [];
  const h = briefing?.handoffs || {};
  const q = String(question || '').trim();
  const push = (key, defaultPrompt) => {
    const row = h[key];
    if (!row) return;
    out.push({
      id: row.agentId,
      name: row.agentName,
      href: row.agentPath,
      prompt: q || defaultPrompt
    });
  };

  if (['funding_news', 'policy_news', 'country_news', 'monthly_news', 'how_this_helps'].includes(intentId)) {
    push('grantsToAndrieus', 'What grants apply from this sustainability news in my region?');
  }
  if (['energy_prices', 'monthly_news', 'energy_examples', 'overview'].includes(intentId)) {
    push('financeToVincent', 'How do current energy prices affect my upgrade payback?');
    push('dealsToZara', 'What energy or sustainability deals are live this week?');
  }
  if (['sustainability_map', 'energy_examples', 'restaurant_videos'].includes(intentId)) {
    push('equipmentToArtemis', 'What ETL equipment matches this map case study?');
    push('productsToZyanne', 'Find efficient products like those in the map examples');
  }
  if (!out.length) {
    push('productsToZyanne', 'What efficient products relate to this sustainability topic?');
    push('financeToVincent', 'How do energy prices affect acting on this news?');
  }
  const seen = new Set();
  return out
    .filter((row) => {
      const key = row.id || row.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

function rankReferences(refs, question, limit = 6) {
  const q = String(question || '').toLowerCase();
  const pool = [...(refs.external || []), ...(refs.internalGuides || [])];
  if (!q.trim()) return pool.slice(0, limit);
  const scored = pool.map((ref) => {
    const hay = [ref.title, ref.summary, ...(ref.topics || [])].join(' ').toLowerCase();
    let score = 0;
    q.split(/\s+/).filter((t) => t.length >= 3).forEach((token) => {
      if (hay.includes(token)) score += 3;
    });
    if (/map|case|company|organisation|organization/.test(q) && /map|case|directory/.test(hay)) score += 5;
    if (/news|headline|monthly/.test(q) && /news/.test(hay)) score += 4;
    if (/video|watch/.test(q) && /video/.test(hay)) score += 4;
    if (/price|ticker|wholesale|tariff/.test(q) && /ticker|price|energy/.test(hay)) score += 5;
    return { ref, score };
  });
  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.ref)
    .slice(0, limit);
}

async function buildEnergyTickerBlock(profile) {
  const snapshot = await loadEnergySnapshot();
  const bullets = formatWholesaleBullets(snapshot, profile, 3);
  const modelling = formatModellingTariffLine(snapshot.modellingTariffs);
  const hint = volatilityHint(snapshot, profile);
  if (!bullets.length && !modelling) {
    return (
      `**Energy prices ticker:** ${MEDIA_PAGES.energyTicker}\n` +
      `API: \`/api/energy-ticker\` on Render when ENTSO-E is configured.`
    );
  }
  return (
    `**Energy prices context** (wholesale — pair with sustainability news):\n` +
    `${bullets.join('\n')}\n` +
    (modelling ? `${modelling}\n` : '') +
    `${hint}\n` +
    `→ **Live ticker:** ${MEDIA_PAGES.energyTicker}`
  );
}

async function attachModules(result, profile, moduleIds = []) {
  if (!result || !moduleIds.length) return result;
  const blocks = [...(result.blocks || [])];
  for (const id of moduleIds) {
    const block = await moduleBlockFor(id, profile);
    if (block) blocks.push(block);
  }
  if (blocks.length) result.blocks = blocks;
  return result;
}

async function loadShowcase() {
  try {
    const raw = await fs.readFile(showcasePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return { news: [], photos: [], categoryImages: {} };
  }
}

function findNewsById(items, id) {
  return items.find((n) => n.id === id);
}

function editionLinksBlock(catalog) {
  const sust = getLatestEdition(catalog.editions, 'sustainability');
  const tech = getLatestEdition(catalog.editions, 'tech');
  const lines = [];
  if (sust) {
    lines.push(`- **Latest sustainability edition (${sust.edition}):** ${sust.pageHref} — ${sust.storyCount} stories`);
  }
  if (tech) {
    lines.push(`- **Latest tech edition (${tech.edition}):** ${tech.pageHref} — ${tech.storyCount} stories`);
  }
  if (!lines.length) {
    lines.push(`- **Site news page:** ${MEDIA_PAGES.sustainabilityNews}`);
  }
  return lines.join('\n');
}

function toMediaSample(item) {
  const tags = item.topGrants || item.tags || [];
  const type =
    item.type ||
    (item.videoUrl ? 'video' : item.subcategory === 'PHOTO' ? 'photo' : 'news');
  return {
    id: item.id,
    name: item.name || item.title || item.id,
    label: item.label || item.description || '',
    subcategory: (item.subcategory || item.category || 'MEDIA').toUpperCase(),
    imageUrl: item.imageUrl || item.thumbnail || '',
    topGrants: Array.isArray(tags) ? tags.slice(0, 2) : [item.newsCategory || 'News'],
    grantsCount: 0,
    marketplaceHref: item.href || item.moreLink || item.pageHref || MEDIA_PAGES.sustainabilityNews,
    videoUrl: item.videoUrl || '',
    duration: item.duration || '',
    category: item.category || '',
    type,
    source: item.source || 'knowledge'
  };
}

function videoToSample(v, videoSource) {
  return toMediaSample({
    id: v.id,
    name: v.title,
    label: v.description,
    thumbnail: v.thumbnail,
    videoUrl: v.videoUrl,
    category: v.category,
    duration: v.duration,
    tags: v.tags,
    subcategory: 'VIDEO',
    type: 'video',
    source: v.source || videoSource
  });
}

function isVideoQuestion(question) {
  return /video|watch|wix|kitchen|hospitality|commercial kitchen/.test(String(question || '').toLowerCase());
}

async function pickVideoSamples(question, profile = {}, limit = 3, categoryHint = null) {
  const { videos, source } = await getVideosForAgent();
  let pool = videos;
  if (categoryHint) {
    const matches = videos.filter(
      (v) => v.category === categoryHint || (categoryHint === 'energy' && v.category === 'general')
    );
    if (matches.length) pool = matches;
  }
  if (profile.sector === 'restaurant' && !categoryHint) {
    const rest = pool.filter((v) => v.category === 'restaurant');
    if (rest.length) pool = rest;
  }

  const q = String(question || '').toLowerCase();
  if (isVideoQuestion(q)) {
    const ranked = pool
      .map((v) => {
        const hay = [v.title, v.description, v.category, ...(v.tags || [])].join(' ').toLowerCase();
        let score = 0;
        q.split(/\s+/).filter((t) => t.length >= 3).forEach((t) => {
          if (hay.includes(t)) score += 3;
        });
        return { v, score };
      })
      .sort((a, b) => b.score - a.score);
    const withScore = ranked.filter((r) => r.score > 0).map((r) => r.v);
    const picked = (withScore.length ? withScore : pool).slice(0, limit);
    return picked.map((v) => videoToSample(v, source));
  }

  return pool.slice(0, limit).map((v) => videoToSample(v, source));
}

async function pickMediaSamples(question, profile = {}, limit = 3) {
  const showcase = await loadShowcase();
  const catalog = await loadFullNewsCatalog();
  const newsItems = catalog.items;
  const { videos, source: videoSource } = await getVideosForAgent();
  const companies = await loadCompanies();

  const samples = [];

  if (isMapRelatedQuestion(question)) {
    const mapPicks = rankCompanies(question, profile, companies, limit);
    for (const c of mapPicks) {
      samples.push(companyToMediaSample(c));
      if (samples.length >= limit) return samples;
    }
  }

  if (!String(question || '').trim() || String(question).length < 4) {
    for (const row of showcase.news || []) {
      const news = findNewsById(newsItems, row.id);
      if (news) {
        samples.push(
          toMediaSample({
            id: news.id,
            title: news.title,
            label: row.label || news.summary,
            description: news.summary,
            imageUrl: showcase.categoryImages?.policy,
            href: news.pageHref || (news.sources && news.sources[0]) || MEDIA_PAGES.sustainabilityNews,
            newsCategory: news.newsCategory
          })
        );
      }
      if (samples.length >= limit) break;
    }
    if (samples.length < limit) {
      for (const photo of showcase.photos || []) {
        if (samples.length >= limit) break;
        samples.push(toMediaSample({ ...photo, subcategory: 'PHOTO', type: 'photo' }));
      }
    }
    if (samples.length < limit && videos.length) {
      for (const v of videos.slice(0, limit - samples.length)) {
        samples.push(
          toMediaSample({
            id: v.id,
            name: v.title,
            label: v.description,
            thumbnail: v.thumbnail,
            videoUrl: v.videoUrl,
            category: v.category,
            tags: v.tags,
            subcategory: 'VIDEO',
            type: 'video',
            source: v.source || videoSource
          })
        );
      }
    }
    if (samples.length < limit && (showcase.companies || []).length) {
      const mapCards = resolveShowcaseCompanies(
        showcase.companies,
        companies,
        limit - samples.length
      );
      for (const card of mapCards) {
        if (!samples.some((s) => s.id === card.id)) samples.push(card);
      }
    }
    return samples.slice(0, limit);
  }

  if (isVideoQuestion(question)) {
    const videoSamples = await pickVideoSamples(question, profile, limit);
    for (const sample of videoSamples) {
      if (!samples.some((s) => s.id === sample.id)) samples.push(sample);
    }
  }

  if (samples.length < limit) {
    const rankedNews = rankNewsItems(newsItems, question, limit);
    for (const n of rankedNews) {
      if (samples.length >= limit) break;
      samples.push(
        toMediaSample({
          id: n.id,
          title: n.title,
          label: n.summary,
          imageUrl: showcase.categoryImages?.[n.newsCategory] || showcase.categoryImages?.policy,
          href: n.pageHref || (n.sources && n.sources[0]) || MEDIA_PAGES.sustainabilityNews,
          newsCategory: n.newsCategory
        })
      );
    }
  }

  if (samples.length < limit) {
    for (const photo of showcase.photos || []) {
      if (samples.length >= limit) break;
      if (!samples.some((s) => s.id === photo.id)) {
        samples.push(toMediaSample({ ...photo, type: 'photo' }));
      }
    }
  }

  return samples.slice(0, limit);
}

async function buildOverviewAnswer(catalog, videos, tip, briefing) {
  const b = briefing || (await loadBriefing());
  const { caseStudies, directory } = await loadMapCatalog();
  const cats = [...new Set(catalog.items.map((i) => i.newsCategory).filter(Boolean))];
  const tickerBlock = await buildEnergyTickerBlock({});
  return {
    answer:
      `**Cheryce — sustainability news & media**\n\n` +
      `${b.roleSummary || ''}\n\n` +
      `- **News catalogue:** ${catalog.stats.total} items (${catalog.stats.knowledgeBase} policy/funding KB + ${catalog.stats.monthlyEditions} monthly editions)\n` +
      `- **Categories:** ${cats.slice(0, 8).join(', ')}${cats.length > 8 ? '…' : ''}\n` +
      `- **Sustainability map:** ${caseStudies.length} case studies + ${directory.length} directory organisations\n` +
      `- **Wix videos:** ${videos.length} available (${videos[0]?.source === 'wix' ? 'live from Wix Media' : 'sample cards until Wix API connected'})\n\n` +
      `I explain **how this helps you** on each story — not links alone.\n\n` +
      `**Latest editions:**\n${editionLinksBlock(catalog)}\n\n` +
      `${tickerBlock}\n\n` +
      `**Map:** ${MAP_PAGE_HREF}\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(b, '', 'overview')
  };
}

async function buildNewsCategoryAnswer(category, catalog, tip) {
  const rows = filterByCategory(catalog.items, category);
  const kbCount = rows.filter((r) => r.catalogSource?.includes('kb')).length;
  const editionCount = rows.filter((r) => r.catalogSource === 'content-ops-html').length;
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  const ranked = rows.slice(0, 12);
  return {
    answer:
      `**${label} news** — ${rows.length} items (${kbCount} knowledge base + ${editionCount} from monthly editions):\n\n` +
      `${formatNewsBullets(ranked, 6) || '_No items in this category yet._'}\n\n` +
      `**Editions & pages:**\n${editionLinksBlock(catalog)}\n\n_${tip}_`,
    suggestions: []
  };
}

async function buildMonthlyNewsAnswer(catalog, profile, tip, briefing) {
  const sust = getLatestEdition(catalog.editions, 'sustainability');
  const editionStories = sust
    ? catalog.items.filter((i) => i.edition === sust.edition && i.editionType === 'sustainability' && i.catalogSource === 'content-ops-html')
    : [];
  const fallback = rankNewsItems(
    catalog.items.filter((i) => i.editionType !== 'tech'),
    'sustainability policy funding circular',
    8
  );
  const highlights = editionStories.length ? editionStories.slice(0, 8) : fallback;
  const mapBlock = await buildMapNewsCrosslinkBlock(profile, 'sustainability energy savings case study', 3);
  const tickerBlock = await buildEnergyTickerBlock(profile);
  const b = briefing || (await loadBriefing());
  return {
    answer:
      `**Sustainability news roundup**${sust ? ` — **${sust.edition}** edition` : ''}:\n\n` +
      `Each item includes **how this helps you** (_Why it matters_ lines below).\n\n` +
      `${formatNewsBullets(highlights, 8)}\n\n` +
      `**Read full edition:**\n${editionLinksBlock(catalog)}\n` +
      `Related: ${MEDIA_PAGES.sustainableReferences}` +
      `${mapBlock}\n\n` +
      `${tickerBlock}\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(b, '', 'monthly_news')
  };
}

async function buildTechNewsAnswer(catalog, tip) {
  const tech = getLatestEdition(catalog.editions, 'tech');
  const techStories = tech
    ? catalog.items.filter((i) => i.edition === tech.edition && i.editionType === 'tech')
    : catalog.items.filter((i) => i.editionType === 'tech' || i.catalogSource === 'tech-kb');
  const highlights = techStories.slice(0, 8);
  return {
    answer:
      `**Tech & innovation news** — ${techStories.length} items${tech ? ` (latest edition **${tech.edition}**)` : ''}:\n\n` +
      `${formatNewsBullets(highlights, 8) || '_Browse the tech news editions on Greenways._'}\n\n` +
      `**Editions:**\n${editionLinksBlock(catalog)}\n\n_${tip}_`,
    suggestions: []
  };
}

async function buildStorySearchAnswer(question, catalog, tip) {
  const ranked = rankNewsItems(catalog.items, question, 8);
  if (!ranked.length) return null;
  return {
    answer:
      `**News matches** for _"${question}"_:\n\n` +
      `${formatNewsBullets(ranked, 8)}\n\n` +
      `**Monthly editions:**\n${editionLinksBlock(catalog)}\n\n_${tip}_`,
    suggestions: [],
    source: 'news-search',
    intentId: 'story_search'
  };
}

async function buildVideoCategoryAnswer(category, tip) {
  const { videos, source } = await getVideosForAgent();
  const label = VIDEO_CATEGORIES[category] || category;
  const matches = videos.filter((v) => v.category === category || (category === 'energy' && v.category === 'general'));
  const list = (matches.length ? matches : videos).slice(0, 5);
  const bullets = list
    .map((v) => `- **${v.title}**${v.duration ? ` (${v.duration})` : ''}${v.videoUrl ? `\n  → ${v.videoUrl}` : ''}`)
    .join('\n');
  return {
    answer:
      `**${label}** — videos from the Greenways library:\n\n` +
      `${bullets || '_No videos tagged for this topic yet — browse all Wix videos on site._'}\n\n` +
      `_Source: ${source === 'wix' ? 'Wix Media API' : 'sample showcase (configure Wix credentials on Render for live library)'}_\n\n_${tip}_`,
    suggestions: []
  };
}

async function buildWixVideosAnswer(tip) {
  const { videos, source } = await getVideosForAgent();
  const byCat = {};
  for (const v of videos) {
    const c = v.category || 'general';
    byCat[c] = (byCat[c] || 0) + 1;
  }
  const lanes = Object.entries(byCat)
    .map(([k, n]) => `- **${VIDEO_CATEGORIES[k] || k}:** ${n} videos`)
    .join('\n');
  return {
    answer:
      `**Wix video library** — **${videos.length}** videos:\n\n${lanes}\n\n` +
      (source !== 'wix'
        ? '⚠️ **Local note:** Wix credentials may be missing — you see sample cards. On **Render** with `WIX_APP_TOKEN` (or app id/secret), live Wix videos load automatically.\n\n'
        : '') +
      `Video verification workflow (admin, like music site media scout) — **coming soon**.\n\n_${tip}_`,
    suggestions: []
  };
}

async function buildPhotosAnswer(tip) {
  const showcase = await loadShowcase();
  const photos = showcase.photos || [];
  const bullets = photos
    .map((p) => `- **${p.name}** — ${p.label}\n  → ${p.href}`)
    .join('\n');
  return {
    answer:
      `**Photos & visuals** on Greenways — used in news, finders, and chat banners:\n\n` +
      `${bullets}\n\n` +
      `Images are served from **Wix Media** (static URLs). Tap a banner card to open the linked page.\n\n_${tip}_`,
    suggestions: []
  };
}

function buildPortalsAnswer(catalog, tip) {
  return {
    answer:
      `**Media & news on Greenways:**\n\n` +
      `**Monthly editions (content-ops):**\n${editionLinksBlock(catalog)}\n\n` +
      `- **Sustainability news (site):** ${MEDIA_PAGES.sustainabilityNews}\n` +
      `- **Sustainable references:** ${MEDIA_PAGES.sustainableReferences}\n` +
      `- **Energy prices ticker:** ${MEDIA_PAGES.energyTicker}\n` +
      `- **Energy monitoring guide:** ${MEDIA_PAGES.importanceMonitoring}\n` +
      `- **Water saving finder:** ${MEDIA_PAGES.waterGuide}\n` +
      `- **Deals & offers hub:** ${MEDIA_PAGES.dealsHub}\n` +
      `- **Sustainability map (case studies + directory):** ${MEDIA_PAGES.sustainabilityMap}\n\n` +
      `Videos: Wix Media library (site video sections by topic).\n\n_${tip}_`,
    suggestions: []
  };
}

async function buildEnergyPricesAnswer(profile, tip, briefing) {
  const b = briefing || (await loadBriefing());
  const tickerBlock = await buildEnergyTickerBlock(profile);
  const region = profile.region ? REGION_LABELS[profile.region] || profile.region : 'your market';
  return {
    answer:
      `**Energy prices & sustainability news** (${region})\n\n` +
      `Wholesale moves change how urgently efficient equipment and grants matter — I pair the **energy ticker** with monthly sustainability headlines.\n\n` +
      `${tickerBlock}\n\n` +
      `**Also on Greenways:**\n` +
      `- Deals ticker hub: ${MEDIA_PAGES.dealsHub}\n` +
      `- Finance Agent for payback modelling\n\n_${tip}_`,
    suggestions: [],
    blocks: [
      {
        type: 'link',
        items: [
          toLinkItem('Energy prices ticker', MEDIA_PAGES.energyTicker, 'Wholesale context for news timing'),
          toLinkItem('Deals ticker hub', MEDIA_PAGES.dealsHub, 'Offers when prices shift')
        ]
      }
    ],
    agentHandoffs: buildHandoffs(b, '', 'energy_prices')
  };
}

async function buildHowThisHelpsAnswer(question, catalog, profile, tip) {
  const ranked = rankNewsItems(catalog.items, question || 'policy funding impact', 6);
  const withImpact = ranked.filter((i) => (i.impact || []).length);
  const pool = withImpact.length ? withImpact : ranked;
  return {
    answer:
      `**How this helps you** — impact lines from the sustainability knowledge base:\n\n` +
      `${formatNewsBullets(pool, 6) || '_Browse monthly editions for full how-this-helps sections._'}\n\n` +
      `Full newsletters live in **content-ops/drafts/sustainability-news** and published edition pages.\n\n_${tip}_`,
    suggestions: [],
    intentId: 'how_this_helps'
  };
}

async function buildRoleResourcesAnswer(question, profile, tip) {
  const briefing = await loadBriefing();
  const refs = await loadReferences();
  const ranked = rankReferences(refs, question, 8);
  const picks = ranked.length
    ? ranked
    : [...(refs.external || []).slice(0, 2), ...(refs.internalGuides || []).slice(0, 6)];
  const { caseStudies, directory } = await loadMapCatalog();
  const mustKnows = (briefing.mustKnows || []).slice(0, 6);
  const core = (briefing.coreUnderstandings || []).slice(0, 4);
  const region = profile.region ? REGION_LABELS[profile.region] || profile.region : 'your region';

  return {
    answer:
      `**Cheryce — role & references** (${region})\n\n` +
      `${briefing.roleProfile || briefing.roleSummary || ''}\n\n` +
      `**Map data:** ${caseStudies.length} case studies · ${directory.length} directory organisations\n\n` +
      `**Must-know themes:**\n${mustKnows.map((m) => `- ${m}`).join('\n')}\n\n` +
      `**How I advise:**\n${core.map((c) => `- ${c}`).join('\n')}\n\n` +
      `**Curated links:**\n${picks.map((r) => `- **${r.title}** — ${r.summary || ''}`).join('\n')}\n\n_${tip}_`,
    blocks: [
      {
        type: 'link',
        items: picks.slice(0, 6).map((r) => toLinkItem(r.title, r.url || r.href, r.summary || ''))
      }
    ],
    suggestions: [],
    agentHandoffs: buildHandoffs(briefing, question, 'role_resources')
  };
}

function citedItemsForIntent(intent, catalog, question) {
  if (!intent) {
    return rankNewsItems(catalog.items, question, 8);
  }
  switch (intent.answerType) {
    case 'news_category': {
      const kb = filterByCategory(catalog.items, intent.category);
      const sust = getLatestEdition(catalog.editions, 'sustainability');
      const editionItems = sust
        ? catalog.items.filter(
            (i) => i.edition === sust.edition && i.catalogSource === 'content-ops-html'
          )
        : [];
      const editionMatches = rankNewsItems(editionItems, intent.category, 6);
      const combined = [...editionMatches];
      const seen = new Set(combined.map((i) => i.id));
      for (const row of kb) {
        if (!seen.has(row.id) && combined.length < 12) {
          seen.add(row.id);
          combined.push(row);
        }
      }
      return combined;
    }
    case 'monthly_news': {
      const sust = getLatestEdition(catalog.editions, 'sustainability');
      if (!sust) return rankNewsItems(catalog.items, 'sustainability monthly', 8);
      return catalog.items.filter(
        (i) =>
          i.edition === sust.edition &&
          i.editionType === 'sustainability' &&
          i.catalogSource === 'content-ops-html'
      );
    }
    case 'tech_news': {
      const tech = getLatestEdition(catalog.editions, 'tech');
      if (!tech) {
        return catalog.items.filter((i) => i.editionType === 'tech' || i.catalogSource === 'tech-kb');
      }
      return catalog.items.filter((i) => i.edition === tech.edition && i.editionType === 'tech');
    }
    case 'overview':
    case 'portals':
      return catalog.items.filter((i) => i.catalogSource === 'content-ops-html').slice(0, 8);
    default:
      return [];
  }
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntentsFrom(intentsPath);
  const voice = await loadAgentVoice(voicePath);
  const briefing = await loadBriefing();
  const catalog = await loadFullNewsCatalog();
  const { videos } = await getVideosForAgent();
  const intent = matchIntent(question, intents);
  const tip = pickTip(intents.staticTips, intent?.id, { skipIntentIds: voice.skipTipIntents });

  let result;
  if (intent) {
    switch (intent.answerType) {
      case 'overview':
        result = await buildOverviewAnswer(catalog, videos, tip, briefing);
        result = await attachModules(result, profile, ['sustainability-map', 'energy-prices-ticker']);
        break;
      case 'sustainability_map': {
        result = await buildSustainabilityMapAnswer(question, profile, tip, {
          localVariantNote: briefing.mapPrinciple || undefined
        });
        result.agentHandoffs = buildHandoffs(briefing, question, 'sustainability_map');
        result = await attachModules(result, profile, ['sustainability-map']);
        break;
      }
      case 'energy_examples': {
        result = await buildEnergyExamplesAnswer(question, profile, tip);
        result.agentHandoffs = buildHandoffs(briefing, question, 'energy_examples');
        break;
      }
      case 'news_category':
        result = await buildNewsCategoryAnswer(intent.category, catalog, tip);
        result.agentHandoffs = buildHandoffs(briefing, question, intent.id);
        break;
      case 'monthly_news':
        result = await buildMonthlyNewsAnswer(catalog, profile, tip, briefing);
        result = await attachModules(result, profile, [
          'energy-prices-ticker',
          'sustainability-news-edition',
          'sustainability-map'
        ]);
        break;
      case 'tech_news':
        result = await buildTechNewsAnswer(catalog, tip);
        break;
      case 'energy_prices':
        result = await buildEnergyPricesAnswer(profile, tip, briefing);
        result = await attachModules(result, profile, ['energy-prices-ticker']);
        break;
      case 'how_this_helps':
        result = await buildHowThisHelpsAnswer(question, catalog, profile, tip);
        result.agentHandoffs = buildHandoffs(briefing, question, 'how_this_helps');
        break;
      case 'video_category':
        result = await buildVideoCategoryAnswer(intent.category, tip);
        result.agentHandoffs = buildHandoffs(briefing, question, intent.id);
        break;
      case 'wix_videos':
        result = await buildWixVideosAnswer(tip);
        break;
      case 'photos':
        result = await buildPhotosAnswer(tip);
        break;
      case 'portals':
        result = buildPortalsAnswer(catalog, tip);
        break;
      case 'role_resources':
        result = await buildRoleResourcesAnswer(question, profile, tip);
        break;
      default:
        result = null;
    }
  }

  if (!result) {
    result = await buildStorySearchAnswer(question, catalog, tip);
  }

  if (result?.answer) {
    const intentId = result.intentId || intent?.id || null;
    const cited = citedItemsForIntent(intent, catalog, question);
    result.source = result.source || 'knowledge';
    result.intentId = intentId;
    result.editionChips = pickEditionChips(catalog, { citedItems: cited, intentId });
    if (!result.agentHandoffs?.length) {
      result.agentHandoffs = buildHandoffs(briefing, question, intentId || 'overview');
    }
    const videoIntent =
      intent &&
      (intent.answerType === 'video_category' ||
        intent.answerType === 'wix_videos' ||
        intent.id === 'restaurant_videos' ||
        intent.id === 'energy_videos' ||
        intent.id === 'water_videos');
    if (videoIntent || isVideoQuestion(question)) {
      result.productSamples = await pickVideoSamples(
        question,
        profile,
        3,
        intent?.category || null
      );
    } else {
      result.productSamples = await pickMediaSamples(question, profile, 3);
    }
    applyPersona(result, {
      voice,
      intentId: intentId || 'overview',
      question,
      profile,
      staticTips: intents.staticTips,
      regionLabels: REGION_LABELS,
      tip
    });
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  pickMediaSamples,
  pickVideoSamples,
  getDefaultProductSamples: (limit = 3) => pickMediaSamples('', {}, limit),
  loadFullNewsCatalog,
  loadBriefing,
  loadReferences
};
