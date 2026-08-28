const express = require('express');
const { buildMediaWireSnapshot } = require('../services/media-wire-snapshot');

const router = express.Router();

router.get('/snapshot', async (req, res) => {
  try {
    const snapshot = await buildMediaWireSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error('media-wire snapshot error:', error);
    res.status(500).json({ ok: false, error: 'Could not build media wire snapshot' });
  }
});

module.exports = router;
