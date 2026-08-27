/**
 * Rebuild data/finance-news-feed.json from latest newsletter + news catalogue.
 * Run after media brief: npm run build:finance-news-feed
 */

const fs = require('fs/promises');
const path = require('path');
const { loadEditionPack } = require('../services/newsletter-looking-ahead');
const { loadFullNewsCatalog, getLatestEdition } = require('../services/media-news-loader');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'finance-news-feed.json');
const STATIC = path.join(ROOT, 'data', 'finance-news-feed.static.json');

const FINANCE_KEYWORDS =
  /price|wholesale|tariff|fund|grant|loan|bnpl|cbam|omnibus|energy|finance|payback|invest|subsidy|scheme|bill|cost|eprel|label/i;

function monthLabel(edition) {
  if (!edition) return 'Latest';
  const [y, m] = edition.split('-');
  const names = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  const idx = parseInt(m, 10) - 1;
  return `${names[idx] || m} ${y}`;
}

function editionDisplayLabel(edition) {
  const now = new Date();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  const currentLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  if (!edition) return currentLabel;
  const [y, m] = edition.split('-').map((v) => parseInt(v, 10));
  if (y === now.getFullYear() && m === now.getMonth() + 1) return monthLabel(edition);
  if (y === now.getFullYear() && m === now.getMonth()) return currentLabel;
  return monthLabel(edition);
}

function stripMarkdown(text) {
  return String(text || '').replace(/\*\*/g, '').trim();
}

function urgencyDateLabel(when, headline) {
  const hay = `${when || ''} ${headline || ''}`;
  if (/31\s*august\s*2026/i.test(hay)) {
    const now = new Date();
    const deadline = new Date('2026-08-31T23:59:59');
    const days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (days > 0 && days <= 14) return `THIS WEEK · ${days}d left`;
    if (days <= 0) return 'DEADLINE PASSED';
  }
  return when || 'AHEAD';
}

async function loadDailyReview() {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'finance-daily-review.json'), 'utf8'));
  } catch (_) {
    return null;
  }
}

async function loadSchemeFundingPicks(limit = 3) {
  try {
    const raw = JSON.parse(await fs.readFile(path.join(ROOT, 'schemes.json'), 'utf8'));
    const schemes = Array.isArray(raw) ? raw : raw.schemes || [];
    return schemes
      .filter((s) => s.status !== 'inactive')
      .filter((s) => {
        const hay = `${s.title} ${s.description} ${(s.keywords || []).join(' ')}`.toLowerCase();
        return (
          (s.region === 'nl' || (s.regions || []).includes('Netherlands')) &&
          /restaurant|equipment|kitchen|hospitality|mia|vamil|bmkb|horizon|wbso/i.test(hay)
        );
      })
      .slice(0, limit)
      .map((s) => ({
        date: 'NL',
        headline: s.title,
        tag: String(s.type || 'GRANT').toUpperCase(),
        detail: String(s.description || s.relevance || '').slice(0, 160),
        href: '/greenways/finance-finder',
        cta: 'Open finder'
      }));
  } catch (_) {
    return [];
  }
}

function buildRoundupParagraphs(edition, dailyReview, editionPack, prior) {
  if (prior?.roundup?.paragraphs?.length) return prior.roundup.paragraphs;
  const lead = dailyReview?.headline
    ? `Today's wholesale skim: ${stripMarkdown(dailyReview.headline)}. Vincent refreshes the daily brief from hub prices and the Greenways news catalogue — last built ${dailyReview.meta?.briefDate || 'recently'}.`
    : 'Vincent refreshes this round-up from wholesale hub data and the Greenways sustainability newsletter pipeline.';
  const editionNote = editionPack?.summary
    ? stripMarkdown(String(editionPack.summary).slice(0, 280))
    : `This edition tracks ${monthLabel(edition)} policy and funding signals for hospitality — CBAM's 31 August declaration, Omnibus XII labelling, and NL scheme windows.`;
  return [lead, editionNote];
}

function buildEditionSummary(editionPack, dailyReview, edition) {
  if (editionPack?.summary) {
    return stripMarkdown(String(editionPack.summary).slice(0, 320));
  }
  const priceBit = dailyReview?.headline ? stripMarkdown(dailyReview.headline) + ' · ' : '';
  return (
    priceBit +
    `${editionDisplayLabel(edition)} finance digest — CBAM final declaration week, EU energy labelling simplification, and NL funding paths for equipment upgrades.`
  );
}

function pickFinanceStories(catalog, edition, limit = 6) {
  const pool = catalog.items.filter((item) => {
    if (item.id?.startsWith('edition-summary-')) return false;
    if (item.catalogSource !== 'content-ops-html') return false;
    if (item.editionType !== 'sustainability') return false;
    if (edition && item.edition !== edition) return false;
    const hay = `${item.title} ${item.summary}`;
    return FINANCE_KEYWORDS.test(hay);
  });
  return pool.slice(0, limit);
}

function lookingAheadToPick(item, pageHref) {
  const tag = /cbam|declaration/i.test(item.headline)
    ? 'COMPLIANCE'
    : /fund|grant|eib|loan/i.test(item.headline)
      ? 'FUNDING'
      : /price|wholesale|energy|omnibus|eprel/i.test(item.headline)
        ? 'POLICY'
        : 'AHEAD';
  return {
    date: urgencyDateLabel(item.when, item.headline),
    headline: item.headline.slice(0, 120),
    tag,
    detail: String(item.detail || item.summary || "From this edition's Looking Ahead — verify dates before acting.").slice(
      0,
      160
    ),
    href: pageHref,
    cta: 'Details'
  };
}

function storyToItem(story, idx) {
  const tab = /fund|grant|eib|loan|subsidy/i.test(`${story.title} ${story.summary}`)
    ? 'funding'
    : /price|wholesale|tariff|bill/i.test(`${story.title} ${story.summary}`)
      ? 'prices'
      : 'policy';
  return {
    id: `item-auto-${story.id || idx}`,
    tab,
    date: story.edition ? story.edition.replace('-', ' ').toUpperCase() : 'NEWS',
    title: story.title,
    tag: tab.toUpperCase(),
    summary: String(story.summary || '').slice(0, 220),
    href: story.pageHref || null
  };
}

async function loadStaticFallback() {
  try {
    return JSON.parse(await fs.readFile(STATIC, 'utf8'));
  } catch (_) {
    try {
      return JSON.parse(await fs.readFile(OUT, 'utf8'));
    } catch (_2) {
      return null;
    }
  }
}

const VINCENT_FINANCE_HERO_IMAGES = [
  {
    src: 'https://static.wixstatic.com/media/c123de_6fc35ea9558a4d89ae9f1f1f18241328~mv2.webp',
    alt: 'Finance markets — Vincent wire backdrop'
  },
  {
    src: 'https://static.wixstatic.com/media/c123de_a7746ac7981d466095fdc261bb208fa8~mv2.jpg',
    alt: 'Energy markets — Vincent prices board backdrop'
  },
  {
    src: 'https://static.wixstatic.com/media/c123de_538ebcd0cb8744009c22d5676cb8a5da~mv2.jpg',
    alt: 'Finance atmosphere panel'
  }
];

async function main() {
  const [editionPack, catalog, prior, dailyReview, schemeFunding] = await Promise.all([
    loadEditionPack('sustainability'),
    loadFullNewsCatalog(),
    loadStaticFallback(),
    loadDailyReview(),
    loadSchemeFundingPicks(3)
  ]);

  const edition = editionPack?.edition || getLatestEdition(catalog.editions, 'sustainability')?.edition;
  const pageHref = editionPack?.pageHref || null;
  const stories = pickFinanceStories(catalog, edition, 8);
  const lookingAhead = (editionPack?.lookingAhead || []).slice(0, 4);
  const today = new Date().toISOString().slice(0, 10);

  const heroImages = prior?.meta?.heroImages || VINCENT_FINANCE_HERO_IMAGES;

  const policyPicks = [
    ...lookingAhead
      .filter((i) => /policy|omnibus|cbam|circular|energy|eprel|compliance/i.test(i.headline))
      .slice(0, 3)
      .map((i) => lookingAheadToPick(i, pageHref)),
    ...stories
      .filter((s) => /policy|cbam|omnibus|circular|energy/i.test(`${s.title} ${s.summary}`))
      .slice(0, 2)
      .map((s) => ({
        date: /31\s*august/i.test(`${s.title} ${s.summary}`)
          ? urgencyDateLabel('31 August 2026', s.title)
          : edition
            ? edition.replace('-', ' ').toUpperCase()
            : 'NEWS',
        headline: s.title,
        tag: 'POLICY',
        detail: String(s.summary || '').slice(0, 160),
        href: s.pageHref || pageHref,
        cta: 'Details'
      }))
  ].slice(0, 5);

  const fundingFromStories = stories
    .filter((s) => /fund|grant|eib|loan|subsidy|programme/i.test(`${s.title} ${s.summary}`))
    .slice(0, 2)
    .map((s) => ({
      date: edition ? edition.replace('-', ' ').toUpperCase() : 'NEWS',
      headline: s.title,
      tag: 'FUNDING',
      detail: String(s.summary || '').slice(0, 160),
      href: s.pageHref || pageHref,
      cta: 'Details'
    }));

  const fundingPicks = [
    ...schemeFunding,
    ...fundingFromStories,
    {
      date: 'PORTAL',
      headline: 'Restaurant finance finder',
      tag: 'TOOLS',
      detail: 'Grants · BNPL · equipment · loans · Europe tabs.',
      href: '/greenways/finance-finder',
      cta: 'Open finder'
    }
  ].slice(0, 5);

  const instrumentsSection =
    prior?.instrumentsSection ||
    prior?.roundup?.sections?.find((s) => s.id === 'instruments') || {
      id: 'instruments',
      title: 'Instruments & next steps',
      icon: '🧭',
      tone: 'instruments',
      picks: []
    };

  const dailyPick = dailyReview
    ? {
        date: 'TODAY',
        headline: stripMarkdown(dailyReview.headline) || 'Vincent daily price review',
        tag: 'BRIEF',
        detail: stripMarkdown(dailyReview.bullets?.[0]?.text || 'Wholesale skim from Finance wire hubs.'),
        href: '/greenways/finance-wire-main',
        cta: 'Open wire main'
      }
    : {
        date: 'DAILY',
        headline: 'Vincent daily price review',
        tag: 'BRIEF',
        detail: 'Run npm run build:finance-daily-review after ticker updates.',
        href: '/greenways/finance-wire-main',
        cta: 'Open wire main'
      };

  const payload = {
    meta: {
      edition: editionDisplayLabel(edition),
      sourceEdition: edition,
      region: prior?.meta?.region || 'EU · NL hospitality lens',
      publishedAt: today,
      updatedAt: today,
      briefDate: dailyReview?.meta?.briefDate || today,
      tagline: prior?.meta?.tagline || 'Prices · policy · funding · instruments',
      summary: buildEditionSummary(editionPack, dailyReview, edition),
      heroImages,
      dailyReview: dailyReview
        ? {
            headline: dailyReview.headline,
            briefDate: dailyReview.meta?.briefDate,
            href: '/greenways/finance-wire-main'
          }
        : null,
      generatedFrom: {
        edition,
        pageHref,
        script: 'scripts/build-finance-news-feed.js'
      }
    },
    roundup: {
      title: `${monthLabel(edition)} — finance & energy signals for hospitality`,
      paragraphs: buildRoundupParagraphs(edition, dailyReview, editionPack, prior),
      sections: [
        {
          id: 'prices',
          title: 'Prices & wholesale guide',
          icon: '📡',
          tone: 'prices',
          picks: [
            dailyPick,
            {
              date: 'LIVE',
              headline: 'Finance wire — wholesale lanes',
              tag: 'WIRE',
              detail: 'Hub KPIs and market tablets — refresh for the latest skim.',
              href: '/greenways/finance-wire',
              cta: 'Open wire'
            },
            {
              date: 'GUIDE',
              headline: 'NL wholesale guide',
              tag: 'WHOLESALE',
              detail: 'Wholesale ≠ restaurant bill — pair with prices board before supplier changes.',
              href: '/greenways/finance-prices-board',
              cta: 'Open prices board'
            }
          ]
        },
        {
          id: 'policy',
          title: 'Policy & compliance',
          icon: '📋',
          tone: 'policy',
          picks: policyPicks.length
            ? policyPicks
            : [
                {
                  date: 'AHEAD',
                  headline: 'Policy picks rebuild with newsletter',
                  tag: 'POLICY',
                  detail: 'Run npm run build:finance-news-feed after the monthly HTML is in review.',
                  href: pageHref || '/greenways/finance-news',
                  cta: 'Details'
                }
              ]
        },
        {
          id: 'funding',
          title: 'Funding & programmes',
          icon: '💶',
          tone: 'funding',
          picks: fundingPicks
        },
        instrumentsSection
      ]
    },
    tabs: prior?.tabs || [
      { id: 'all', label: 'All signals', desc: 'Every card in this edition.' },
      { id: 'prices', label: 'Prices', desc: 'Daily brief and wholesale guide links.' },
      { id: 'policy', label: 'Policy', desc: 'EU / compliance headlines with a finance lens.' },
      { id: 'funding', label: 'Funding', desc: 'Programmes and finder tools.' },
      { id: 'instruments', label: 'Instruments', desc: 'What to do next on Greenways.' }
    ],
    items: [
      ...(dailyReview
        ? [
            {
              id: 'item-daily-review',
              tab: 'prices',
              date: 'TODAY',
              title: stripMarkdown(dailyReview.headline),
              tag: 'DAILY',
              summary: stripMarkdown(
                (dailyReview.bullets || [])
                  .slice(0, 2)
                  .map((b) => b.text)
                  .join(' ')
              ).slice(0, 220),
              href: '/greenways/finance-wire-main'
            }
          ]
        : []),
      ...stories.slice(0, 6).map(storyToItem),
      {
        id: 'item-wire',
        tab: 'prices',
        date: 'LIVE',
        title: 'Finance wire — ticker + tablets',
        tag: 'WIRE',
        summary: 'Wholesale lanes and finance spotlights on the main wire panel.',
        href: '/greenways/finance-wire-main'
      },
      {
        id: 'item-finder',
        tab: 'funding',
        date: 'TOOL',
        title: 'Finance finder (restaurant)',
        tag: 'PORTAL',
        summary: 'Browse grants, BNPL, equipment finance, loans, and Europe tabs.',
        href: '/greenways/finance-finder'
      }
    ]
  };

  await fs.writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(
    `Wrote ${OUT} — edition ${edition || 'n/a'}, ${payload.items.length} items, ${policyPicks.length} policy picks`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
