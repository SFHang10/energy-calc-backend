const express = require('express');
const { buildRestaurantSnapshot } = require('../services/restaurant-snapshot-service');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'restaurant-snapshot', version: 'pilot-1' });
});

router.get('/pilot', async (req, res) => {
  try {
    const snapshot = await buildRestaurantSnapshot({
      siteId: req.query.site || req.query.siteId || 'w2w-amsterdam-02',
      region: req.query.region || 'nl'
    });
    res.json({ ok: true, snapshot });
  } catch (error) {
    console.error('Restaurant snapshot error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to build restaurant energy snapshot.' });
  }
});

module.exports = router;
