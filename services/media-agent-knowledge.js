const path = require('path');
const fs = require('fs/promises');
const { loadIntentsFrom, matchIntent } = require('./greenways-agent-shared');
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
  rankCompanies,
  resolveShowcaseCompanies,
  buildSustainabilityMapAnswer,
  buildEnergyExamplesAnswer,
  buildMapNewsCrosslinkBlock,
  isMapRelatedQuestion,
  companyToMediaSample
} = require('./media-agent-companies');

const intentsPath = path.join(__dirname, '..', 'data', 'media-agent-intents.json');
const showcasePath = path.join(__dirname, '..', 'data', 'media-agent-showcase.json');

const MEDIA_PAGES = {
  sustainabilityNews: './January%20Sustainable%20News%20Original%20.html',
  sustainableReferences: './Sustainable%20References%20.HTML',
  importanceMonitoring: './Importance%20of%20Energy%20Monitoring.html',
  waterGuide: './water-saving-finder.html',
  dealsHub: './deals-ticker-hub.html',
  sustainabilityMap: MAP_PAGE_HREF
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
  return {
    id: item.id,
    name: item.name || item.title || item.id,
    label: item.label || item.description || '',
    subcategory: (item.subcategory || item.category || 'MEDIA').toUpperCase(),
    imageUrl: item.imageUrl || item.thumbnail || '',
    topGrants: Array.isArray(tags) ? tags.slice(0, 2) : [item.newsCategory || 'News'],
    grantsCount: 0,
    marketplaceHref: item.href || item.videoUrl || item.moreLink || item.pageHref || MEDIA_PAGES.sustainabilityNews,
    videoUrl: item.videoUrl || '',
    source: item.source || 'knowledge'
  };
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

  const q = question.toLowerCase();
  if (/video|watch|wix/.test(q)) {
    const ranked = videos
      .map((v) => {
        const hay = [v.title, v.description, v.category, ...(v.tags || [])].join(' ').toLowerCase();
        let score = 0;
        q.split(/\s+/).filter((t) => t.length >= 3).forEach((t) => {
          if (hay.includes(t)) score += 3;
        });
        return { v, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    for (const { v } of ranked.slice(0, limit)) {
      samples.push(
        toMediaSample({
          id: v.id,
          name: v.title,
          label: v.description,
          thumbnail: v.thumbnail,
          videoUrl: v.videoUrl,
          category: v.category,
          type: 'video'
        })
      );
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

async function buildOverviewAnswer(catalog, videos, tip) {
  const cats = [...new Set(catalog.items.map((i) => i.newsCategory).filter(Boolean))];
  const companies = await loadCompanies();
  return {
    answer:
      `**Greenways Media Agent** — news, video, and **sustainability map** case studies:\n\n` +
      `- **News catalogue:** ${catalog.stats.total} items (${catalog.stats.knowledgeBase} policy/funding KB + ${catalog.stats.monthlyEditions} monthly editions)\n` +
      `- **Categories:** ${cats.slice(0, 8).join(', ')}${cats.length > 8 ? '…' : ''}\n` +
      `- **Sustainability map:** ${companies.length} organisations — energy techniques, savings & payback examples\n` +
      `- **Product links:** ${catalog.stats.withProductLinks} stories tied to Greenways products\n` +
      `- **Wix videos:** ${videos.length} available (${videos[0]?.source === 'wix' ? 'live from Wix Media' : 'sample cards until Wix API connected'})\n\n` +
      `**Latest editions:**\n${editionLinksBlock(catalog)}\n\n` +
      `**Map:** ${MAP_PAGE_HREF}\n\n` +
      `Ask about policy, monthly roundups, case studies, or organisations worth benchmarking for energy savings.\n\n_${tip}_`,
    suggestions: []
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

async function buildMonthlyNewsAnswer(catalog, profile, tip) {
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
  return {
    answer:
      `**Sustainability news roundup**${sust ? ` — **${sust.edition}** edition` : ''}:\n\n` +
      `${formatNewsBullets(highlights, 8)}\n\n` +
      `**Read full edition:**\n${editionLinksBlock(catalog)}\n` +
      `Related: ${MEDIA_PAGES.sustainableReferences}` +
      `${mapBlock}\n\n_${tip}_`,
    suggestions: []
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
      `- **Energy monitoring guide:** ${MEDIA_PAGES.importanceMonitoring}\n` +
      `- **Water saving finder:** ${MEDIA_PAGES.waterGuide}\n` +
      `- **Deals & offers hub:** ${MEDIA_PAGES.dealsHub}\n` +
      `- **Sustainability map (case studies):** ${MEDIA_PAGES.sustainabilityMap}\n\n` +
      `Videos: Wix Media library (site video sections by topic).\n\n_${tip}_`,
    suggestions: []
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
  const catalog = await loadFullNewsCatalog();
  const { videos } = await getVideosForAgent();
  const tip = (intents.staticTips || [])[0] || '';
  const intent = matchIntent(question, intents);

  let result;
  if (intent) {
    switch (intent.answerType) {
      case 'overview':
        result = await buildOverviewAnswer(catalog, videos, tip);
        break;
      case 'sustainability_map':
        result = await buildSustainabilityMapAnswer(question, profile, tip);
        break;
      case 'energy_examples':
        result = await buildEnergyExamplesAnswer(question, profile, tip);
        break;
      case 'news_category':
        result = await buildNewsCategoryAnswer(intent.category, catalog, tip);
        break;
      case 'monthly_news':
        result = await buildMonthlyNewsAnswer(catalog, profile, tip);
        break;
      case 'tech_news':
        result = await buildTechNewsAnswer(catalog, tip);
        break;
      case 'video_category':
        result = await buildVideoCategoryAnswer(intent.category, tip);
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
    result.productSamples = await pickMediaSamples(question, profile, 3);
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  pickMediaSamples,
  getDefaultProductSamples: (limit = 3) => pickMediaSamples('', {}, limit),
  loadFullNewsCatalog
};
