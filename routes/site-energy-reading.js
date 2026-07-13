const express = require('express');
const {
  lookupSiteEnergyReading,
  enrichWithRecommendations,
  normalizeCountry,
  loadConfig
} = require('../services/site-energy-reading-service');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'site-energy-reading', version: '1' });
});

router.get('/config', (_req, res) => {
  res.json({ ok: true, config: loadConfig() });
});

router.get('/lookup', async (req, res) => {
  try {
    const country = normalizeCountry(req.query.country || req.query.region || 'uk');
    const region = country === 'uk' ? 'uk' : 'eu';
    const result = enrichWithRecommendations(
      await lookupSiteEnergyReading({
        region,
        country,
        postcode: req.query.postcode || req.query.postal || ''
      })
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message || 'Site energy lookup failed.'
    });
  }
});

module.exports = router;
