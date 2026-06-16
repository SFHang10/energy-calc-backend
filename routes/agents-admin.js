const express = require('express');
const { getOverview, getGraph } = require('../services/agents-admin-service');

const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    const overview = await getOverview();
    res.json(overview);
  } catch (error) {
    console.error('Agents admin overview error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to build agents admin overview.' });
  }
});

router.get('/graph', async (req, res) => {
  try {
    const graph = await getGraph();
    res.json(graph);
  } catch (error) {
    console.error('Agents admin graph error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to build agents network graph.' });
  }
});

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'agents-admin', phase: 1 });
});

module.exports = router;
