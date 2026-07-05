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
const TECH_STORY_LIMIT = 3;

function fromEditionItems(catalog, edition, editionType) {
  return catalog.items.filter((item) => {
    if (item.id?.startsWith('edition-summary-')) return false;
    return (
      item.edition === edition &&
      item.editionType === editionType &&
      item.catalogSource === 'content-ops-html'
    );
  });
}

function pickBriefStories(catalog) {
  const sust = getLatestEdition(catalog.editions, 'sustainability');
  const edition = sust?.edition || null;
  const editionPageHref = sust?.pageHref || null;

  let pool = edition ? fromEditionItems(catalog, edition, 'sustainability') : [];
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
  const primary = edition ? fromEditionItems(catalog, edition, 'sustainability').slice(0, STORY_LIMIT) : [];
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

function pickTechStories(catalog) {
  const tech = getLatestEdition(catalog.editions, 'tech');
  const edition = tech?.edition || null;
  const editionPageHref = tech?.pageHref || null;
  const pool = edition ? fromEditionItems(catalog, edition, 'tech') : [];
  const stories = pool.slice(0, TECH_STORY_LIMIT).map((item) => ({
    id: item.id,
    title: item.title,
    summary: String(item.summary || '').slice(0, 220),
    edition: item.edition || edition,
    editionType: 'tech',
    href: item.pageHref || editionPageHref || null
  }));
  return { tech, edition, editionPageHref, stories };
}

async function main() {
  const catalog = await loadFullNewsCatalog();
  const { edition, editionPageHref, stories, sust } = pickBriefStories(catalog);
  const techPack = pickTechStories(catalog);
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
      tech: techPack.tech
        ? {
            edition: techPack.edition,
            title: techPack.tech.title || `New in Tech — ${techPack.edition}`,
            pageHref: techPack.editionPageHref,
            storyCount: techPack.stories.length
          }
        : null,
      sources: [
        'content-ops/review/sustainability-news',
        'content-ops/review/new-in-tech',
        'content-ops/drafts/sustainability-news',
        'data/news-category-knowledge.json'
      ]
    },
    stories,
    techStories: techPack.stories
  };

  await fs.writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(
    `Wrote ${OUT} — ${stories.length} sustainability stories (edition ${edition || 'n/a'}), ${techPack.stories.length} tech stories (edition ${techPack.edition || 'n/a'}, ${payload.meta.briefDate})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
