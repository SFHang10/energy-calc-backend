/**
 * Sustainability news for Vincent — same catalogue as Media Agent (Cheryce),
 * ranked and explained through a finance / instruments lens.
 */

const {
  loadFullNewsCatalog,
  scoreNewsItem,
  filterByCategory,
  formatNewsItemBullet,
  getLatestEdition,
  pickEditionChips,
  HTMLS_NEWS_PAGES
} = require('./media-news-loader');
const { PORTAL_LINKS } = require('./greenways-agent-shared');

const FINANCE_NEWS_CATEGORIES = new Set(['funding', 'policy', 'circular', 'monthly']);

const INSTRUMENT_HINTS = [
  {
    keys: ['horizon', 'life programme', 'life programme', 'isde', 'subsidy', 'grant', 'cohesion', 'erdf', '€'],
    label: 'Grants & EU programmes',
    action: `Finance finder **Grants** tab · scheme detail via **Andrieus** (${PORTAL_LINKS.grantsAgent})`
  },
  {
    keys: ['eib', 'climate bank', 'green loan', 'loan', 'bmkb', 'warmtefonds', 'adaptation finance'],
    label: 'Green loans & bank finance',
    action: `Finance finder **Green loans** tab (${PORTAL_LINKS.finance})`
  },
  {
    keys: ['bnpl', 'lease', 'hire purchase', 'equipment finance'],
    label: 'BNPL & equipment finance',
    action: `Finance finder **BNPL** / **Equipment finance** tabs`
  },
  {
    keys: ['cbam', 'carbon border', 'csrd', 'reporting', 'omnibus', 'efficiency'],
    label: 'Compliance → verified ETL upgrades',
    action: `ETL product finder + savings projection — finance stack after payback`
  }
];

function financeHaystack(item) {
  return [
    item.title,
    item.summary,
    item.newsCategory,
    ...(item.impact || []),
    ...(item.sources || [])
  ]
    .join(' ')
    .toLowerCase();
}

function scoreFinanceNewsItem(item, question) {
  let score = scoreNewsItem(item, question);
  const hay = financeHaystack(item);
  const q = String(question || '').toLowerCase();

  if (item.newsCategory === 'funding') score += 8;
  if (FINANCE_NEWS_CATEGORIES.has(item.newsCategory)) score += 3;
  if (/fund|finance|grant|loan|eib|horizon|subsidy|invest|budget|€|bnpl/.test(hay)) score += 5;
  if (/fund|finance|grant|loan|news|policy|sustainability/.test(q)) score += 2;

  q.split(/\s+/).filter((t) => t.length >= 3).forEach((token) => {
    if (hay.includes(token)) score += 2;
  });

  return score;
}

function rankFinanceNews(items, question, limit = 8) {
  const q = String(question || '').trim();
  if (!q) {
    return items
      .filter((i) => i.newsCategory === 'funding' || /fund|eib|horizon|grant|loan/i.test(financeHaystack(i)))
      .slice(0, limit);
  }
  return items
    .map((item) => ({ item, score: scoreFinanceNewsItem(item, question) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.item);
}

function instrumentHintsForItem(item) {
  const hay = financeHaystack(item);
  const hits = [];
  for (const hint of INSTRUMENT_HINTS) {
    if (hint.keys.some((k) => hay.includes(k))) hits.push(hint);
  }
  if (item.newsCategory === 'funding' && !hits.length) {
    hits.push({
      label: 'EU / national funding',
      action: `Finance finder **Grants** + **Europe** tabs · **Andrieus** for eligibility`
    });
  }
  if (!hits.length) {
    hits.push({
      label: 'Upgrade finance stack',
      action: `Model payback (${PORTAL_LINKS.savingsProjection}) → BNPL / equipment finance / green loans`
    });
  }
  return hits.slice(0, 2);
}

function formatFinanceNewsBullet(item) {
  const hints = instrumentHintsForItem(item)
    .map((h) => `  _Finance path:_ ${h.label} — ${h.action}`)
    .join('\n');
  return `${formatNewsItemBullet(item)}\n${hints}`;
}

function formatFinanceNewsBullets(items, max = 6) {
  return items.slice(0, max).map(formatFinanceNewsBullet).join('\n\n');
}

function editionLinksBlock(catalog) {
  const sust = getLatestEdition(catalog.editions, 'sustainability');
  const lines = [];
  if (sust) {
    lines.push(`- **Latest sustainability edition (${sust.edition}):** ${sust.pageHref} — ${sust.storyCount} stories`);
  }
  lines.push(`- **Site news page:** ${HTMLS_NEWS_PAGES[0]?.href || '/content-ops/review/sustainability-news/2026-04-sustainability-news.html'}`);
  lines.push(`- **Full media view:** ${PORTAL_LINKS.mediaAgent || '/greenways/media-agent'} (Cheryce — editions & video)`);
  return lines.join('\n');
}

async function buildFinanceNewsAnswer(question, profile, tip, options = {}) {
  const catalog = await loadFullNewsCatalog();
  const category = options.category || null;
  let pool = catalog.items;
  if (category) {
    pool = filterByCategory(catalog.items, category);
    if (!pool.length && category === 'funding') {
      pool = catalog.items.filter((i) => /fund|grant|horizon|eib|loan/i.test(financeHaystack(i)));
    }
  }

  const ranked = rankFinanceNews(pool, question, options.limit || 6);
  const picks = ranked.length
    ? ranked
    : rankFinanceNews(catalog.items, question || 'funding finance grant', 6);

  const label = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Sustainability & finance';

  return {
    answer:
      `**${label} news** — ${catalog.stats.total} items in the shared catalogue (knowledge base + monthly editions + content-ops sources):\n\n` +
      `${formatFinanceNewsBullets(picks, 6) || '_No tight match — try “Horizon Europe funding” or “EIB climate finance”._'}\n\n` +
      `**How Vincent uses this:** each headline links to **financial instruments on Greenways** — grants (Andrieus), green loans, BNPL, equipment finance, and ETL upgrades — not just the headline.\n\n` +
      `**Editions & pages:**\n${editionLinksBlock(catalog)}\n\n` +
      `_Sources: sustainability news library and monthly editions (same pipeline as Cheryce)._\n\n_${tip}_`,
    suggestions: [],
    editionChips: pickEditionChips(catalog, { citedItems: picks, intentId: options.intentId || 'finance_news' }),
    intentId: options.intentId || 'finance_news'
  };
}

async function buildFundingNewsAnswer(question, profile, tip) {
  return buildFinanceNewsAnswer(question, profile, tip, {
    category: 'funding',
    intentId: 'funding_news',
    limit: 8
  });
}

async function buildSustainabilityFinanceNewsAnswer(question, profile, tip) {
  return buildFinanceNewsAnswer(question, profile, tip, {
    intentId: 'sustainability_finance_news',
    limit: 6
  });
}

module.exports = {
  rankFinanceNews,
  formatFinanceNewsBullets,
  instrumentHintsForItem,
  buildFinanceNewsAnswer,
  buildFundingNewsAnswer,
  buildSustainabilityFinanceNewsAnswer,
  editionLinksBlock
};
