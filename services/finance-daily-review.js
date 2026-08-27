/**
 * Vincent — daily price & news review (thin briefing layer).
 * Built offline by scripts/build-finance-daily-review.js → data/finance-daily-review.json
 */

const path = require('path');
const fs = require('fs/promises');
const {
  loadEnergySnapshot,
  formatChange,
  findMarketRow,
  volatilityHint
} = require('./finance-agent-energy');
const { rankFinanceNews, instrumentHintsForItem } = require('./finance-agent-news');
const { loadFullNewsCatalog } = require('./media-news-loader');
const { PORTAL_LINKS } = require('./greenways-agent-shared');
const {
  loadFinanceDailyExternal,
  loadFinanceNewsRolling,
  rollingToStoryShape
} = require('./finance-external-news');

const ROOT = path.join(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'data', 'finance-daily-review.json');
const MEDIA_BRIEF_PATH = path.join(ROOT, 'data', 'media-daily-brief.json');

const FOCUS_MARKETS = ['NL', 'DE', 'FR', 'ES'];

let fileCache = { at: 0, data: null };
const FILE_CACHE_MS = 60 * 1000;

async function readJsonSafe(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

async function loadFinanceDailyReview({ force = false } = {}) {
  const now = Date.now();
  if (!force && fileCache.data && now - fileCache.at < FILE_CACHE_MS) {
    return fileCache.data;
  }
  const data = await readJsonSafe(OUT_PATH);
  if (data) {
    fileCache = { at: now, data };
  }
  return data;
}

function pickMarkets(snapshot, limit = 4) {
  const rows = snapshot.allEnergy || [];
  const picked = [];
  for (const code of FOCUS_MARKETS) {
    const row = rows.find((r) => r.code === code);
    if (row) picked.push(row);
  }
  if (picked.length < limit) {
    for (const row of rows) {
      if (picked.some((p) => p.code === row.code)) continue;
      picked.push(row);
      if (picked.length >= limit) break;
    }
  }
  return picked.slice(0, limit).map((row) => ({
    code: row.code,
    name: row.name,
    priceEurMwh: Number(row.priceEurMwh),
    changePct: Number(row.changePct)
  }));
}

function financeAngleForStory(item) {
  const hints = instrumentHintsForItem(item);
  if (hints[0]) return `${hints[0].label} — ${hints[0].action}`;
  return 'Map to payback, grants, or green loans on Finance desk';
}

async function collectStories(limit = 3) {
  const stories = [];
  const seen = new Set();

  const rolling = await loadFinanceNewsRolling(limit * 2);
  for (const item of rolling) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    stories.push(rollingToStoryShape(item));
    if (stories.length >= limit) return stories;
  }

  const mediaBrief = await readJsonSafe(MEDIA_BRIEF_PATH);

  const briefStories = Array.isArray(mediaBrief?.stories) ? mediaBrief.stories : [];
  for (const item of briefStories) {
    const hay = `${item.title || ''} ${item.summary || ''}`.toLowerCase();
    if (!/energy|price|electr|gas|tariff|fund|cbam|omnibus|loan|grant|eib|horizon/.test(hay)) {
      continue;
    }
    if (!item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    stories.push({
      id: item.id,
      title: item.title,
      summary: String(item.summary || '').slice(0, 180),
      href: item.href || mediaBrief?.meta?.editionPageHref || null,
      financeAngle: item.whyItMatters || 'Policy / funding signal — check Finance finder + Andrieus for fit.'
    });
    if (stories.length >= limit) return stories;
  }

  try {
    const catalog = await loadFullNewsCatalog();
    const ranked = rankFinanceNews(
      catalog.items,
      'energy price funding electricity wholesale tariff grant',
      limit * 2
    );
    for (const item of ranked) {
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);
      stories.push({
        id: item.id,
        title: item.title,
        summary: String(item.summary || '').slice(0, 180),
        href: item.pageHref || item.moreLink || null,
        financeAngle: financeAngleForStory(item)
      });
      if (stories.length >= limit) break;
    }
  } catch (_) {
    /* catalogue optional at build time */
  }

  return stories;
}

function buildHeadline(markets, profile = {}) {
  const row = findMarketRow({ allEnergy: markets }, profile) || markets[0];
  if (!row) return 'Wholesale snapshot ready — pair with funding headlines';
  const move = formatChange(row.changePct);
  return `${row.name || row.code} wholesale ${move} · €${Number(row.priceEurMwh).toFixed(1)}/MWh guide`;
}

function buildBullets(snapshot, markets, stories, profile = {}) {
  const bullets = [];
  const top = markets[0];
  if (top && Number.isFinite(top.priceEurMwh)) {
    bullets.push({
      id: 'price-lead',
      kind: 'price',
      text: `**${top.name}** — €${top.priceEurMwh.toFixed(1)}/MWh wholesale (${formatChange(top.changePct)} vs prior). Other hubs on the wire for comparison.`
    });
  }

  bullets.push({
    id: 'meaning',
    kind: 'meaning',
    text: volatilityHint(snapshot, profile.region ? profile : { region: 'nl' })
  });

  bullets.push({
    id: 'retail-note',
    kind: 'caveat',
    text: 'Wholesale ≠ your restaurant bill — supplier tariffs, pass-through, and time-of-use still decide retail.'
  });

  if (stories[0]) {
    bullets.push({
      id: 'news-lead',
      kind: 'news',
      text: `In the news lens: **${stories[0].title}** — ${stories[0].financeAngle}`
    });
  }

  if (stories[1]) {
    bullets.push({
      id: 'news-2',
      kind: 'news',
      text: `Also watching: **${stories[1].title}**`
    });
  }

  return bullets.slice(0, 5);
}

/**
 * Build a fresh review object (used by the nightly script; also fallback if JSON missing).
 */
async function composeFinanceDailyReview(options = {}) {
  const profile = options.profile || { region: 'nl', sector: 'restaurant' };
  const snapshot = await loadEnergySnapshot();
  const markets = pickMarkets(snapshot, 4);
  const stories = await collectStories(3);
  const mediaBrief = await readJsonSafe(MEDIA_BRIEF_PATH);
  const externalDaily = await loadFinanceDailyExternal();
  const now = new Date();
  const bullets = buildBullets(snapshot, markets, stories, profile);
  const headline = buildHeadline(markets, profile);

  return {
    meta: {
      version: 1,
      generatedAt: now.toISOString(),
      briefDate: now.toISOString().slice(0, 10),
      source: options.source || 'heuristic',
      tickerUpdatedAt: snapshot.updatedAt || snapshot.meta?.updatedAt || null,
      mediaBriefDate: mediaBrief?.meta?.briefDate || null,
      edition: mediaBrief?.meta?.edition || null,
      externalHeadlinesAt: externalDaily?.meta?.fetchedAt || null,
      externalHeadlineCount: externalDaily?.items?.length || 0,
      disclaimer:
        'Illustrative wholesale guide and curated news — not live retail quotes or investment advice. External headlines attributed to official RSS sources.'
    },
    headline,
    bullets,
    markets,
    stories,
    externalHeadlines: (externalDaily?.items || []).slice(0, 5),
    cta: {
      label: 'Open Finance wire',
      href: '/greenways/finance-wire',
      askVincent: "What's today's energy price review?"
    }
  };
}

function formatReviewForChat(review, tip) {
  if (!review) {
    return {
      answer:
        `**Today's price review** is not generated yet.\n\n` +
        `Staff: run \`npm run build:finance-daily-review\` (after the media daily brief when editions change).\n\n` +
        `Meanwhile open **Finance wire** for the live ticker + news tablets.\n\n_${tip || ''}_`,
      blocks: []
    };
  }

  const date = review.meta?.briefDate || 'today';
  const bulletLines = (review.bullets || [])
    .map((b) => `- ${b.text}`)
    .join('\n');
  const storyLines = (review.stories || [])
    .slice(0, 2)
    .map((s) => `- **${s.title}** — ${s.financeAngle || s.summary || ''}${s.source ? ` _(${s.source})_` : ''}`)
    .join('\n');
  const externalLines = (review.externalHeadlines || [])
    .slice(0, 3)
    .map((s) => `- **${s.title}** — ${s.financeAngle || s.summary || ''} _(${s.source || 'EU press'})_`)
    .join('\n');

  return {
    answer:
      `**Vincent · daily price review** (${date})\n\n` +
      `**${review.headline}**\n\n` +
      `${bulletLines}\n\n` +
      (externalLines ? `**Today's official headlines (finance lens)**\n${externalLines}\n\n` : '') +
      (storyLines ? `**Also in the monthly edition**\n${storyLines}\n\n` : '') +
      `_${review.meta?.disclaimer || 'Wholesale ≠ retail.'}_\n\n` +
      `Skim **Finance wire** for the board; ask for a payback case when you want the next step.\n\n_${tip || ''}_`,
    blocks: []
  };
}

async function buildDailyReviewAnswer(profile, tip) {
  let review = await loadFinanceDailyReview();
  if (!review) {
    review = await composeFinanceDailyReview({ profile, source: 'on-demand' });
  }
  const formatted = formatReviewForChat(review, tip);
  return {
    answer: formatted.answer,
    intentId: 'daily_price_review',
    blocks: [
      {
        type: 'links',
        items: [
          {
            label: 'Finance wire',
            href: '/greenways/finance-wire',
            note: "Ticker + today's review + news tablets"
          },
          {
            label: 'Prices board',
            href: '/greenways/finance-prices-board',
            note: 'Wholesale KPIs'
          },
          {
            label: 'Cheryce · news',
            href: PORTAL_LINKS.mediaAgent || '/greenways/media-agent',
            note: 'Full editions if you want depth'
          }
        ]
      }
    ],
    suggestions: [
      'Why should I upgrade when energy prices are changing?',
      'What BNPL options exist for commercial kitchen equipment?'
    ],
    dailyReview: {
      briefDate: review.meta?.briefDate,
      headline: review.headline,
      generatedAt: review.meta?.generatedAt
    }
  };
}

module.exports = {
  OUT_PATH,
  loadFinanceDailyReview,
  composeFinanceDailyReview,
  formatReviewForChat,
  buildDailyReviewAnswer
};
