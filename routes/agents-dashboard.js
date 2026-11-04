const express = require('express');
const { buildAgentsDashboardOverview } = require('../services/agents-dashboard-service');

const router = express.Router();

router.get('/overview', async (_req, res) => {
  try {
    const payload = await buildAgentsDashboardOverview();
    res.json(payload);
  } catch (error) {
    console.error('[agents-dashboard] overview error:', error.message || error);
    res.status(500).json({ ok: false, error: 'Could not build agents dashboard overview' });
  }
});

module.exports = router;
