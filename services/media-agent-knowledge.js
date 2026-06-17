const path = require('path');
const fs = require('fs/promises');
const { loadIntentsFrom, matchIntent, PORTAL_LINKS, toLinkItem, toModuleItem } = require('./greenways-agent-shared');
const { mergeModuleRow } = require('./greenways-content-modules');
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
  buildSustainabilityMapExplainedAnswer,
  buildEnergyExamplesAnswer,
  buildMapNewsCrosslinkBlock,
  buildMapNewsCrosslinkItems,
  isMapRelatedQuestion,
  companyToMediaSample
} = require('./media-agent-companies');

const intentsPath = path.join(__dirname, '..', 'data', 'media-agent-intents.json');
const showcasePath = path.join(__dirname, '..', 'data', 'media-agent-showcase.json');
const briefingPath = path.join(__dirname, '..', 'data', 'media-agent-briefing.json');
const voicePath = path.join(__dirname, '..', 'data', 'media-agent-voice.json');
const referencesPath = path.join(__dirname, '..', 'data', 'media-agent-references.json');
const dailyBriefPath = path.join(__dirname, '..', 'data', 'media-daily-brief.json');
const {
  buildHandoffTopicSummary,
  isReferralWelcomePair
} = require('./greenways-agent-handoff');

let dailyBriefCache = null;

const MEDIA_KNOWLEDGE_VERSION = '2026-05-28-conversational-blocks';

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

const MEDIA_MODULE = { theme: 'media', agentName: 'Cheryce' };

const PORTAL_PATH_MODULE_IDS = [
  ['january%20sustainable%20news', 'sustainability-news-page'],
  ['sustainable%20references', 'sustainable-references'],
  ['importance%20of%20energy%20monitoring', 'energy-monitoring'],
  ['water-saving-finder', 'water-saving-finder'],
  ['deals-ticker-hub', 'deals-ticker'],
  ['energy-ticker-green-wire', 'energy-ticker'],
  ['european%20company%20-%20case%20study', 'sustainability-map'],
  ['sustainability-news/', 'sustainability-news-edition'],
  ['content-ops/drafts/sustainability-news', 'sustainability-news-edition']
];

function isAgentChatPath(path) {
  return /^\/greenways\//.test(String(path || '').trim());
}

function portalPathToModuleId(path) {
  const hay = String(path || '').toLowerCase();
  if (!hay || isAgentChatPath(path)) return '';
  for (const [needle, moduleId] of PORTAL_PATH_MODULE_IDS) {
    if (hay.includes(needle.toLowerCase())) return moduleId;
  }
  return '';
}

function mediaModuleBlock(rows) {
  return {
    type: 'module',
    items: rows.map((row) => toModuleItem({ ...MEDIA_MODULE, ...mergeModuleRow(row) }))
  };
}

function linkOrModuleBlocks(items) {
  const modules = [];
  const links = [];
  for (const item of items) {
    if (/^https?:\/\//i.test(item.url)) {
      links.push(item);
      continue;
    }
    const moduleId = portalPathToModuleId(item.url);
    if (moduleId) {
      modules.push({
        moduleId,
        title: item.title,
        openSize: moduleId === 'energy-prices-ticker' || moduleId === 'energy-ticker' ? 'expanded' : 'near-full'
      });
    } else {
      links.push(item);
    }
  }
  const blocks = [];
  if (modules.length) blocks.push(mediaModuleBlock(modules));
  if (links.length) blocks.push({ type: 'link', items: links });
  return blocks;
}

function splitReferenceBlocks(picks) {
  const modules = [];
  const links = [];
  for (const ref of picks) {
    if (ref.url && /^https?:\/\//i.test(ref.url)) {
      links.push(toLinkItem(ref.title, ref.url, ref.summary || ''));
      continue;
    }
    const moduleId = portalPathToModuleId(ref.href || ref.url);
    if (moduleId) {
      modules.push({ moduleId, title: ref.title, openSize: 'near-full' });
    } else if (ref.href || ref.url) {
      links.push(toLinkItem(ref.title, ref.href || ref.url, ref.summary || ''));
    }
  }
  const blocks = [];
  if (modules.length) blocks.push(mediaModuleBlock(modules));
  if (links.length) blocks.push({ type: 'link', items: links });
  return blocks;
}

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

const CHANNEL_QUERY_HINTS = [
  { channelId: 'restaurant-energy-savings', tokens: ['restaurant energy', 'kitchen video', 'hrc 2024', 'hospitality video', 'catering video', 'foodservice'] },
  { channelId: 'sustainability-in-action', tokens: ['sustainability in action', 'rammed earth', 'tauhai', 'green building example', 'architecture tour'] },
  { channelId: 'home-energy-savings', tokens: ['home energy', 'smart home', 'smart home guide', 'home energy saving'] },
  { channelId: 'smart-home-energy-savings', tokens: ['smart home energy', 'smart home devices'] },
  { channelId: 'low-energy-electrical', tokens: ['low energy electrical', 'futurebuild', 'heat pump dryer', 'household bills', 'electrical products'] },
  { channelId: 'resource-saving', tokens: ['resource saving', 'water saving video'] },
  { channelId: 'green-building-construction', tokens: ['green building construction', 'green building video'] },
  { channelId: 'refurbishment-ideas', tokens: ['refurbishment', 'retrofit video'] },
  { channelId: 'new-technology', tokens: ['new technology video', 'emerging tech'] },
  { channelId: 'energy-monitoring', tokens: ['energy monitoring video', 'smart meter video'] },
  { channelId: 'news-reviews', tokens: ['news review video', 'rooftop farm'] },
  { channelId: 'eco-sustainable-materials', tokens: ['sustainable materials', 'eco materials'] },
  { channelId: 'etl', tokens: ['etl video', 'energy technology list video'] },
  { channelId: 'main', tokens: ['main channel video', 'greenways main video'] }
];

function resolveChannelHintFromQuestion(question, channels = []) {
  const q = String(question || '').toLowerCase();
  for (const ch of channels) {
    const name = String(ch.name || '').toLowerCase();
    if (name && q.includes(name)) return ch.id;
    const slug = String(ch.id || '').replace(/-/g, ' ');
    if (slug && q.includes(slug)) return ch.id;
  }
  for (const row of CHANNEL_QUERY_HINTS) {
    if (row.tokens.some((t) => q.includes(t))) return row.channelId;
  }
  return null;
}

function isPlayableVideo(v) {
  return Boolean(v && (v.videoUrl || v.videoId));
}

function rankVideosForQuestion(pool, question, limit = 3) {
  const q = String(question || '').toLowerCase();
  const ranked = pool
    .map((v) => {
      const hay = [
        v.title,
        v.description,
        v.category,
        v.channelName,
        ...(v.tags || [])
      ]
        .join(' ')
        .toLowerCase();
      let score = isPlayableVideo(v) ? 1 : 0;
      q.split(/\s+/).filter((t) => t.length >= 3).forEach((t) => {
        if (hay.includes(t)) score += 3;
      });
      if (q.includes(String(v.channelName || '').toLowerCase())) score += 6;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score);
  const withScore = ranked.filter((r) => r.score > 0).map((r) => r.v);
  return (withScore.length ? withScore : pool).slice(0, limit);
}

const SUSTAINABILITY_STORY_ARCS = {
  restaurant: 'commercial kitchen efficiency and hospitality energy savings',
  energy: 'home and business energy savings',
  water: 'water and resource conservation',
  solar: 'solar and renewable power',
  hvac: 'heating, cooling and building services',
  lighting: 'efficient lighting and controls',
  monitoring: 'energy monitoring and smart operations',
  etl: 'verified efficient products and equipment upgrades',
  news: 'sustainability news and industry reviews',
  refurbishment: 'retrofit and refurbishment ideas',
  building: 'green building and low-carbon construction',
  rooftop: 'urban farming and rooftop sustainability',
  general: 'real-world sustainability in action'
};

function whyPickRelatedVideo(seed, video) {
  if (seed.channelId && video.channelId === seed.channelId && video.channelName) {
    return `Same Wix channel · ${video.channelName}`;
  }
  if (seed.category && video.category === seed.category) {
    return VIDEO_CATEGORIES[video.category] || video.category;
  }
  if (video.channelName) return video.channelName;
  return 'Related sustainability story';
}

function relatedStoryLine(seed) {
  const cat = seed.category || 'general';
  const arc = SUSTAINABILITY_STORY_ARCS[cat] || SUSTAINABILITY_STORY_ARCS.general;
  const channel = seed.channelName ? ` on **${seed.channelName}**` : '';
  return `Cheryce suggests these next${channel} — continuing the story of **${arc}**.`;
}

function relatedVideoRow(v, seed, score) {
  return {
    id: v.id,
    title: v.title,
    description: String(v.description || '').slice(0, 140),
    whyPick: whyPickRelatedVideo(seed, v),
    videoUrl: v.videoUrl || '',
    videoId: v.videoId || '',
    thumbnail:
      v.thumbnail || (v.videoId ? `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg` : ''),
    duration: v.duration || '',
    channelName: v.channelName || '',
    channelId: v.channelId || '',
    category: v.category || '',
    pageHref: v.pageHref || 'https://www.greenwaysbuildings.com/greenways',
    source: v.source || '',
    playable: isPlayableVideo(v),
    score
  };
}

async function pickRelatedVideos(seed = {}, limit = 4) {
  const { videos } = await getVideosForAgent();
  const seedId = String(seed.id || '').trim();
  const haySeed = [
    seed.title,
    seed.description,
    seed.category,
    seed.channelId,
    seed.channelName,
    ...(Array.isArray(seed.tags) ? seed.tags : [])
  ]
    .join(' ')
    .toLowerCase();

  const pool = videos.filter((v) => v.id !== seedId);
  const scored = pool
    .map((v) => {
      let score = 0;
      if (seed.channelId && v.channelId === seed.channelId) score += 14;
      if (seed.category && v.category === seed.category) score += 9;
      if (seed.category === 'energy' && v.category === 'general') score += 4;
      if (seed.category === 'building' && v.category === 'general') score += 3;
      const vTags = (v.tags || []).map((t) => String(t).toLowerCase());
      (Array.isArray(seed.tags) ? seed.tags : []).forEach((t) => {
        const tl = String(t).toLowerCase();
        if (vTags.some((x) => x.includes(tl) || tl.includes(x))) score += 5;
      });
      String(v.title || '')
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 4)
        .forEach((w) => {
          if (haySeed.includes(w)) score += 2;
        });
      if (isPlayableVideo(v)) score += 4;
      else score += 1;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score);

  const withScore = scored.filter((r) => r.score > 0);
  const picks = (withScore.length ? withScore : scored).slice(0, limit);
  return picks.map(({ v, score }) => relatedVideoRow(v, seed, score));
}

async function resolveVideoSeed(query = {}) {
  const { videos } = await getVideosForAgent();
  const id = String(query.id || query.videoId || '').trim();
  if (id) {
    const found = videos.find((v) => v.id === id);
    if (found) {
      return {
        id: found.id,
        title: found.title,
        description: found.description,
        category: found.category,
        channelId: found.channelId,
        channelName: found.channelName,
        tags: found.tags
      };
    }
  }
  return {
    id: id || '',
    title: String(query.title || '').trim(),
    description: String(query.description || '').trim(),
    category: String(query.category || '').trim(),
    channelId: String(query.channelId || '').trim(),
    channelName: String(query.channelName || '').trim(),
    tags: []
  };
}

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

  if (['funding_news', 'policy_news', 'country_news', 'monthly_news', 'daily_brief', 'how_this_helps'].includes(intentId)) {
    push('grantsToAndrieus', 'What grants apply from this sustainability news in my region?');
  }
  if (['energy_prices', 'monthly_news', 'energy_examples', 'overview'].includes(intentId)) {
    push('financeToVincent', 'How do current energy prices affect my upgrade payback?');
    push('dealsToZara', 'What energy or sustainability deals are live this week?');
  }
  if (['sustainability_map', 'sustainability_map_explained', 'energy_examples', 'restaurant_videos'].includes(intentId)) {
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
  const rows = moduleIds.map((id) => ({
    moduleId: id,
    openSize: id === 'energy-prices-ticker' || id === 'energy-ticker' ? 'expanded' : 'near-full'
  }));
  const blocks = [...(result.blocks || [])];
  blocks.push(mediaModuleBlock(rows));
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

function editionToLinkItems(catalog) {
  const items = [];
  const sust = getLatestEdition(catalog.editions, 'sustainability');
  const tech = getLatestEdition(catalog.editions, 'tech');
  if (sust?.pageHref) {
    items.push(
      toLinkItem(
        `Sustainability news (${sust.edition})`,
        sust.pageHref,
        `${sust.storyCount || 0} stories — full monthly edition`
      )
    );
  }
  if (tech?.pageHref) {
    items.push(
      toLinkItem(
        `Tech news (${tech.edition})`,
        tech.pageHref,
        `${tech.storyCount || 0} stories — innovation roundup`
      )
    );
  }
  if (!items.length) {
    items.push(toLinkItem('Sustainability news', MEDIA_PAGES.sustainabilityNews, 'Site news page'));
  }
  return items;
}

function newsItemToLinkItem(item) {
  const impact = (item.impact || []).slice(0, 2).join(' · ');
  const desc = [
    String(item.summary || '').slice(0, 100),
    impact ? `Why: ${impact}` : ''
  ]
    .filter(Boolean)
    .join(' — ');
  const url =
    item.pageHref ||
    item.moreLink ||
    (item.sources && item.sources[0]) ||
    MEDIA_PAGES.sustainabilityNews;
  return toLinkItem(item.title, url, desc);
}

async function loadDailyBrief() {
  if (dailyBriefCache) return dailyBriefCache;
  try {
    const raw = await fs.readFile(dailyBriefPath, 'utf8');
    dailyBriefCache = JSON.parse(raw);
  } catch (_) {
    dailyBriefCache = { meta: {}, stories: [] };
  }
  return dailyBriefCache;
}

function briefStoryToLinkItem(story) {
  const desc = [
    String(story.summary || '').slice(0, 100),
    story.whyItMatters ? `Why: ${story.whyItMatters}` : ''
  ]
    .filter(Boolean)
    .join(' — ');
  const url = story.href || MEDIA_PAGES.sustainabilityNews;
  return toLinkItem(story.title, url, desc || story.newsCategory || 'News');
}

function briefStoryToMediaSample(story, showcase) {
  const cat = story.newsCategory || 'monthly';
  return toMediaSample({
    id: story.id,
    title: story.title,
    name: story.title,
    label: String(story.summary || '').slice(0, 90),
    description: story.summary,
    imageUrl: showcase?.categoryImages?.[cat] || showcase?.categoryImages?.policy || '',
    href: story.href || MEDIA_PAGES.sustainabilityNews,
    newsCategory: cat,
    subcategory: 'NEWS',
    type: 'news',
    source: 'daily-brief'
  });
}

function briefStatItems(brief, profile) {
  const meta = brief.meta || {};
  const pr = String(profile.region || '').toLowerCase();
  return [
    { label: 'Brief date', value: meta.briefDate || String(meta.generatedAt || '').slice(0, 10) || '—' },
    { label: 'Headlines', value: String((brief.stories || []).length) },
    { label: 'Edition', value: meta.edition || '—' },
    {
      label: pr ? `${REGION_LABELS[pr] || pr.toUpperCase()} angle` : 'Catalog',
      value: pr ? 'Profile filter' : String(meta.catalogItems || '—')
    }
  ];
}

function shouldTryDailyBrief(question) {
  const q = String(question || '').toLowerCase();
  return (
    (/\b(today|todays|today's)\b/.test(q) &&
      /\b(news|briefing|brief|summary|roundup|headlines)\b/.test(q)) ||
    /\b(daily brief|news today|today's sustainability|sustainability today)\b/.test(q) ||
    /\b(check|scan|what's new)\b.*\b(news|headlines)\b/.test(q) ||
    /\bnews briefing\b/.test(q)
  );
}

async function buildDailyBriefAnswer(question, profile, tip, briefing) {
  const brief = await loadDailyBrief();
  const showcase = await loadShowcase();
  const meta = brief.meta || {};
  const stories = Array.isArray(brief.stories) ? brief.stories : [];
  const b = briefing || (await loadBriefing());

  if (!stories.length) {
    return {
      answer:
        'I do not have a **daily brief** ready yet — ask for **monthly news** or open the latest sustainability edition on the right.\n\n' +
        `_${tip}_`,
      suggestions: [],
      blocks: linkOrModuleBlocks([
        toLinkItem('Sustainability news', MEDIA_PAGES.sustainabilityNews, 'Site news page')
      ]),
      intentId: 'daily_brief'
    };
  }

  const briefDate = meta.briefDate || String(meta.generatedAt || '').slice(0, 10);
  const editionNote = meta.edition ? ` (curated from **${meta.edition}** edition)` : '';
  const pr = String(profile.region || '').toLowerCase();
  const profileNote = pr ? ` with a **${REGION_LABELS[pr] || pr}** restaurant lens` : '';

  const ranked = rankNewsItems(
    stories.map((s) => ({
      id: s.id,
      title: s.title,
      summary: s.summary,
      impact: s.whyItMatters ? [s.whyItMatters] : [],
      newsCategory: s.newsCategory,
      edition: s.edition,
      pageHref: s.href,
      sources: s.sources || []
    })),
    `${question} ${profile.sector || ''} ${profile.region || ''}`,
    5
  );
  const picks = ranked.length ? ranked : stories.slice(0, 5);

  const linkItems = picks.map((item) => briefStoryToLinkItem(item));
  if (meta.editionPageHref) {
    linkItems.push(
      toLinkItem(
        meta.editionTitle || `Full ${meta.edition} edition`,
        meta.editionPageHref,
        'Complete monthly newsletter'
      )
    );
  }
  linkItems.push(
    toLinkItem('Energy prices ticker', MEDIA_PAGES.energyTicker, 'Wholesale context for timing upgrades')
  );

  const blocks = [{ type: 'stat', items: briefStatItems(brief, profile) }, ...linkOrModuleBlocks(linkItems)];

  const productSamples = picks.slice(0, 3).map((s) => briefStoryToMediaSample(s, showcase));

  return {
    answer:
      `Here is **today's sustainability briefing** (built **${briefDate}**)${editionNote}${profileNote}.\n\n` +
      `I pulled **${picks.length} headlines** from our curated news catalogue — not live-scraped from the web in this chat. ` +
      `Open the story cards on the right for full pages; pair with the **energy ticker** when wholesale moves change your upgrade timing.\n\n` +
      `Want me to explain a term (CBAM, CSRD) or tie a headline to the **sustainability map**?\n\n_${tip}_`,
    suggestions: [],
    blocks,
    productSamples,
    agentHandoffs: buildHandoffs(b, question, 'daily_brief'),
    intentId: 'daily_brief'
  };
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

function newsBlocksFromItems(storyItems, catalog, maxStories = 6) {
  const storyLinks = (storyItems || []).slice(0, maxStories).map(newsItemToLinkItem);
  const editionItems = editionToLinkItems(catalog).slice(0, 2);
  const items = [...storyLinks, ...editionItems];
  return items.length ? linkOrModuleBlocks(items.slice(0, 8)) : [];
}

function isMapExplainQuestion(question) {
  const q = String(question || '').toLowerCase();
  return (
    /sustainability map|company map|case stud|organisations map|organizations map/.test(q) &&
    /explain|what is|what the|how (can|does)|tell me about|how it can help|map explained/.test(q)
  );
}

function toMediaSample(item) {
  const tags = item.topGrants || item.tags || [];
  const isVideo =
    item.type === 'video' || item.subcategory === 'VIDEO' || item.videoUrl || item.videoId;
  const type =
    item.type ||
    (isVideo ? 'video' : item.subcategory === 'PHOTO' ? 'photo' : 'news');
  const thumb =
    item.imageUrl ||
    item.thumbnail ||
    (item.videoId ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg` : '');
  return {
    id: item.id,
    name: item.name || item.title || item.id,
    label: item.label || item.description || '',
    subcategory: (item.subcategory || item.category || 'MEDIA').toUpperCase(),
    imageUrl: thumb,
    topGrants: Array.isArray(tags) ? tags.slice(0, 2) : [item.newsCategory || 'News'],
    grantsCount: 0,
    marketplaceHref: isVideo
      ? item.pageHref || item.href || 'https://www.greenwaysbuildings.com/greenways'
      : item.href || item.moreLink || item.pageHref || MEDIA_PAGES.sustainabilityNews,
    pageHref: item.pageHref || item.href || '',
    videoUrl: item.videoUrl || '',
    videoId: item.videoId || '',
    duration: item.duration || '',
    category: item.category || '',
    channelId: item.channelId || '',
    channelName: item.channelName || '',
    type,
    source: item.source || 'knowledge'
  };
}

function videoToSample(v, videoSource) {
  return toMediaSample({
    id: v.id,
    name: v.title,
    label: v.channelName ? `${v.channelName} — ${v.description || ''}`.slice(0, 120) : v.description,
    thumbnail: v.thumbnail,
    videoUrl: v.videoUrl,
    videoId: v.videoId || '',
    category: v.category,
    duration: v.duration,
    tags: v.tags,
    channelId: v.channelId,
    channelName: v.channelName,
    subcategory: 'VIDEO',
    type: 'video',
    source: v.source || videoSource,
    pageHref: v.pageHref
  });
}

function isVideoQuestion(question) {
  return /video|watch|wix|kitchen|hospitality|commercial kitchen|youtube|channel|rammed earth|smart home|hrc|futurebuild/.test(
    String(question || '').toLowerCase()
  );
}

async function pickVideoSamples(question, profile = {}, limit = 3, categoryHint = null) {
  const { videos, source, channels = [] } = await getVideosForAgent();
  let channelHint = resolveChannelHintFromQuestion(question, channels);
  let category = categoryHint;

  if (categoryHint && channels.some((c) => c.id === categoryHint)) {
    channelHint = categoryHint;
    category = channels.find((c) => c.id === categoryHint)?.category || categoryHint;
  }

  let pool = [...videos];
  if (channelHint) {
    const matches = pool.filter((v) => v.channelId === channelHint);
    if (matches.length) pool = matches;
    if (pool.length && !pool.some(isPlayableVideo)) {
      const playableCatalog = videos.filter((v) => v.videoUrl && v.category === (pool[0].category || 'restaurant'));
      if (playableCatalog.length) pool = [playableCatalog[0], ...pool];
    }
  } else if (category) {
    const matches = pool.filter(
      (v) => v.category === category || (category === 'energy' && v.category === 'general')
    );
    if (matches.length) pool = matches;
  }
  if (profile.sector === 'restaurant' && !channelHint && !category) {
    const rest = pool.filter((v) => v.category === 'restaurant');
    if (rest.length) pool = rest;
  }

  const q = String(question || '').toLowerCase();
  if (isVideoQuestion(q) || channelHint || category) {
    const picked = rankVideosForQuestion(pool, question, limit);
    return picked.map((v) => videoToSample(v, source));
  }

  const playableFirst = [...pool].sort((a, b) => Number(isPlayableVideo(b)) - Number(isPlayableVideo(a)));
  return playableFirst.slice(0, limit).map((v) => videoToSample(v, source));
}

function newsCategoryImage(showcase, newsCategory) {
  return wixBannerThumb(
    showcase.categoryImages?.news ||
      showcase.categoryImages?.[newsCategory] ||
      showcase.categoryImages?.policy ||
      ''
  );
}

/** Crop Wix static icons so banner thumbs fill the card slot (not tiny contain). */
function wixBannerThumb(url) {
  const u = String(url || '').trim();
  if (!u || u.includes('/v1/')) return u;
  const m = u.match(/^(https:\/\/static\.wixstatic\.com\/media\/([^~]+~mv2\.)(jpe?g|png|webp))/i);
  if (!m) return u;
  const fileId = m[2];
  const ext = m[3].toLowerCase();
  return `https://static.wixstatic.com/media/${fileId}${ext}/v1/fill/w_280,h_280,al_c,q_90,enc_auto/${fileId}${ext}`;
}

function bannerNewsPageHref(news, row) {
  return row?.pageHref || news?.pageHref || MEDIA_PAGES.sustainabilityNews;
}

function pickBannerPhoto(showcase, profile, videoPick) {
  const photos = showcase.photos || [];
  const restaurantLane =
    videoPick?.category === 'restaurant' || profile.sector === 'restaurant';
  if (restaurantLane) {
    return (
      photos.find((p) => p.id === 'photo-water') ||
      photos.find((p) => p.id === 'photo-kitchen') ||
      photos[0]
    );
  }
  return (
    photos.find((p) => p.id === 'photo-solar') ||
    photos.find((p) => p.id === 'photo-water') ||
    photos[0]
  );
}

async function buildDefaultBannerMix({
  showcase,
  newsItems,
  videos,
  videoSource,
  companies,
  profile = {},
  question = '',
  limit = 4
}) {
  const samples = [];
  const q = String(question || '').trim();

  let news = null;
  if (q.length >= 4) {
    const ranked = rankNewsItems(newsItems, question, 1);
    news = ranked[0];
  }
  if (!news) {
    const newsRow = (showcase.news || [])[0];
    news = newsRow ? findNewsById(newsItems, newsRow.id) : null;
  }
  if (news) {
    const row = (showcase.news || []).find((r) => r.id === news.id);
    samples.push(
      toMediaSample({
        id: news.id,
        title: news.title,
        label: row?.label || news.summary,
        description: news.summary,
        imageUrl: newsCategoryImage(showcase, news.newsCategory),
        href: bannerNewsPageHref(news, row),
        newsCategory: news.newsCategory
      })
    );
  }

  const sector = profile.sector;
  const videoPick =
    videos.find((v) => sector === 'restaurant' && v.category === 'restaurant' && (v.videoUrl || v.videoId)) ||
    videos.find((v) => v.category === 'restaurant' && (v.videoUrl || v.videoId)) ||
    videos.find((v) => v.videoUrl || v.videoId) ||
    videos[0];
  if (videoPick) samples.push(videoToSample(videoPick, videoSource));

  const photo = pickBannerPhoto(showcase, profile, videoPick);
  if (photo) samples.push(toMediaSample({ ...photo, subcategory: 'PHOTO', type: 'photo' }));

  if (samples.length < limit && (showcase.companies || []).length) {
    const mapCards = resolveShowcaseCompanies(showcase.companies, companies, 1);
    for (const card of mapCards) {
      if (!samples.some((s) => s.id === card.id)) samples.push(card);
    }
  }

  if (samples.length < limit) {
    const extraNewsRow = (showcase.news || []).find((row) => row.id !== news?.id);
    if (extraNewsRow) {
      const extra = findNewsById(newsItems, extraNewsRow.id);
      if (extra) {
        samples.push(
          toMediaSample({
            id: extra.id,
            title: extra.title,
            label: extraNewsRow.label || extra.summary,
            imageUrl: newsCategoryImage(showcase, extra.newsCategory),
            href: bannerNewsPageHref(extra, extraNewsRow),
            newsCategory: extra.newsCategory
          })
        );
      }
    }
  }

  return samples.slice(0, limit);
}

async function pickMediaSamples(question, profile = {}, limit = 4) {
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

  if (limit >= 3 && isVideoQuestion(question)) {
    return pickVideoSamples(question, profile, limit);
  }

  if (limit >= 3) {
    return buildDefaultBannerMix({
      showcase,
      newsItems,
      videos,
      videoSource,
      companies,
      profile,
      question,
      limit
    });
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
  return {
    answer:
      `I'm **Cheryce** — I turn sustainability headlines into **practical context**: what changed, why it matters for your bills or upgrades, and where to go next on Greenways.\n\n` +
      `Ask about **monthly news**, the **sustainability map** (${caseStudies.length} case studies + ${directory.length} organisations), **Wix videos**, or the **energy price ticker**. I summarise here and put editions, map examples, and tools on the right.\n\n` +
      `Not sure where to start? Try "latest sustainability roundup" or "organisations on the map for restaurant savings".\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(b, '', 'overview'),
    blocks: linkOrModuleBlocks([
      ...editionToLinkItems(catalog).slice(0, 2),
      toLinkItem('Sustainability map', MAP_PAGE_HREF, 'Case studies + directory — open in module'),
      toLinkItem('Energy prices ticker', MEDIA_PAGES.energyTicker, 'Wholesale context for timing upgrades')
    ])
  };
}

async function buildNewsCategoryAnswer(category, catalog, tip) {
  const rows = filterByCategory(catalog.items, category);
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  const ranked = rows.slice(0, 6);
  return {
    answer:
      `Here is **${label.toLowerCase()} news** from Greenways — ${rows.length} items in the library.\n\n` +
      `I picked a few headlines that stand out; **open the cards on the right** for full stories and monthly editions.\n\n_${tip}_`,
    suggestions: [],
    intentId: `news_${category}`,
    blocks: newsBlocksFromItems(ranked, catalog, 6)
  };
}

async function buildMonthlyNewsAnswer(catalog, profile, tip, briefing) {
  const sust = getLatestEdition(catalog.editions, 'sustainability');
  const editionStories = sust
    ? catalog.items.filter(
        (i) =>
          i.edition === sust.edition &&
          i.editionType === 'sustainability' &&
          i.catalogSource === 'content-ops-html'
      )
    : [];
  const fallback = rankNewsItems(
    catalog.items.filter((i) => i.editionType !== 'tech'),
    'sustainability policy funding circular',
    8
  );
  const highlights = editionStories.length ? editionStories.slice(0, 8) : fallback;
  const topStories = highlights.slice(0, 4);
  const mapExamples = await buildMapNewsCrosslinkItems(
    profile,
    'sustainability energy savings case study',
    2
  );
  const b = briefing || (await loadBriefing());
  const storyLinks = topStories.map(newsItemToLinkItem);
  const linkItems = [...storyLinks, ...mapExamples].slice(0, 6);

  return {
    answer:
      `Here is what stands out in **sustainability news**${sust ? ` (${sust.edition} edition)` : ''} for your profile.\n\n` +
      `I focus on **why each story matters** — policy, funding, and equipment angles that can change your upgrade timing or running costs. ` +
      `${topStories.length ? `I've picked **${topStories.length} headlines** to start; open the cards on the right for full story pages.` : 'Browse the latest edition on the right when you want every story.'}\n\n` +
      `Want me to explain a term (CBAM, CSRD, Horizon Europe) or tie a headline to the **sustainability map**?\n\n_${tip}_`,
    suggestions: [],
    agentHandoffs: buildHandoffs(b, '', 'monthly_news'),
    blocks: linkItems.length ? linkOrModuleBlocks(linkItems) : []
  };
}

async function buildTechNewsAnswer(catalog, tip) {
  const tech = getLatestEdition(catalog.editions, 'tech');
  const techStories = tech
    ? catalog.items.filter((i) => i.edition === tech.edition && i.editionType === 'tech')
    : catalog.items.filter((i) => i.editionType === 'tech' || i.catalogSource === 'tech-kb');
  const highlights = techStories.slice(0, 6);
  return {
    answer:
      `Here is **tech & innovation news**${tech ? ` from the **${tech.edition}** edition` : ''}.\n\n` +
      `I keep the chat short — **open the cards on the right** for full headlines and edition pages.\n\n_${tip}_`,
    suggestions: [],
    intentId: 'tech_news',
    blocks: newsBlocksFromItems(highlights, catalog, 6)
  };
}

async function buildStorySearchAnswer(question, catalog, tip) {
  const ranked = rankNewsItems(catalog.items, question, 8);
  if (!ranked.length) return null;
  return {
    answer:
      `Here are the **headlines** closest to your question.\n\n` +
      `Details live on the **cards to the right** — not as a long list here. ` +
      `Ask me to explain a term or tie a story to the **sustainability map**.\n\n_${tip}_`,
    suggestions: [],
    source: 'news-search',
    intentId: 'story_search',
    blocks: newsBlocksFromItems(ranked, catalog, 6)
  };
}

function videoToLinkItem(v) {
  const desc = [
    v.duration,
    v.channelName,
    String(v.description || '').slice(0, 90)
  ]
    .filter(Boolean)
    .join(' · ');
  const url = v.videoUrl || (v.videoId ? `https://www.youtube.com/watch?v=${v.videoId}` : v.pageHref || '#');
  return toLinkItem(v.title || 'Video', url, desc || 'Greenways video');
}

function videoToVideoBlockItem(v) {
  const desc = [
    v.duration,
    v.channelName,
    String(v.description || '').slice(0, 90)
  ]
    .filter(Boolean)
    .join(' · ');
  return {
    id: v.id || v.videoId || v.title,
    title: v.title || 'Video',
    description: desc || 'Greenways video',
    videoId: v.videoId || '',
    videoUrl: v.videoUrl || '',
    thumbnail: v.thumbnail || v.imageUrl || '',
    channelId: v.channelId || '',
    channelName: v.channelName || '',
    category: v.category || '',
    duration: v.duration || '',
    source: v.source || '',
    pageHref: v.pageHref || 'https://www.greenwaysbuildings.com/greenways'
  };
}

function orderVideosForDisplay(list, max = 8) {
  const playable = list.filter(isPlayableVideo);
  const siteOnly = list.filter((v) => !isPlayableVideo(v));
  return [...playable, ...siteOnly].slice(0, max);
}

function buildVideoBlocks(title, videos, max = 8) {
  const items = orderVideosForDisplay(videos, max).map(videoToVideoBlockItem);
  if (!items.length) return [];
  return [{ type: 'video', title, items }];
}

async function buildChannelVideosAnswer(channelId, tip, question, profile = {}) {
  const { videos, channels = [] } = await getVideosForAgent();
  const channel = channels.find((c) => c.id === channelId);
  const label = channel?.name || channelId;
  const list = videos.filter((v) => v.channelId === channelId);
  const playable = list.filter(isPlayableVideo).length;
  const picks = orderVideosForDisplay(list, 8);
  return {
    answer:
      `**${label}** — **${list.length}** videos on Greenways (**${playable}** play here with ▶).\n\n` +
      `I know this channel well — browse the **${picks.length} cards on the right** from the same group. ` +
      `After you watch one, the player suggests **more from this channel**.\n\n_${tip}_`,
    suggestions: picks.length > 1
      ? picks.slice(1, 4).map((v) => `Tell me about ${v.title}`)
      : [],
    intentId: `channel_${channelId}`,
    blocks: buildVideoBlocks(`${label} — channel picks`, list, 8)
  };
}

async function buildVideoCategoryAnswer(category, tip, question, profile = {}) {
  const { videos, source } = await getVideosForAgent();
  const label = VIDEO_CATEGORIES[category] || category;
  const matches = videos.filter((v) => v.category === category || (category === 'energy' && v.category === 'general'));
  const list = matches.length ? matches : videos;
  const picks = orderVideosForDisplay(list, 8);
  const syncNote =
    source === 'wix'
      ? ''
      : source === 'catalog' || source === 'catalog+youtube'
        ? '_Product MP4s + YouTube channel export — full Wix sync when API credentials are live on Render._\n\n'
        : '_Sample showcase until Wix credentials are configured on Render._\n\n';
  return {
    answer:
      `**${label}** across Greenways — **${picks.length}** picks on the right, grouped by topic. ` +
      `Tap **▶** to watch; the player surfaces **more from the same channel** after each clip.\n\n` +
      syncNote +
      `_${tip}_`,
    suggestions: picks.length > 1
      ? picks.slice(1, 4).map((v) => `Play ${v.title}`)
      : [],
    intentId: `video_${category}`,
    blocks: buildVideoBlocks(`${label} — video picks`, list, 8)
  };
}

async function buildWixVideosAnswer(tip) {
  const { videos, source, channels = [], youtubeCount = 0 } = await getVideosForAgent();
  const mp4Count = videos.filter((v) => v.videoUrl).length;
  const ytCount = videos.filter((v) => v.videoId).length;
  const channelLines = (channels || [])
    .map((c) => {
      const n = videos.filter((v) => v.channelId === c.id).length;
      return n ? `- **${c.name}:** ${n} videos` : `- **${c.name}** _(on site — export to sync titles)_`;
    })
    .join('\n');
  const quickPicks = orderVideosForDisplay(videos.filter(isPlayableVideo), 6);
  return {
    answer:
      `**Greenways video library** on [/greenways](https://www.greenwaysbuildings.com/greenways) — **14 Wix Video channels** (YouTube feeds) plus marketplace product demos.\n\n` +
      `**Cheryce can see right now:** ${mp4Count} playable product MP4s + **${youtubeCount || videos.filter((v) => v.source === 'wix-youtube').length}** curated YouTube titles from your channel export (${ytCount} with ▶ embed IDs so far).\n\n` +
      `**Quick picks** are on the right — ask for a **channel by name** and I will show **everything in that group**.\n\n` +
      `**Your Wix Video channels:**\n${channelLines}\n\n` +
      (source === 'wix'
        ? ''
        : source === 'catalog' || source === 'catalog+youtube'
          ? '_Product MP4s from marketplace media; YouTube channel list from `wix-youtube-channels.json`. Re-export `/greenways` and run `npm run parse:greenways-youtube` to refresh._\n\n'
          : '⚠️ Wix API credentials not live — showing catalog snapshot.\n\n') +
      `_${tip}_`,
    suggestions: [
      'Show Restaurant Energy Savings videos',
      'Sustainability in Action videos',
      'Home Energy Savings smart home videos'
    ],
    intentId: 'wix_videos',
    blocks: quickPicks.length
      ? buildVideoBlocks('Playable now — tap ▶', quickPicks, 6)
      : []
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
      `**Media & news on Greenways** — pick a portal on the right to browse editions, references, the map, ticker, or finders.\n\n` +
      `**Monthly editions (content-ops):**\n${editionLinksBlock(catalog)}\n\n` +
      `Videos: Wix Media library (site video sections by topic).\n\n_${tip}_`,
    suggestions: [],
    blocks: linkOrModuleBlocks([
      toLinkItem('Sustainability news', MEDIA_PAGES.sustainabilityNews, 'Site news page'),
      toLinkItem('Sustainable references', MEDIA_PAGES.sustainableReferences, 'Curated link library'),
      toLinkItem('Energy prices ticker', MEDIA_PAGES.energyTicker, 'Wholesale context'),
      toLinkItem('Energy monitoring guide', MEDIA_PAGES.importanceMonitoring, 'Why baseline first'),
      toLinkItem('Water Saving Finder', MEDIA_PAGES.waterGuide, 'Water lane products'),
      toLinkItem('Deals ticker hub', MEDIA_PAGES.dealsHub, 'Offers and search'),
      toLinkItem('Sustainability map', MEDIA_PAGES.sustainabilityMap, 'Case studies + directory')
    ])
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
    blocks: linkOrModuleBlocks([
      toLinkItem('Energy prices ticker', MEDIA_PAGES.energyTicker, 'Wholesale context for news timing'),
      toLinkItem('Deals ticker hub', MEDIA_PAGES.dealsHub, 'Offers when prices shift')
    ]),
    agentHandoffs: buildHandoffs(b, '', 'energy_prices')
  };
}

async function buildHowThisHelpsAnswer(question, catalog, profile, tip) {
  const ranked = rankNewsItems(catalog.items, question || 'policy funding impact', 6);
  const withImpact = ranked.filter((i) => (i.impact || []).length);
  const pool = withImpact.length ? withImpact : ranked;
  return {
    answer:
      `**How this helps you** — I picked stories with clear **impact lines** (bills, compliance, upgrade timing).\n\n` +
      `Open the **cards on the right** for each headline; full newsletters are in the monthly editions.\n\n_${tip}_`,
    suggestions: [],
    intentId: 'how_this_helps',
    blocks: newsBlocksFromItems(pool, catalog, 6)
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
    blocks: splitReferenceBlocks(picks.slice(0, 6)),
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
    case 'daily_brief':
      return rankNewsItems(catalog.items, question || 'sustainability today', 6);
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

async function buildReferralWelcomeAnswer(question, profile, tip, briefing) {
  const handoff = profile.handoff;
  if (!isReferralWelcomePair('media-agent', handoff)) return null;

  const fromName = handoff.fromName || 'Andrieus';
  const topic =
    handoff.topicSummary ||
    buildHandoffTopicSummary(
      handoff.fromSlug,
      handoff.fromIntentId,
      profile,
      handoff.question || question,
      handoff.summary
    );
  const searchQ = handoff.question || question;

  if (shouldTryDailyBrief(searchQ) || handoff.fromIntentId === 'daily_brief') {
    const brief = await buildDailyBriefAnswer(searchQ, profile, tip, briefing);
    const body = String(brief.answer || '').replace(/\n\n_[\s\S]*_$/, '');
    return {
      ...brief,
      answer:
        `**${fromName}** suggested you continue with me for **sustainability news context**.\n\n` +
        `From your chat: _${topic}_\n\n` +
        `${body}\n\n_${tip}_`,
      intentId: 'agent_referral_welcome',
      agentHandoffs: buildHandoffs(briefing, searchQ, 'agent_referral_welcome')
    };
  }

  const catalog = await loadFullNewsCatalog();
  const picks = rankNewsItems(catalog.items, searchQ, 5);
  const linkItems = picks.slice(0, 5).map((item) =>
    toLinkItem(item.title, item.pageHref || MEDIA_PAGES.sustainabilityNews, item.summary || '')
  );

  return {
    answer:
      `**${fromName}** suggested you continue with me for **news and story context**.\n\n` +
      `From your chat: _${topic}_\n\n` +
      `Here are **${linkItems.length}** grounded story picks from our catalogue — open a card for the full edition or map cross-links.\n\n_${tip}_`,
    suggestions: [],
    blocks: linkOrModuleBlocks([
      ...linkItems,
      toLinkItem('Sustainability map', MAP_PAGE_HREF, 'Case studies and directory')
    ]),
    intentId: 'agent_referral_welcome',
    agentHandoffs: buildHandoffs(briefing, searchQ, 'agent_referral_welcome')
  };
}

async function answerFromKnowledge(question, profile = {}) {
  const intents = await loadIntentsFrom(intentsPath);
  const voice = await loadAgentVoice(voicePath);
  const briefing = await loadBriefing();
  const catalog = await loadFullNewsCatalog();
  const { videos } = await getVideosForAgent();

  if (profile.handoff) {
    const referralTip = pickTip(intents.staticTips, 'agent_referral_welcome', {
      skipIntentIds: voice.skipTipIntents
    });
    const referral = await buildReferralWelcomeAnswer(question, profile, referralTip, briefing);
    if (referral?.answer) {
      referral.source = 'knowledge';
      applyPersona(referral, {
        voice,
        intentId: 'agent_referral_welcome',
        question,
        profile,
        staticTips: intents.staticTips,
        tip: referralTip
      });
      return referral;
    }
  }

  const intent = matchIntent(question, intents);
  const tip = pickTip(intents.staticTips, intent?.id, { skipIntentIds: voice.skipTipIntents });

  let result;
  if (shouldTryDailyBrief(question)) {
    result = await buildDailyBriefAnswer(question, profile, tip, briefing);
    result = await attachModules(result, profile, [
      'energy-prices-ticker',
      'sustainability-news-edition',
      'sustainability-map'
    ]);
  } else if (intent) {
  switch (intent.answerType) {
      case 'overview':
        result = await buildOverviewAnswer(catalog, videos, tip, briefing);
        result = await attachModules(result, profile, ['sustainability-map', 'energy-prices-ticker']);
        break;
      case 'sustainability_map_explained': {
        result = await buildSustainabilityMapExplainedAnswer(question, profile, tip);
        result.agentHandoffs = buildHandoffs(briefing, question, 'sustainability_map_explained');
        result = await attachModules(result, profile, ['sustainability-map']);
        break;
      }
      case 'sustainability_map': {
        result = await buildSustainabilityMapAnswer(question, profile, tip);
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
      case 'daily_brief':
        result = await buildDailyBriefAnswer(question, profile, tip, briefing);
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
        result = await buildVideoCategoryAnswer(intent.category, tip, question, profile);
        result.agentHandoffs = buildHandoffs(briefing, question, intent.id);
        break;
      case 'channel_videos':
        result = await buildChannelVideosAnswer(intent.channelId, tip, question, profile);
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
    if (isMapExplainQuestion(question)) {
      result = await buildSustainabilityMapExplainedAnswer(question, profile, tip);
      result.agentHandoffs = buildHandoffs(briefing, question, 'sustainability_map_explained');
      result = await attachModules(result, profile, ['sustainability-map']);
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
        intent.answerType === 'channel_videos' ||
        intent.answerType === 'wix_videos' ||
        intent.id === 'restaurant_videos' ||
        intent.id === 'energy_videos' ||
        intent.id === 'water_videos');
    const keepSamples = Array.isArray(result.productSamples) && result.productSamples.length;
    if (videoIntent || isVideoQuestion(question)) {
      result.productSamples = await pickVideoSamples(
        question,
        profile,
        3,
        intent?.channelId || intent?.category || null
      );
    } else if (!keepSamples) {
      result.productSamples = await pickMediaSamples(question, profile, 4);
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
  pickRelatedVideos,
  resolveVideoSeed,
  relatedStoryLine,
  loadDailyBrief,
  buildDailyBriefAnswer,
  getDefaultProductSamples: (limit = 4) => pickMediaSamples('', {}, limit),
  loadFullNewsCatalog,
  loadBriefing,
  loadReferences,
  MEDIA_KNOWLEDGE_VERSION
};
