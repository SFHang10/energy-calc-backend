const express = require('express');
const { getOverview, getGraph, addContentModule } = require('../services/agents-admin-service');

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
  res.json({ ok: true, service: 'agents-admin', phase: 2 });
});

router.post('/content-modules', async (req, res) => {
  try {
    const moduleRow = await addContentModule(req.body || {});
    res.status(201).json({ ok: true, module: moduleRow });
  } catch (error) {
    const message = error.message || 'Failed to add content module.';
    const status = /required|already exists|Assign at least/i.test(message) ? 400 : 500;
    console.error('Agents admin content-module error:', message);
    res.status(status).json({ ok: false, error: message });
  }
});

module.exports = router;
