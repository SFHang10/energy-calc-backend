/**
 * Public Wix video fetch for Media Agent (and future catalog sync).
 * Local dev: logs credential warning and returns fallback samples — same as /api/members/videos.
 */

const WIX_SITE_ID = process.env.WIX_SITE_ID || 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413';

let videoCache = { data: null, timestamp: null, ttl: 30 * 60 * 1000 };

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

function getFallbackVideos() {
  return [
    {
      id: 'fallback-energy-intro',
      title: 'Introduction to Energy Efficiency',
      description: 'Energy efficiency basics for homes and businesses.',
      thumbnail: 'https://static.wixstatic.com/media/c123de_3e2c2ae921094adb867970a6ec792f35~mv2.png',
      videoUrl: '',
      category: 'energy',
      tags: ['energy saving', 'basics'],
      source: 'fallback'
    },
    {
      id: 'fallback-restaurant',
      title: 'Restaurant Energy Savings',
      description: 'Commercial kitchen efficiency tips.',
      thumbnail: 'https://static.wixstatic.com/media/c123de_988c141478e044d5ba8d137d2a451713~mv2.png',
      videoUrl: '',
      category: 'restaurant',
      tags: ['restaurant', 'kitchen'],
      source: 'fallback'
    },
    {
      id: 'fallback-water',
      title: 'Water Saving Technologies',
      description: 'Water conservation for hospitality and home.',
      thumbnail: 'https://static.wixstatic.com/media/c123de_82c7779bdacd41fd8b9e26891e32baa2~mv2.jpg',
      videoUrl: '',
      category: 'water',
      tags: ['water saving'],
      source: 'fallback'
    }
  ];
}

async function fetchVideosFromWix() {
  const authToken = await getWixAuthToken();
  if (!authToken) {
    console.log('⚠️  Media Agent: Wix credentials not configured — using fallback video showcase (normal on local dev)');
    return null;
  }

  try {
    const response = await fetch('https://www.wixapis.com/site-media/v1/files/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: JSON.stringify({
        mediaTypes: ['VIDEO'],
        rootFolder: 'MEDIA_ROOT',
        siteId: WIX_SITE_ID,
        paging: { limit: 200 }
      })
    });

    if (!response.ok) {
      throw new Error(`Wix API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return (data.files || []).map((file, index) => {
      const video = file.media?.video;
      const resolutions = video?.resolutions || [];
      const bestResolution = resolutions[0] || {};
      const labels = file.labels || [];
      return {
        id: file.id || `wix-${index}`,
        title: file.displayName || 'Untitled Video',
        description: `Greenways video — ${file.displayName || ''}`,
        thumbnail: file.thumbnailUrl || '',
        videoUrl: bestResolution.url || file.url || '',
        category: extractCategoryFromLabels(labels, file.displayName),
        tags: labels,
        source: 'wix',
        duration: video?.duration ? formatDuration(video.duration) : ''
      };
    });
  } catch (error) {
    console.error('❌ Media Agent: Wix video fetch failed:', error.message);
    return null;
  }
}

async function getVideosForAgent() {
  const now = Date.now();
  if (videoCache.data && videoCache.timestamp && now - videoCache.timestamp < videoCache.ttl) {
    return videoCache.data;
  }

  const wixVideos = await fetchVideosFromWix();
  const videos =
    wixVideos && wixVideos.length
      ? wixVideos
      : getFallbackVideos();

  videoCache = { ...videoCache, data: videos, timestamp: now };
  return { videos, source: videos[0]?.source || 'fallback' };
}

module.exports = {
  getVideosForAgent,
  getFallbackVideos,
  extractCategoryFromLabels
};
