const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { connectMongoDB, isMongoDBConnected } = require('../database/mongodb');
const Company = require('../models/Company');

console.log('🚀 Companies MongoDB router loading...');

const router = express.Router();
const seedPath = path.join(__dirname, '..', 'data', 'companies.json');

connectMongoDB().then((connected) => {
  if (connected) {
    console.log('✅ Companies route connected to MongoDB');
  } else {
    console.log('⚠️ Companies route: MongoDB not connected');
  }
});

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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensureSeeded() {
  const count = await Company.countDocuments();
  if (count > 0) return;
  try {
    const raw = await fs.readFile(seedPath, 'utf8');
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : parsed?.items;
    if (Array.isArray(items) && items.length) {
      await Company.insertMany(
        items.map((item) => ({
          ...item,
          nameLower: item?.name ? String(item.name).toLowerCase() : undefined,
          countryLower: item?.country ? String(item.country).toLowerCase() : undefined
        }))
      );
      console.log(`✅ Seeded ${items.length} companies from data/companies.json`);
    }
  } catch (error) {
    console.warn('⚠️ Company seed skipped:', error.message);
  }
}

router.get('/', async (req, res) => {
  try {
    if (!isMongoDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    await ensureSeeded();
    const items = await Company.find().sort({ id: 1, createdAt: 1 }).lean();
    res.json({
      items,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to load companies:', error);
    res.status(500).json({ error: 'Failed to load companies' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!isMongoDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    await ensureSeeded();

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

    const existing = await Company.findOne({
      name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
      country: new RegExp(`^${escapeRegex(country)}$`, 'i')
    }).lean();

    if (existing) {
      return res.json({ item: existing, existing: true });
    }

    const company = await Company.create({
      id: Number.isFinite(Number(req.body?.id)) ? Number(req.body?.id) : Date.now(),
      name,
      country,
      city: city || country,
      lng: Number.isFinite(lng) ? lng : null,
      lat: Number.isFinite(lat) ? lat : null,
      sector,
      color: color || undefined,
      desc,
      stats: sanitizeStats(req.body?.stats),
      nameLower: name.toLowerCase(),
      countryLower: country.toLowerCase()
    });

    res.status(201).json({ item: company.toObject() });
  } catch (error) {
    console.error('Failed to save company:', error);
    res.status(500).json({ error: 'Failed to save company' });
  }
});

module.exports = router;
