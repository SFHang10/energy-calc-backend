/**
 * Build data/media-daily-brief.json from the news catalogue (fast Cheryce chat reads).
 * Run after content-ops publishes a new monthly edition: npm run build:media-daily-brief
 */

const path = require('path');
const fs = require('fs/promises');
const { loadFullNewsCatalog, getLatestEdition, rankNewsItems } = require('../services/media-news-loader');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'media-daily-brief.json');
const STORY_LIMIT = 5;

function pickBriefStories(catalog) {
  const sust = getLatestEdition(catalog.editions, 'sustainability');
  const edition = sust?.edition || null;
  const editionPageHref = sust?.pageHref || null;

  const fromEdition = (ed) =>
    catalog.items.filter((item) => {
      if (item.id?.startsWith('edition-summary-')) return false;
      return (
        item.edition === ed &&
        item.editionType === 'sustainability' &&
        item.catalogSource === 'content-ops-html'
      );
    });

  let pool = edition ? fromEdition(edition) : [];
  if (pool.length < STORY_LIMIT) {
    const extra = catalog.items.filter((item) => {
      if (item.id?.startsWith('edition-summary-')) return false;
      return item.catalogSource === 'content-ops-html' && item.editionType === 'sustainability';
    });
    const seen = new Set(pool.map((i) => i.id));
    for (const item of extra) {
      if (seen.has(item.id)) continue;
      pool.push(item);
      seen.add(item.id);
    }
  }

  const ranked = rankNewsItems(
    pool,
    'policy funding circular energy restaurant netherlands uk',
    STORY_LIMIT * 2
  );
  const primary = edition ? fromEdition(edition).slice(0, STORY_LIMIT) : [];
  const stories = [];
  const seen = new Set();

  for (const item of [...primary, ...ranked]) {
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    stories.push({
      id: item.id,
      title: item.title,
      summary: String(item.summary || '').slice(0, 220),
      whyItMatters: (item.impact || []).slice(0, 2).join(' · '),
      newsCategory: item.newsCategory || 'monthly',
      edition: item.edition || edition,
      editionType: item.editionType || 'sustainability',
      href:
        item.pageHref ||
        item.moreLink ||
        (item.sources && item.sources[0]) ||
        editionPageHref ||
        null,
      sources: (item.sources || []).slice(0, 2)
    });
    if (stories.length >= STORY_LIMIT) break;
  }

  return { edition, editionPageHref, stories, sust };
}

async function main() {
  const catalog = await loadFullNewsCatalog();
  const { edition, editionPageHref, stories, sust } = pickBriefStories(catalog);
  const now = new Date();

  const payload = {
    meta: {
      version: 1,
      generatedAt: now.toISOString(),
      briefDate: now.toISOString().slice(0, 10),
      edition,
      editionType: 'sustainability',
      editionTitle: sust?.title || (edition ? `Sustainability News — ${edition}` : null),
      editionPageHref,
      storyCount: stories.length,
      catalogItems: catalog.stats?.total || catalog.items.length,
      sources: [
        'content-ops/review/sustainability-news',
        'content-ops/drafts/sustainability-news',
        'data/news-category-knowledge.json'
      ]
    },
    stories
  };

  await fs.writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(
    `Wrote ${OUT} — ${stories.length} stories (edition ${edition || 'n/a'}, ${payload.meta.briefDate})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
