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
    date: item.when || 'AHEAD',
    headline: item.headline.slice(0, 120),
    tag,
    detail: 'From this edition\'s Looking Ahead — verify dates before acting.',
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
  const [editionPack, catalog, prior] = await Promise.all([
    loadEditionPack('sustainability'),
    loadFullNewsCatalog(),
    loadStaticFallback()
  ]);

  const edition = editionPack?.edition || getLatestEdition(catalog.editions, 'sustainability')?.edition;
  const pageHref = editionPack?.pageHref || null;
  const stories = pickFinanceStories(catalog, edition, 8);
  const lookingAhead = (editionPack?.lookingAhead || []).slice(0, 4);

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
        date: edition ? edition.replace('-', ' ').toUpperCase() : 'NEWS',
        headline: s.title,
        tag: 'POLICY',
        detail: String(s.summary || '').slice(0, 160),
        href: s.pageHref || pageHref,
        cta: 'Details'
      }))
  ].slice(0, 4);

  const fundingPicks = stories
    .filter((s) => /fund|grant|eib|loan|subsidy|programme/i.test(`${s.title} ${s.summary}`))
    .slice(0, 3)
    .map((s) => ({
      date: edition ? edition.replace('-', ' ').toUpperCase() : 'NEWS',
      headline: s.title,
      tag: 'FUNDING',
      detail: String(s.summary || '').slice(0, 160),
      href: s.pageHref || pageHref,
      cta: 'Details'
    }));

  const staticSections = prior?.roundup?.sections || [];
  const instrumentsSection =
    staticSections.find((s) => s.id === 'instruments') ||
    {
      id: 'instruments',
      title: 'Instruments & next steps',
      icon: '🧭',
      tone: 'instruments',
      picks: []
    };

  const payload = {
    meta: {
      edition: monthLabel(edition),
      region: prior?.meta?.region || 'EU · NL hospitality lens',
      publishedAt: new Date().toISOString().slice(0, 10),
      tagline: prior?.meta?.tagline || 'Prices · policy · funding · instruments',
      summary:
        editionPack?.summary ||
        prior?.meta?.summary ||
        'Finance-framed round-up seeded from the latest sustainability newsletter.',
      heroImages,
      generatedFrom: {
        edition,
        pageHref,
        script: 'scripts/build-finance-news-feed.js'
      }
    },
    roundup: {
      title: `${monthLabel(edition)} — finance & energy signals for hospitality`,
      paragraphs: prior?.roundup?.paragraphs || [
        'Headlines below are pulled from the shared Greenways news catalogue and framed for payback, grants, and loans.',
        'Wholesale hubs on Finance wire remain the live price skim.'
      ],
      sections: [
        {
          id: 'prices',
          title: 'Prices & wholesale guide',
          icon: '📡',
          tone: 'prices',
          picks: [
            {
              date: 'DAILY',
              headline: 'Vincent daily price review',
              tag: 'BRIEF',
              detail: 'Thin auto skim (ticker + news lens). Rebuilt on newsletter publish.',
              href: '/greenways/finance-wire-main',
              cta: 'Open wire main'
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
                  headline: 'Add policy picks from Looking Ahead',
                  tag: 'POLICY',
                  detail: 'Run npm run run:newsletter after the monthly HTML is in review.',
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
          picks: fundingPicks.length
            ? fundingPicks
            : [
                {
                  date: 'PORTAL',
                  headline: 'Restaurant finance finder',
                  tag: 'TOOLS',
                  detail: 'Grants · BNPL · equipment · loans · Europe tabs.',
                  href: '/greenways/finance-finder',
                  cta: 'Open finder'
                }
              ]
        },
        instrumentsSection
      ]
    },
    tabs: prior?.tabs || [
      { id: 'all', label: 'All signals', desc: 'Every card in this edition.' },
      { id: 'prices', label: 'Prices', desc: 'Wholesale guide and daily brief links.' },
      { id: 'policy', label: 'Policy', desc: 'EU / compliance headlines with a finance lens.' },
      { id: 'funding', label: 'Funding', desc: 'Programmes and finder tools.' },
      { id: 'instruments', label: 'Instruments', desc: 'What to do next on Greenways.' }
    ],
    items: [
      ...stories.slice(0, 5).map(storyToItem),
      {
        id: 'item-wire',
        tab: 'prices',
        date: 'LIVE',
        title: 'Finance wire — ticker + tablets',
        tag: 'WIRE',
        summary: 'Wholesale lanes and news spotlights on the main wire panel.',
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
