/**
 * Public Wix video fetch for Media Agent (and future catalog sync).
 * Priority: live Wix API → MP4 catalog → YouTube channel catalog → playable hardcoded samples.
 */

const fs = require('fs');
const path = require('path');

const WIX_SITE_ID = process.env.WIX_SITE_ID || 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413';
const CATALOG_PATH = path.join(__dirname, '../data/wix-video-catalog.json');
const YOUTUBE_CHANNELS_PATH = path.join(__dirname, '../data/wix-youtube-channels.json');

let videoCache = { data: null, timestamp: null, ttl: 30 * 60 * 1000 };
let fileCatalogCache = null;
let youtubeChannelCache = null;

async function getWixAuthToken() {
  const WIX_APP_TOKEN = process.env.WIX_APP_TOKEN;
  const WIX_APP_ID = process.env.WIX_APP_ID;
  const WIX_APP_SECRET = process.env.WIX_APP_SECRET;
  const WIX_INSTANCE_ID = process.env.WIX_INSTANCE_ID;

  if (WIX_APP_TOKEN) {
    return WIX_APP_TOKEN.startsWith('Bearer ') ? WIX_APP_TOKEN : `Bearer ${WIX_APP_TOKEN}`;
  }

  if (WIX_APP_ID && WIX_APP_SECRET && WIX_INSTANCE_ID) {
    const tokenResponse = await fetch('https://www.wixapis.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: WIX_APP_ID,
        client_secret: WIX_APP_SECRET,
        instance_id: WIX_INSTANCE_ID
      })
    });
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      return `Bearer ${tokenData.access_token}`;
    }
  }

  return null;
}

/** topic = channel/story/tips; product = marketplace equipment walkthrough MP4 */
function resolveVideoKind(video) {
  const explicit = String(video?.videoKind || '').trim().toLowerCase();
  if (explicit === 'topic' || explicit === 'product') return explicit;
  if (video?.productId || video?.source === 'catalog') return 'product';
  if (video?.channelId || video?.source === 'wix-youtube') return 'topic';
  const labels = (video?.tags || []).map((t) => String(t).toLowerCase());
  if (labels.some((l) => l === 'product-demo' || l === 'product_demo' || l === 'product')) {
    return 'product';
  }
  if (labels.some((l) => l === 'topic-video' || l === 'topic_video' || l === 'topic')) {
    return 'topic';
  }
  return 'topic';
}

function withVideoKind(video) {
  if (!video || typeof video !== 'object') return video;
  return { ...video, videoKind: resolveVideoKind(video) };
}

function extractCategoryFromLabels(labels, filename) {
  const filenameLower = (filename || '').toLowerCase();
  const labelsLower = (labels || []).map((l) => (typeof l === 'string' ? l.toLowerCase() : ''));
  const allText = [...labelsLower, filenameLower].join(' ');

  const categoryMap = [
    ['restaurant', 'restaurant'],
    ['kitchen', 'restaurant'],
    ['water', 'water'],
    ['solar', 'solar'],
    ['hvac', 'hvac'],
    ['led', 'lighting'],
    ['light', 'lighting'],
    ['monitor', 'monitoring'],
    ['etl', 'etl'],
    ['news', 'news'],
    ['refurb', 'refurbishment'],
    ['build', 'building'],
    ['farm', 'rooftop'],
    ['energy', 'energy'],
    ['efficien', 'energy']
  ];

  for (const [token, cat] of categoryMap) {
    if (allText.includes(token)) return cat;
  }
  return 'general';
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function pickBestVideoUrl(file) {
  const video = file.media?.video;
  const resolutions = video?.resolutions || [];
  if (resolutions.length) {
    const sorted = [...resolutions].sort(
      (a, b) => (b.height || b.width || 0) - (a.height || a.width || 0)
    );
    return sorted[0]?.url || '';
  }
  return file.url || '';
}

function mapWixFileToVideo(file, index) {
  const video = file.media?.video;
  const labels = file.labels || [];
  return withVideoKind({
    id: file.id || `wix-${index}`,
    title: file.displayName || 'Untitled Video',
    description: `Greenways video — ${file.displayName || ''}`,
    thumbnail: file.thumbnailUrl || '',
    videoUrl: pickBestVideoUrl(file),
    category: extractCategoryFromLabels(labels, file.displayName),
    tags: labels,
    source: 'wix',
    duration: video?.duration ? formatDuration(video.duration) : '',
    wixFileId: file.id
  });
}

function loadVideoCatalogFromFile() {
  if (fileCatalogCache) return fileCatalogCache;
  try {
    if (!fs.existsSync(CATALOG_PATH)) return null;
    const raw = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
    const videos = (raw.videos || []).filter((v) => v.videoUrl);
    if (!videos.length) return null;
    fileCatalogCache = videos.map((v) =>
      withVideoKind({ ...v, source: v.source || 'catalog', videoKind: v.videoKind || 'product' })
    );
    return fileCatalogCache;
  } catch (error) {
    console.error('Media Agent: wix-video-catalog.json load failed:', error.message);
    return null;
  }
}

function loadYoutubeChannelVideos() {
  if (youtubeChannelCache) return youtubeChannelCache;
  try {
    if (!fs.existsSync(YOUTUBE_CHANNELS_PATH)) return { channels: [], videos: [] };
    const raw = JSON.parse(fs.readFileSync(YOUTUBE_CHANNELS_PATH, 'utf8'));
    const channels = raw.channels || [];
    const channelById = Object.fromEntries(channels.map((c) => [c.id, c]));
    const videos = (raw.videos || []).map((v) => {
      const channel = channelById[v.channelId];
      return withVideoKind({
        ...v,
        source: v.source || 'wix-youtube',
        category: v.category || channel?.category || 'general',
        channelName: channel?.name || v.channelId || '',
        videoKind: v.videoKind || 'topic',
        tags: [...(v.tags || []), channel?.name].filter(Boolean)
      });
    });
    youtubeChannelCache = { channels, videos, meta: raw.meta || {} };
    return youtubeChannelCache;
  } catch (error) {
    console.error('Media Agent: wix-youtube-channels.json load failed:', error.message);
    return { channels: [], videos: [] };
  }
}

function mergeVideoLibraries(primary, youtubeVideos) {
  const seen = new Set();
  const out = [];
  for (const v of [...primary, ...youtubeVideos]) {
    const key = v.videoUrl || v.videoId || v.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(withVideoKind(v));
  }
  return out;
}

function getFallbackVideos() {
  const catalog = loadVideoCatalogFromFile();
  if (catalog && catalog.length) return catalog;

  return [
    {
      id: 'fallback-energy-intro',
      title: 'Introduction to Energy Efficiency',
      description: 'Energy efficiency basics for homes and businesses.',
      thumbnail: 'https://static.wixstatic.com/media/c123de_3e2c2ae921094adb867970a6ec792f35~mv2.png',
      videoUrl:
        'https://video.wixstatic.com/video/c123de_5d118a1c7b3d4734a773229aee187b0f/720p/mp4/file.mp4',
      category: 'energy',
      tags: ['energy saving', 'basics'],
      source: 'fallback'
    },
    {
      id: 'fallback-restaurant',
      title: 'Restaurant Energy Savings',
      description: 'Commercial kitchen efficiency — combi oven demo.',
      thumbnail: 'https://static.wixstatic.com/media/c123de_988c141478e044d5ba8d137d2a451713~mv2.png',
      videoUrl:
        'https://video.wixstatic.com/video/c123de_cad29e69eaa948e19f64ebb6ad29245a/720p/mp4/file.mp4',
      category: 'restaurant',
      tags: ['restaurant', 'kitchen'],
      source: 'fallback'
    },
    {
      id: 'fallback-water',
      title: 'Water Saving Technologies',
      description: 'Hand dryer and washroom efficiency product demo.',
      thumbnail: 'https://static.wixstatic.com/media/c123de_82c7779bdacd41fd8b9e26891e32baa2~mv2.jpg',
      videoUrl:
        'https://video.wixstatic.com/video/c123de_1a15a4e8081e40188e5c7b33fcbb6b0f/720p/mp4/file.mp4',
      category: 'water',
      tags: ['water saving'],
      source: 'fallback'
    }
  ];
}

async function searchWixVideos(authToken, body) {
  const response = await fetch('https://www.wixapis.com/site-media/v1/files/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken,
      'wix-site-id': WIX_SITE_ID
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Wix API error: ${response.status} ${response.statusText}${detail ? ` — ${detail.slice(0, 120)}` : ''}`);
  }

  const data = await response.json();
  return (data.files || []).map(mapWixFileToVideo);
}

async function fetchVideosFromWix() {
  const authToken = await getWixAuthToken();
  if (!authToken) {
    console.log(
      '⚠️  Media Agent: Wix credentials not configured — using catalog/fallback videos (normal on local dev)'
    );
    return null;
  }

  const searchBodies = [
    {
      mediaTypes: ['VIDEO'],
      rootFolder: 'MEDIA_ROOT',
      paging: { limit: 200 }
    },
    {
      mediaTypes: ['VIDEO'],
      rootFolder: 'MEDIA_ROOT',
      siteId: WIX_SITE_ID,
      paging: { limit: 200 }
    }
  ];

  for (const body of searchBodies) {
    try {
      const videos = await searchWixVideos(authToken, body);
      const playable = videos.filter((v) => v.videoUrl);
      if (playable.length) {
        console.log(`✅ Media Agent: loaded ${playable.length} Wix videos (site ${WIX_SITE_ID})`);
        return playable;
      }
      if (videos.length) {
        console.log(`⚠️  Media Agent: Wix returned ${videos.length} videos but none had playable URLs`);
      }
    } catch (error) {
      console.error('❌ Media Agent: Wix video fetch attempt failed:', error.message);
    }
  }

  return null;
}

async function getVideosForAgent() {
  const now = Date.now();
  if (videoCache.data && videoCache.timestamp && now - videoCache.timestamp < videoCache.ttl) {
    return videoCache.data;
  }

  const wixVideos = await fetchVideosFromWix();
  let videos;
  let source;

  const youtubeBundle = loadYoutubeChannelVideos();
  const youtubeVideos = youtubeBundle.videos || [];

  if (wixVideos && wixVideos.length) {
    videos = mergeVideoLibraries(wixVideos, youtubeVideos);
    source = 'wix';
  } else {
    const catalogVideos = loadVideoCatalogFromFile();
    if (catalogVideos && catalogVideos.length) {
      videos = mergeVideoLibraries(catalogVideos, youtubeVideos);
      source = youtubeVideos.length ? 'catalog+youtube' : 'catalog';
      console.log(
        `📹 Media Agent: ${catalogVideos.length} MP4 catalog + ${youtubeVideos.length} Wix YouTube channel videos`
      );
    } else {
      videos = youtubeVideos.length ? youtubeVideos : getFallbackVideos();
      source = youtubeVideos.length ? 'wix-youtube' : 'fallback';
    }
  }

  const payload = {
    videos,
    source,
    channels: youtubeBundle.channels || [],
    youtubeCount: youtubeVideos.length
  };
  videoCache = { ...videoCache, data: payload, timestamp: now };
  return payload;
}

function clearVideoCache() {
  videoCache = { data: null, timestamp: null, ttl: videoCache.ttl };
  fileCatalogCache = null;
  youtubeChannelCache = null;
}

module.exports = {
  getVideosForAgent,
  getFallbackVideos,
  loadVideoCatalogFromFile,
  loadYoutubeChannelVideos,
  fetchVideosFromWix,
  clearVideoCache,
  extractCategoryFromLabels,
  resolveVideoKind,
  withVideoKind,
  CATALOG_PATH,
  YOUTUBE_CHANNELS_PATH
};
