/**
 * GET /api/water-line-sketch?profile=busy-kitchen|small-cafe|high-volume-bar
 */
const express = require('express');
const { getWaterSketchPayload } = require('../services/water-line-sketch');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const profileId = String(req.query.profile || req.query.id || 'busy-kitchen').trim();
    const payload = await getWaterSketchPayload({ profileId });
    if (!payload) {
      return res.status(404).json({ ok: false, error: 'No water line sketch for that profile.' });
    }
    res.json(payload);
  } catch (error) {
    console.error('water-line-sketch error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load water line sketch.' });
  }
});

module.exports = router;
