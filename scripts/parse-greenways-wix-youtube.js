/**
 * Parse a saved export of greenwaysbuildings.com/greenways (markdown)
 * into data/wix-youtube-channels.json for Cheryce's media agent.
 *
 * Usage: node scripts/parse-greenways-wix-youtube.js [path-to-export.md]
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_INPUT = path.join(__dirname, '../uploads/greenways-0.md');
const OUTPUT_PATH = path.join(__dirname, '../data/wix-youtube-channels.json');

const CHANNELS = [
  { id: 'main', name: 'Main', category: 'general' },
  { id: 'low-energy-electrical', name: 'Low Energy Electrical Products', category: 'energy' },
  { id: 'sustainability-in-action', name: 'Sustainability in Action', category: 'general' },
  { id: 'restaurant-energy-savings', name: 'Restaurant Energy Savings', category: 'restaurant' },
  { id: 'smart-home-energy-savings', name: 'SMART Home Energy Savings', category: 'energy' },
  { id: 'home-energy-savings', name: 'Home Energy Savings', category: 'energy' },
  { id: 'resource-saving', name: 'Resource Saving', category: 'water' },
  { id: 'green-building-construction', name: 'Green Building Construction', category: 'building' },
  { id: 'refurbishment-ideas', name: 'Refurbishment Ideas for Your Premises', category: 'refurbishment' },
  { id: 'new-technology', name: 'New Technology', category: 'general' },
  { id: 'energy-monitoring', name: 'Energy Monitoring', category: 'monitoring' },
  { id: 'news-reviews', name: 'News - Reviews', category: 'news' },
  { id: 'eco-sustainable-materials', name: 'Eco / Sustainable Materials', category: 'general' },
  { id: 'etl', name: 'Electronic Technology List (ETL)', category: 'etl' }
];

const CHANNEL_ALIASES = {
  'home energy savings': 'home-energy-savings',
  'smart home energy savings': 'smart-home-energy-savings'
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractYoutubeId(text) {
  const match = String(text || '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : '';
}

function isDurationLine(line) {
  return /^\d{1,2}:\d{2}$/.test(line.trim());
}

function normalizeChannelLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed === 'All Categories' || trimmed.startsWith('#')) return null;
  const lower = trimmed.toLowerCase();
  if (CHANNEL_ALIASES[lower]) return CHANNEL_ALIASES[lower];
  const hit = CHANNELS.find((c) => c.name.toLowerCase() === lower || c.name.toLowerCase().startsWith(lower));
  if (hit) return hit.id;
  const partial = CHANNELS.find((c) => lower.includes(c.name.toLowerCase().slice(0, 12)));
  return partial ? partial.id : null;
}

function parseExport(markdown) {
  const lines = markdown.split(/\r?\n/);
  let channelId = null;
  let pendingTitle = null;
  let pendingDuration = '';
  let bodyLines = [];
  const videos = [];

  function flushVideo() {
    if (!pendingTitle || !channelId) return;
    const description = bodyLines.join(' ').replace(/\s+/g, ' ').trim().slice(0, 500);
    const videoId = extractYoutubeId(description);
    const id = `${channelId}-${slugify(pendingTitle).slice(0, 48) || videos.length}`;
    videos.push({
      id,
      title: pendingTitle,
      description,
      channelId,
      category: CHANNELS.find((c) => c.id === channelId)?.category || 'general',
      duration: pendingDuration,
      videoId,
      thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '',
      videoUrl: '',
      source: 'wix-youtube',
      pageHref: 'https://www.greenwaysbuildings.com/greenways'
    });
    pendingTitle = null;
    pendingDuration = '';
    bodyLines = [];
  }

  for (const raw of lines) {
    const line = raw.trim();
    const channelMatch = normalizeChannelLine(line);
    if (channelMatch && !line.startsWith('###')) {
      flushVideo();
      channelId = channelMatch;
      continue;
    }

    if (line.startsWith('### ')) {
      flushVideo();
      const title = line.replace(/^###\s+/, '').trim();
      if (title) pendingTitle = title;
      continue;
    }

    if (pendingTitle && isDurationLine(line)) {
      pendingDuration = line;
      continue;
    }

    if (pendingTitle && line && line !== 'Play Video' && !line.startsWith('http') && line.length > 20) {
      bodyLines.push(line);
    }
  }
  flushVideo();

  return videos.filter((v) => v.title.length > 3);
}

function main() {
  const inputPath = process.argv[2] || DEFAULT_INPUT;
  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(inputPath, 'utf8');
  const videos = parseExport(markdown);
  const withIds = videos.filter((v) => v.videoId).length;

  const payload = {
    updatedAt: new Date().toISOString().slice(0, 10),
    meta: {
      title: 'Greenways Wix Video — YouTube channel feeds',
      description:
        'Curated YouTube videos synced into Wix Video channels on /greenways. Refresh by re-exporting the page and running this script.',
      sourcePage: 'https://www.greenwaysbuildings.com/greenways',
      channelCount: CHANNELS.length
    },
    channels: CHANNELS,
    videos
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`✅ Wrote ${videos.length} videos (${withIds} with YouTube IDs) to ${OUTPUT_PATH}`);
}

main();
