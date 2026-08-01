/**
 * GET /api/scheme-fit?region=nl&lane=fridge
 */
const express = require('express');
const { getSchemeFitPayload } = require('../services/scheme-fit');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const region = String(req.query.region || 'nl').trim().toLowerCase();
    const laneId = String(req.query.lane || req.query.focus || 'fridge').trim().toLowerCase();
    const limit = Math.min(12, Math.max(3, Number(req.query.limit) || 8));
    const payload = await getSchemeFitPayload({ region, laneId, limit });
    if (!payload) {
      return res.status(404).json({ ok: false, error: 'No scheme fit for that region or lane.' });
    }
    res.json(payload);
  } catch (error) {
    console.error('scheme-fit error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to build scheme fit shortlist.' });
  }
});

module.exports = router;
