/**
 * GET /api/service-hour-cost-board?profile=busy-kitchen|small-cafe|wok-line
 */
const express = require('express');
const { getServiceHourPayload } = require('../services/service-hour-cost-board');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const profile = String(req.query.profile || req.query.id || 'busy-kitchen').trim();
    const payload = await getServiceHourPayload({ profileId: profile });
    if (!payload) {
      return res.status(404).json({ ok: false, error: 'No service-hour profiles found' });
    }
    res.json(payload);
  } catch (error) {
    console.error('service-hour-cost-board error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to load service-hour cost board' });
  }
});

module.exports = router;
