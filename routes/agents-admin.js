const express = require('express');
const { getOverview, getGraph, addContentModule } = require('../services/agents-admin-service');
const { readRecentAskLogs, aggregateTopMisses } = require('../services/greenways-ask-logger');

const router = express.Router();

/** Demo staff gate — replace with real auth later. Override via AGENTS_ADMIN_PASSWORD. */
function requireAgentsAdminKey(req, res, next) {
  const expected = process.env.AGENTS_ADMIN_PASSWORD || 'Greenwaysadmin';
  const key =
    req.get('x-agents-admin-key') ||
    (req.body && (req.body.adminKey || req.body.password)) ||
    '';
  if (String(key) !== String(expected)) {
    return res.status(401).json({
      ok: false,
      error: 'Agents admin password required. Unlock the admin UI first, then try again.'
    });
  }
  return next();
}

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

router.get('/ask-logs', (req, res) => {
  const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 200));
  res.json(readRecentAskLogs(limit));
});

router.get('/ask-misses', (req, res) => {
  const days = Math.min(30, Math.max(1, Number(req.query.days) || 7));
  const limit = Math.min(25, Math.max(1, Number(req.query.limit) || 10));
  res.json(aggregateTopMisses({ days, limit }));
});

router.post('/content-modules', requireAgentsAdminKey, async (req, res) => {
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
