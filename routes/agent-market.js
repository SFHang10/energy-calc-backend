const express = require('express');
const {
  getLaneSamples,
  getLaneAlternatives,
  getAllLaneMeta,
  LANE_IDS
} = require('../services/agent-market-service');

const router = express.Router();

router.get('/lanes', async (_req, res) => {
  try {
    const lanes = await getAllLaneMeta();
    res.json({ ok: true, lanes });
  } catch (error) {
    console.error('Agent Market lanes error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load lanes.' });
  }
});

router.get('/samples', async (req, res) => {
  try {
    const lane = String(req.query.lane || 'kitchen').trim().toLowerCase();
    const limit = Math.min(8, Math.max(1, Number(req.query.limit) || 6));
    if (!LANE_IDS.includes(lane)) {
      return res.status(400).json({
        ok: false,
        error: 'lane must be one of: ' + LANE_IDS.join(', ')
      });
    }
    const payload = await getLaneSamples(lane, limit);
    res.json(payload);
  } catch (error) {
    console.error('Agent Market samples error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load Agent Market samples.' });
  }
});

router.get('/alternatives', async (req, res) => {
  try {
    const lane = String(req.query.lane || 'kitchen').trim().toLowerCase();
    if (!LANE_IDS.includes(lane)) {
      return res.status(400).json({
        ok: false,
        error: 'lane must be one of: ' + LANE_IDS.join(', ')
      });
    }
    const payload = await getLaneAlternatives(lane);
    if (!payload.ok) {
      return res.status(payload.error === 'No compare query configured for lane' ? 404 : 502).json(payload);
    }
    res.json(payload);
  } catch (error) {
    console.error('Agent Market alternatives error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load Agent Market alternatives.' });
  }
});

module.exports = router;
