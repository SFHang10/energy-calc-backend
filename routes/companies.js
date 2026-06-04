const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'companies.json');

async function readStore() {
  try {
    const raw = await fs.readFile(dataPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { items: parsed };
    }
    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { items: [] };
    }
    throw error;
  }
  return { items: [] };
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(store, null, 2));
}

function toText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function sanitizeStats(stats) {
  if (!stats || typeof stats !== 'object') return {};
  const cleaned = {};
  const fields = ['savings', 'energy', 'co2', 'payback'];
  fields.forEach((key) => {
    const value = toText(stats[key], 80);
    if (value) cleaned[key] = value;
  });
  return cleaned;
}

router.get('/', async (req, res) => {
  try {
    const store = await readStore();
    res.json({
      items: store.items || [],
      updatedAt: store.updatedAt || null
    });
  } catch (error) {
    console.error('Failed to read companies store:', error);
    res.status(500).json({ error: 'Failed to load companies' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = toText(req.body?.name, 120);
    const country = toText(req.body?.country, 80);
    const city = toText(req.body?.city, 120);
    const sector = toText(req.body?.sector, 40) || 'other';
    const desc = toText(req.body?.desc, 600);
    const color = toText(req.body?.color, 20);
    const lng = Number(req.body?.lng);
    const lat = Number(req.body?.lat);

    if (!name || !country) {
      return res.status(400).json({ error: 'name and country are required' });
    }

    const store = await readStore();
    const existing = store.items?.find(
      (item) =>
        item.name?.toLowerCase() === name.toLowerCase() &&
        item.country?.toLowerCase() === country.toLowerCase()
    );
    if (existing) {
      return res.json({ item: existing, existing: true });
    }

    const company = {
      id: Date.now(),
      name,
      country,
      city: city || country,
      lng: Number.isFinite(lng) ? lng : null,
      lat: Number.isFinite(lat) ? lat : null,
      sector,
      color: color || undefined,
      desc,
      stats: sanitizeStats(req.body?.stats)
    };

    const nextStore = {
      items: [...(store.items || []), company],
      updatedAt: new Date().toISOString()
    };
    await writeStore(nextStore);

    res.status(201).json({ item: company });
  } catch (error) {
    console.error('Failed to save company:', error);
    res.status(500).json({ error: 'Failed to save company' });
  }
});

module.exports = router;
