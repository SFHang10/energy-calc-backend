/**
 * Refresh data/wix-video-catalog.json from Wix Media API (when creds exist)
 * or from FULL-DATABASE-5554.json product video URLs as a offline snapshot.
 *
 * Usage: npm run build:wix-video-catalog
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  fetchVideosFromWix,
  CATALOG_PATH,
  extractCategoryFromLabels
} = require('../services/wix-media-service');

const DB_PATH = path.join(__dirname, '../FULL-DATABASE-5554.json');

function videosFromDatabase(limit = 24) {
  if (!fs.existsSync(DB_PATH)) return [];
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const seen = new Set();
  const out = [];

  for (const product of db.products || []) {
    if (!Array.isArray(product.videos) || !product.videos.length) continue;
    const url = product.videos.find((u) => typeof u === 'string' && u.includes('video.wixstatic'));
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const hay = [product.name, product.category, product.subcategory].join(' ').toLowerCase();
    let category = 'general';
    if (/kitchen|restaurant|combi|oven|dishwasher|refrigerat|hospitality/.test(hay)) category = 'restaurant';
    else if (/water|hand dryer|dryer/.test(hay)) category = 'water';
    else if (/solar|pv/.test(hay)) category = 'solar';
    else if (/hvac|heat pump|ventilat|baxi/.test(hay)) category = 'hvac';
    else if (/led|light/.test(hay)) category = 'lighting';
    else if (/energy|efficien/.test(hay)) category = 'energy';

    out.push({
      id: `catalog-${product.id || out.length}`,
      title: String(product.name || 'Greenways equipment video').slice(0, 100),
      description: `Product demo — ${[product.category, product.subcategory].filter(Boolean).join(' · ')}`,
      thumbnail: (product.images && product.images[0]) || '',
      videoUrl: url,
      category,
      tags: [product.category, product.subcategory].filter(Boolean),
      source: 'catalog',
      duration: '',
      productId: product.id
    });

    if (out.length >= limit) break;
  }

  return out;
}

async function main() {
  let videos = await fetchVideosFromWix();
  let sourceNote = 'Wix Media API';

  if (!videos || !videos.length) {
    videos = videosFromDatabase();
    sourceNote = 'FULL-DATABASE-5554.json product media';
  }

  if (!videos.length) {
    console.error('No videos found — set WIX_APP_TOKEN or ensure FULL-DATABASE has product videos.');
    process.exit(1);
  }

  const payload = {
    updatedAt: new Date().toISOString().slice(0, 10),
    meta: {
      title: 'Greenways playable video catalog',
      description: `Generated from ${sourceNote}.`,
      generatedAt: new Date().toISOString(),
      source: sourceNote
    },
    videos: videos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      thumbnail: v.thumbnail,
      videoUrl: v.videoUrl,
      category: v.category || extractCategoryFromLabels(v.tags, v.title),
      tags: v.tags || [],
      source: 'catalog',
      duration: v.duration || '',
      wixFileId: v.wixFileId,
      productId: v.productId
    }))
  };

  fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`✅ Wrote ${payload.videos.length} videos to ${CATALOG_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
