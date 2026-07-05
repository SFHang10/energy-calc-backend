/**
 * Unified sustainability + tech news catalogue for Media Agent.
 * Merges: news-category-knowledge.json, tech-news-category-knowledge.json,
 * news-product-recommendations.json, content-ops monthly HTML editions, sources .md files.
 */

const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');

const ROOT = path.join(__dirname, '..');
const NEWS_KB = path.join(ROOT, 'data', 'news-category-knowledge.json');
const TECH_KB = path.join(ROOT, 'data', 'tech-news-category-knowledge.json');
const NEWS_PRODUCTS = path.join(ROOT, 'data', 'news-product-recommendations.json');

const CONTENT_OPS_SCAN_DIRS = [
  path.join(ROOT, 'content-ops', 'review', 'sustainability-news'),
  path.join(ROOT, 'content-ops', 'review', 'new-in-tech'),
  path.join(ROOT, 'content-ops', 'drafts', 'sustainability-news')
];

/** Latest published sustainability newsletter on Render (content-ops review). */
const DEFAULT_SUSTAINABILITY_NEWS_HREF =
  '/content-ops/review/sustainability-news/2026-06-sustainability-news.html';

const HTMLS_NEWS_PAGES = [
  { href: DEFAULT_SUSTAINABILITY_NEWS_HREF, title: 'Sustainability news (June 2026 edition)', type: 'sustainability' }
];

let catalogCache = null;

function decodeHtml(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function slugId(prefix, text) {
  return `${prefix}-${String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)}`;
}

function contentOpsWebPath(absPath) {
  const rel = path.relative(ROOT, absPath).split(path.sep).join('/');
  return `/${rel}`;
}

async function loadJsonSafe(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function itemsFromCategoryKnowledge(knowledge, sourceLabel) {
  const items = [];
  for (const [category, rows] of Object.entries(knowledge.categories || {})) {
    for (const row of rows || []) {
      items.push({
        id: row.id || slugId('kb', row.title),
        title: row.title,
        summary: row.summary || '',
        impact: row.impact || [],
        sources: row.sources || [],
        newsCategory: category,
        catalogSource: sourceLabel,
        edition: null,
        editionType: sourceLabel === 'tech' ? 'tech' : 'sustainability',
        pageHref: null,
        differences: row.differences || [],
        similarTo: row.similarTo || []
      });
    }
  }
  return items;
}

async function parseSourcesMarkdown(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const editionMatch = path.basename(filePath).match(/(\d{4}-\d{2})/);
  const edition = editionMatch ? editionMatch[1] : null;
  const editionType = filePath.includes('new-in-tech') ? 'tech' : 'sustainability';
  const items = [];
  let section = 'general';

  for (const line of raw.split('\n')) {
    if (line.startsWith('## ')) {
      section = line.slice(3).trim();
      continue;
    }
    const urlMatch = line.match(/https?:\/\/[^\s)]+/);
    if (!urlMatch) continue;
    const url = urlMatch[0].replace(/[.,;]+$/, '');
    const titlePart = line.split(url)[0].replace(/^-\s*/, '').trim();
    if (!titlePart || titlePart.length < 4) continue;
    items.push({
      id: slugId(`src-${edition || 'x'}`, titlePart),
      title: titlePart,
      summary: `Source monitor — ${section}`,
      impact: [],
      sources: [url],
      newsCategory: section.toLowerCase().includes('fund')
        ? 'funding'
        : section.toLowerCase().includes('circular')
          ? 'circular'
          : section.toLowerCase().includes('energy')
            ? 'policy'
            : 'policy',
      catalogSource: 'content-ops-sources',
      edition,
      editionType,
      pageHref: null
    });
  }
  return items;
}

async function parseNewsHtmlEdition(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const editionMatch = path.basename(filePath).match(/(\d{4}-\d{2})/);
  const edition = editionMatch ? editionMatch[1] : null;
  const editionType = filePath.includes('new-in-tech') ? 'tech' : 'sustainability';
  const pageHref = contentOpsWebPath(filePath);
  const items = [];

  const cardRe =
    /<h3 class="card-title">([\s\S]*?)<\/h3>\s*<p class="card-text">([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = cardRe.exec(raw)) !== null) {
    const title = decodeHtml(match[1].replace(/<[^>]+>/g, ''));
    const summary = decodeHtml(match[2].replace(/<[^>]+>/g, ''));
    if (!title) continue;
    items.push({
      id: slugId(`ed-${edition}-${editionType}`, title),
      title,
      summary,
      impact: [],
      sources: [],
      newsCategory: editionType === 'tech' ? 'tech' : 'monthly',
      catalogSource: 'content-ops-html',
      edition,
      editionType,
      pageHref
    });
  }

  const quoteMatch = raw.match(/<div class="quote">\s*([\s\S]*?)\s*<\/div>/);
  if (quoteMatch) {
    items.unshift({
      id: `edition-summary-${edition}-${editionType}`,
      title: `${editionType === 'tech' ? 'New in Tech' : 'Sustainability News'} — ${edition || 'edition'} summary`,
      summary: decodeHtml(quoteMatch[1].replace(/<[^>]+>/g, '').slice(0, 500)),
      impact: [],
      sources: [],
      newsCategory: 'monthly',
      catalogSource: 'content-ops-html',
      edition,
      editionType,
      pageHref
    });
  }

  return { edition, editionType, pageHref, items };
}

async function listFilesRecursive(dir, pattern) {
  const out = [];
  if (!fsSync.existsSync(dir)) return out;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await listFilesRecursive(full, pattern)));
    } else if (pattern.test(ent.name)) {
      out.push(full);
    }
  }
  return out;
}

function attachProductLinks(items, newsProducts) {
  const byNewsId = new Map((newsProducts.items || []).map((i) => [i.newsId, i]));
  return items.map((item) => {
    const extra = byNewsId.get(item.id);
    if (!extra) return item;
    return {
      ...item,
      relatedProducts: (extra.recommendations || []).slice(0, 3).map((r) => ({
        productId: r.productId,
        productName: r.productName,
        reason: r.reason,
        url: r.url
      })),
      moreLink: extra.moreLink || item.sources?.[0] || null
    };
  });
}

function dedupeItems(items) {
  const seen = new Map();
  for (const item of items) {
    const key = String(item.id || item.title).toLowerCase();
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, item);
      continue;
    }
    seen.set(key, {
      ...existing,
      summary: existing.summary || item.summary,
      sources: [...new Set([...(existing.sources || []), ...(item.sources || [])])],
      pageHref: existing.pageHref || item.pageHref,
      impact: existing.impact?.length ? existing.impact : item.impact,
      relatedProducts: existing.relatedProducts || item.relatedProducts
    });
  }
  return [...seen.values()];
}

async function loadFullNewsCatalog() {
  if (catalogCache) return catalogCache;

  const [newsKb, techKb, newsProducts] = await Promise.all([
    loadJsonSafe(NEWS_KB, { categories: {} }),
    loadJsonSafe(TECH_KB, { categories: {} }),
    loadJsonSafe(NEWS_PRODUCTS, { items: [] })
  ]);

  let items = [...itemsFromCategoryKnowledge(newsKb, 'sustainability-kb')];

  // tech-news file uses greenTech etc. at root — not categories{}
  for (const key of ['greenTech', 'generalTech', 'policy', 'funding', 'countries']) {
    const rows = techKb[key];
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      items.push({
        id: row.id || slugId('tech', row.title),
        title: row.title,
        summary: row.summary || '',
        impact: row.impact || [],
        sources: row.sources || [],
        newsCategory: key,
        catalogSource: 'tech-kb',
        editionType: 'tech',
        pageHref: null
      });
    }
  }

  const editions = [];

  for (const dir of CONTENT_OPS_SCAN_DIRS) {
    const htmlFiles = await listFilesRecursive(dir, /^\d{4}-\d{2}-(sustainability-news|new-in-tech)\.html$/);
    for (const file of htmlFiles) {
      const parsed = await parseNewsHtmlEdition(file);
      if (parsed.items.length) {
        editions.push({
          edition: parsed.edition,
          type: parsed.editionType,
          pageHref: parsed.pageHref,
          title:
            parsed.editionType === 'tech'
              ? `New in Tech — ${parsed.edition}`
              : `Sustainability News — ${parsed.edition}`,
          storyCount: parsed.items.length
        });
        items.push(...parsed.items);
      }
    }

    const mdFiles = await listFilesRecursive(dir, /^\d{4}-\d{2}-(sustainability-news|new-in-tech)-sources\.md$/);
    for (const file of mdFiles) {
      items.push(...(await parseSourcesMarkdown(file)));
    }
  }

  items = attachProductLinks(dedupeItems(items), newsProducts);
  editions.sort((a, b) => String(b.edition).localeCompare(String(a.edition)));

  catalogCache = {
    updatedAt: newsKb.updatedAt || null,
    items,
    editions,
    htmlsPages: HTMLS_NEWS_PAGES,
    stats: {
      total: items.length,
      knowledgeBase: items.filter((i) => i.catalogSource.includes('kb')).length,
      monthlyEditions: editions.length,
      withProductLinks: items.filter((i) => i.relatedProducts?.length).length
    }
  };

  return catalogCache;
}

function scoreNewsItem(item, question) {
  const q = String(question || '').toLowerCase();
  const hay = [
    item.title,
    item.summary,
    item.newsCategory,
    item.edition,
    item.editionType,
    ...(item.impact || []),
    ...(item.sources || [])
  ]
    .join(' ')
    .toLowerCase();
  let score = 0;
  if (item.title?.toLowerCase().includes(q)) score += 10;
  const tokens = q.split(/\s+/).filter((t) => t.length >= 3);
  for (const token of tokens) {
    if (hay.includes(token)) score += 3;
  }
  if (item.catalogSource === 'content-ops-html') score += 2;
  return score;
}

function rankNewsItems(items, question, limit = 8) {
  return items
    .map((item) => ({ item, score: scoreNewsItem(item, question) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.item);
}

function formatNewsItemBullet(item, newsProducts) {
  const impact = (item.impact || []).slice(0, 2).join(' · ');
  const head = `**${item.title}**${item.edition ? ` _(${item.edition} ${item.editionType || ''})_` : ''} — ${String(item.summary || '').slice(0, 140)}`;
  const impactLine = impact ? `\n  _Why it matters:_ ${impact}` : '';
  const link = item.pageHref || item.moreLink || (item.sources && item.sources[0]) || '';
  const productLine =
    item.relatedProducts?.length
      ? `\n  _Related on Greenways:_ ${item.relatedProducts.map((p) => p.productName).join(', ')}`
      : '';
  return link
    ? `- ${head}${impactLine}${productLine}\n  → ${link}`
    : `- ${head}${impactLine}${productLine}`;
}

function formatNewsBullets(items, max = 6) {
  return items.slice(0, max).map((item) => formatNewsItemBullet(item)).join('\n');
}

function filterByCategory(items, category) {
  return items.filter((i) => i.newsCategory === category);
}

function getLatestEdition(editions, type) {
  return editions.find((e) => e.type === type) || null;
}

function editionKey(edition, type) {
  return `${edition}-${type}`;
}

function pickEditionChips(catalog, options = {}) {
  const { citedItems = [], intentId = null, limit = 3 } = options;
  const map = new Map();

  const addFromCatalogEdition = (ed) => {
    if (!ed?.pageHref || !ed.edition) return;
    map.set(editionKey(ed.edition, ed.type), {
      edition: ed.edition,
      type: ed.type,
      title: ed.title,
      url: ed.pageHref,
      storyCount: ed.storyCount || 0
    });
  };

  const addFromItem = (item) => {
    if (!item?.pageHref || !item.edition) return;
    const type = item.editionType || 'sustainability';
    const title =
      type === 'tech'
        ? `New in Tech — ${item.edition}`
        : `Sustainability News — ${item.edition}`;
    const existing = catalog.editions.find((e) => e.edition === item.edition && e.type === type);
    map.set(editionKey(item.edition, type), {
      edition: item.edition,
      type,
      title: existing?.title || title,
      url: item.pageHref,
      storyCount: existing?.storyCount || 0
    });
  };

  const sustOnlyIntents = [
    'policy_news',
    'funding_news',
    'circular_news',
    'country_news',
    'monthly_news'
  ];

  for (const item of citedItems) {
    if (sustOnlyIntents.includes(intentId) && item.editionType === 'tech') continue;
    addFromItem(item);
  }

  if (['monthly_news', 'overview', 'portals', 'story_search'].includes(intentId)) {
    addFromCatalogEdition(getLatestEdition(catalog.editions, 'sustainability'));
  }
  if (['tech_news', 'overview', 'portals', 'story_search'].includes(intentId)) {
    addFromCatalogEdition(getLatestEdition(catalog.editions, 'tech'));
  }
  const categoryIntents = [
    'news_category',
    'policy_news',
    'funding_news',
    'circular_news',
    'country_news'
  ];
  if (categoryIntents.includes(intentId) && !map.size) {
    addFromCatalogEdition(getLatestEdition(catalog.editions, 'sustainability'));
  }

  return [...map.values()]
    .sort((a, b) => String(b.edition).localeCompare(String(a.edition)))
    .slice(0, limit)
    .map((e) => ({
      id: editionKey(e.edition, e.type),
      label: e.type === 'tech' ? `${e.edition} Tech` : `${e.edition} News`,
      title: e.title,
      url: e.url,
      edition: e.edition,
      editionType: e.type,
      storyCount: e.storyCount
    }));
}

module.exports = {
  loadFullNewsCatalog,
  scoreNewsItem,
  rankNewsItems,
  formatNewsBullets,
  formatNewsItemBullet,
  filterByCategory,
  getLatestEdition,
  pickEditionChips,
  contentOpsWebPath,
  DEFAULT_SUSTAINABILITY_NEWS_HREF,
  HTMLS_NEWS_PAGES
};
