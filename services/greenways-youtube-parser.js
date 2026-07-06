/**
 * Parse Greenways /greenways page exports into Wix YouTube channel video rows.
 * Used by scripts/parse-greenways-wix-youtube.js and media-videos-admin API.
 */

const GREENWAYS_CHANNELS = [
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
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractYoutubeId(text) {
  const raw = String(text || '').trim();
  const match = raw.match(
    /(?:youtube\.com\/(?:watch\?(?:[^&\s]*&)*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (match) return match[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  return '';
}

function youtubeThumb(videoId) {
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
}

function isDurationLine(line) {
  return /^\d{1,2}:\d{2}$/.test(String(line || '').trim());
}

function normalizeChannelLine(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed || trimmed === 'All Categories' || trimmed.startsWith('#')) return null;
  const lower = trimmed.toLowerCase();
  if (CHANNEL_ALIASES[lower]) return CHANNEL_ALIASES[lower];
  const hit = GREENWAYS_CHANNELS.find(
    (c) => c.name.toLowerCase() === lower || c.name.toLowerCase().startsWith(lower)
  );
  if (hit) return hit.id;
  const partial = GREENWAYS_CHANNELS.find((c) => lower.includes(c.name.toLowerCase().slice(0, 12)));
  return partial ? partial.id : null;
}

function channelById(channelId) {
  return GREENWAYS_CHANNELS.find((c) => c.id === channelId) || null;
}

function parseGreenwaysExport(markdown) {
  const lines = String(markdown || '').split(/\r?\n/);
  let channelId = null;
  let pendingTitle = null;
  let pendingDuration = '';
  let bodyLines = [];
  const videos = [];

  function flushVideo() {
    if (!pendingTitle || !channelId) return;
    const description = bodyLines.join(' ').replace(/\s+/g, ' ').trim().slice(0, 500);
    const videoId = extractYoutubeId(description);
    const channel = channelById(channelId);
    const id = `yt-${channelId}-${slugify(pendingTitle).slice(0, 48) || videos.length}`;
    videos.push({
      id,
      title: pendingTitle,
      description,
      channelId,
      category: channel?.category || 'general',
      duration: pendingDuration,
      videoId,
      thumbnail: youtubeThumb(videoId),
      videoUrl: '',
      videoKind: 'topic',
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

function videoMatchKey(video) {
  return `${video.channelId}::${String(video.title || '').trim().toLowerCase()}`;
}

/**
 * Merge parsed export rows into existing catalog without dropping manual videoId edits.
 */
function mergeParsedVideos(existingVideos, parsedVideos) {
  const existing = Array.isArray(existingVideos) ? [...existingVideos] : [];
  const parsed = Array.isArray(parsedVideos) ? parsedVideos : [];
  const byKey = new Map();
  const byId = new Map();

  for (const v of existing) {
    byKey.set(videoMatchKey(v), v);
    if (v.id) byId.set(v.id, v);
  }

  let added = 0;
  let updated = 0;

  for (const row of parsed) {
    const key = videoMatchKey(row);
    let target = byKey.get(key);
    if (!target && row.id && byId.has(row.id)) {
      target = byId.get(row.id);
    }

    if (target) {
      let changed = false;
      if (row.videoId && !target.videoId) {
        target.videoId = row.videoId;
        target.thumbnail = youtubeThumb(row.videoId);
        changed = true;
      }
      if (row.duration && !target.duration) {
        target.duration = row.duration;
        changed = true;
      }
      if (row.description && (!target.description || target.description.length < row.description.length)) {
        target.description = row.description;
        changed = true;
      }
      if (changed) updated += 1;
      continue;
    }

    existing.push(row);
    byKey.set(key, row);
    if (row.id) byId.set(row.id, row);
    added += 1;
  }

  return { videos: existing, added, updated };
}

function buildCatalogPayload(videos, metaOverrides = {}) {
  return {
    updatedAt: new Date().toISOString().slice(0, 10),
    meta: {
      title: 'Greenways Wix Video — YouTube channel feeds',
      description:
        'Curated YouTube videos synced into Wix Video channels on /greenways. Maintain via media-videos-admin or npm run parse:greenways-youtube.',
      sourcePage: 'https://www.greenwaysbuildings.com/greenways',
      channelCount: GREENWAYS_CHANNELS.length,
      ...metaOverrides
    },
    channels: GREENWAYS_CHANNELS,
    videos: Array.isArray(videos) ? videos : []
  };
}

function catalogStats(videos) {
  const list = Array.isArray(videos) ? videos : [];
  const playable = list.filter((v) => v.videoUrl || v.videoId);
  const missing = list.filter((v) => !v.videoUrl && !v.videoId);
  const byChannel = {};
  for (const ch of GREENWAYS_CHANNELS) {
    const rows = list.filter((v) => v.channelId === ch.id);
    byChannel[ch.id] = {
      id: ch.id,
      name: ch.name,
      total: rows.length,
      playable: rows.filter((v) => v.videoUrl || v.videoId).length,
      missing: rows.filter((v) => !v.videoUrl && !v.videoId).length
    };
  }
  return {
    total: list.length,
    playable: playable.length,
    missing: missing.length,
    byChannel
  };
}

module.exports = {
  GREENWAYS_CHANNELS,
  slugify,
  extractYoutubeId,
  youtubeThumb,
  parseGreenwaysExport,
  mergeParsedVideos,
  buildCatalogPayload,
  catalogStats,
  videoMatchKey
};
