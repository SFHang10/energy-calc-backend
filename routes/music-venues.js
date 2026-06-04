const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'music-venues.json');

const MAP_CENTER = { lng: 4.9041, lat: 52.3676 };

const GENRE_COLORS = {
  jazz: '#c45e0a',
  'open-mic': '#e9c46a',
  'open-jam': '#2a9d8f',
  'gypsy-swing': '#f4845f',
  mixed: '#6c91c2',
  'live-music': '#8ecae6',
  other: '#aaa',
};

const VALID_GENRES = Object.keys(GENRE_COLORS);

async function readStore() {
  try {
    const raw = await fs.readFile(dataPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { items: parsed, meta: {} };
    }
    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { items: [], meta: {} };
    }
    throw error;
  }
  return { items: [], meta: {} };
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  const payload = {
    updatedAt: new Date().toISOString(),
    meta: store.meta || {
      title: 'Live Music Finder For Artists',
      defaultCity: 'Amsterdam',
      defaultCountry: 'Netherlands',
      mapCenter: MAP_CENTER,
    },
    items: store.items || [],
  };
  await fs.writeFile(dataPath, JSON.stringify(payload, null, 2));
  return payload;
}

function toText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function toStringArray(value, maxItems = 8, maxLen = 80) {
  if (Array.isArray(value)) {
    return value
      .map((v) => toText(String(v), maxLen))
      .filter(Boolean)
      .slice(0, maxItems);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => toText(v, maxLen))
      .filter(Boolean)
      .slice(0, maxItems);
  }
  return [];
}

function normalizeYoutubeVideos(value) {
  const items = Array.isArray(value) ? value : [];
  return items
    .map((item) => {
      if (typeof item === 'string') {
        return { id: toText(item, 40), title: '' };
      }
      return {
        id: toText(item?.id || '', 40),
        title: toText(item?.title || '', 120)
      };
    })
    .filter((item) => item.id)
    .slice(0, 3);
}

/** Curated photos + YouTube clips for lazy lightbox (max 8). */
function normalizeMediaGallery(value) {
  const items = Array.isArray(value) ? value : [];
  const out = [];
  const seen = new Set();
  for (const raw of items) {
    if (!raw || out.length >= 8) break;
    const type = toText(raw.type, 20).toLowerCase();
    if (type === 'image') {
      const url = toText(raw.url, 500);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push({ type: 'image', url, caption: toText(raw.caption, 160) });
      continue;
    }
    if (type === 'youtube' || type === 'video') {
      const id = toText(raw.id || raw.youtubeId, 40);
      if (!id || seen.has(`yt:${id}`)) continue;
      seen.add(`yt:${id}`);
      out.push({
        type: 'youtube',
        id,
        title: toText(raw.title || raw.caption, 120)
      });
    }
  }
  return out;
}

function normalizeGenre(value) {
  const slug = toText(value, 40).toLowerCase();
  if (VALID_GENRES.includes(slug)) return slug;
  if (slug.includes('gypsy') || slug.includes('swing')) return 'gypsy-swing';
  if (slug.includes('open jam')) return 'open-jam';
  if (slug.includes('open mic')) return 'open-mic';
  if (slug.includes('jazz')) return 'jazz';
  if (slug.includes('mixed')) return 'mixed';
  if (slug.includes('live')) return 'live-music';
  return 'other';
}

function pickCoords(body, index) {
  const lng = Number(body?.lng);
  const lat = Number(body?.lat);
  if (Number.isFinite(lng) && Number.isFinite(lat)) {
    return { lng, lat };
  }
  const jitter = (index % 7) * 0.008 - 0.024;
  return {
    lng: MAP_CENTER.lng + jitter,
    lat: MAP_CENTER.lat + (index % 5) * 0.006 - 0.012,
  };
}

function buildVenue(body, id, index) {
  const genre = normalizeGenre(body.genre || body.format);
  const coords = pickCoords(body, index);
  const verificationStatus = toText(body.verificationStatus, 40).toLowerCase() || 'unverified';
  const lastVerified = toText(body.lastVerified, 80);
  const source = toText(body.source, 200) || 'manual';
  const vibeTags = toStringArray(body.vibeTags, 10, 40);
  const mapsUrl = toText(body.mapsUrl, 500);
  const youtubeVideos = normalizeYoutubeVideos(body.youtubeVideos);
  const mediaGallery = normalizeMediaGallery(body.mediaGallery);
  return {
    id,
    name: toText(body.name, 120),
    genre,
    format: toText(body.format, 200),
    schedule: toText(body.schedule, 200),
    address: toText(body.address, 200) || 'Amsterdam',
    city: toText(body.city, 80) || 'Amsterdam',
    country: toText(body.country, 80) || 'Netherlands',
    lng: coords.lng,
    lat: coords.lat,
    desc: toText(body.desc, 800),
    imageUrl: toText(body.imageUrl, 500),
    url: toText(body.url, 500),
    contactEmail: toText(body.contactEmail, 200),
    vibeTags,
    mapsUrl,
    youtubeVideos,
    mediaGallery,
    source,
    verificationStatus,
    lastVerified,
    sourceNote: toText(body.sourceNote, 200),
    sessionTime: toText(body.sessionTime, 120),
    recurrence: toText(body.recurrence, 200),
    nextSession: toText(body.nextSession, 160),
    signUpNotes: toText(body.signUpNotes, 300),
    entryCost: toText(body.entryCost, 120),
    skillLevel: toText(body.skillLevel, 160),
    jamDetails: toText(body.jamDetails, 600),
    phone: toText(body.phone, 40),
    instagramUrl: toText(body.instagramUrl, 500),
    agendaUrl: toText(body.agendaUrl, 500),
    color: GENRE_COLORS[genre],
  };
}

function nextId(items) {
  const max = (items || []).reduce((m, it) => Math.max(m, Number(it.id) || 0), 0);
  return max + 1;
}

router.get('/', async (req, res) => {
  try {
    const store = await readStore();
    const genre = req.query.genre;
    const verificationStatus = toText(req.query.verificationStatus || '', 40).toLowerCase();
    let items = store.items || [];
    if (genre && genre !== 'all') {
      items = items.filter((v) => v.genre === normalizeGenre(genre));
    }
    if (verificationStatus && verificationStatus !== 'all') {
      items = items.filter((v) => (v.verificationStatus || 'unverified') === verificationStatus);
    }
    res.json({
      items,
      meta: store.meta || null,
      updatedAt: store.updatedAt || null,
      count: items.length,
    });
  } catch (error) {
    console.error('Failed to read music venues store:', error);
    res.status(500).json({ error: 'Failed to load music venues' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid venue id' });
    }
    const store = await readStore();
    const item = (store.items || []).find((v) => Number(v.id) === id);
    if (!item) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json({ item });
  } catch (error) {
    console.error('Failed to read music venue:', error);
    res.status(500).json({ error: 'Failed to load music venue' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = toText(req.body?.name, 120);
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const store = await readStore();
    const items = store.items || [];
    const existing = items.find((v) => v.name?.toLowerCase() === name.toLowerCase());
    if (existing) {
      return res.json({ item: existing, existing: true });
    }

    const venue = buildVenue(req.body, nextId(items), items.length);
    venue.name = name;

    const nextStore = {
      ...store,
      items: [...items, venue],
    };
    const saved = await writeStore(nextStore);

    res.status(201).json({ item: venue, updatedAt: saved.updatedAt });
  } catch (error) {
    console.error('Failed to save music venue:', error);
    res.status(500).json({ error: 'Failed to save music venue' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid venue id' });
    }

    const store = await readStore();
    const items = store.items || [];
    const index = items.findIndex((v) => Number(v.id) === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const current = items[index];
    const merged = {
      ...current,
      ...req.body,
      id: current.id,
      name: toText(req.body?.name, 120) || current.name,
    };
    if (req.body?.genre != null || req.body?.format != null) {
      merged.genre = normalizeGenre(req.body.genre || req.body.format || current.genre);
      merged.color = GENRE_COLORS[merged.genre];
    }
    if (req.body?.lng != null || req.body?.lat != null) {
      const coords = pickCoords(merged, index);
      merged.lng = coords.lng;
      merged.lat = coords.lat;
    }

    const fields = [
      'format', 'schedule', 'address', 'city', 'country', 'desc', 'imageUrl', 'url', 'contactEmail', 'mapsUrl',
      'source', 'verificationStatus', 'lastVerified', 'sourceNote',
      'sessionTime', 'recurrence', 'nextSession', 'signUpNotes', 'entryCost', 'skillLevel', 'jamDetails',
      'phone', 'instagramUrl', 'agendaUrl'
    ];
    const fieldLimits = {
      desc: 800,
      jamDetails: 600,
      signUpNotes: 300,
      imageUrl: 500,
      url: 500,
      mapsUrl: 500,
      instagramUrl: 500,
      agendaUrl: 500,
    };
    fields.forEach((key) => {
      if (req.body?.[key] != null) {
        merged[key] = toText(req.body[key], fieldLimits[key] || 200);
      }
    });
    if (req.body?.verificationStatus != null) {
      merged.verificationStatus = toText(req.body.verificationStatus, 40).toLowerCase() || current.verificationStatus || 'unverified';
    }
    if (req.body?.vibeTags != null) {
      merged.vibeTags = toStringArray(req.body.vibeTags, 10, 40);
    }
    if (req.body?.youtubeVideos != null) {
      merged.youtubeVideos = normalizeYoutubeVideos(req.body.youtubeVideos);
    }
    if (req.body?.mediaGallery != null) {
      merged.mediaGallery = normalizeMediaGallery(req.body.mediaGallery);
    }

    items[index] = merged;
    const saved = await writeStore({ ...store, items });

    res.json({ item: merged, updatedAt: saved.updatedAt });
  } catch (error) {
    console.error('Failed to update music venue:', error);
    res.status(500).json({ error: 'Failed to update music venue' });
  }
});

module.exports = router;
