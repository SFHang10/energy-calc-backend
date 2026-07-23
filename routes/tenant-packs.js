const express = require('express');
const { listPacks, getPack } = require('../services/tenant-agent-pack-service');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'tenant-packs' });
});

router.get('/', async (req, res) => {
  try {
    const data = await listPacks();
    res.json(data);
  } catch (error) {
    console.error('Tenant packs list error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to list tenant agent packs.' });
  }
});

router.get('/:chainId', async (req, res) => {
  try {
    const data = await getPack(req.params.chainId);
    res.json(data);
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) {
      console.error('Tenant pack load error:', error.message);
    }
    res.status(status).json({
      ok: false,
      error: error.message || 'Failed to load tenant pack.'
    });
  }
});

module.exports = router;
