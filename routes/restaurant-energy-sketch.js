/**
 * GET /api/restaurant-energy-sketch?profile=busy-kitchen|small-cafe|wok-line
 */
const express = require('express');
const { getSketchPayload } = require('../services/restaurant-energy-sketch');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const profileId = String(req.query.profile || req.query.id || 'busy-kitchen').trim();
    const payload = await getSketchPayload({ profileId });
    if (!payload) {
      return res.status(404).json({ ok: false, error: 'No energy sketch for that profile.' });
    }
    res.json(payload);
  } catch (error) {
    console.error('restaurant-energy-sketch error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load restaurant energy sketch.' });
  }
});

module.exports = router;
