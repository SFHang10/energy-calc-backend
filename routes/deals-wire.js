const express = require('express');
const { buildDealsWireSnapshot } = require('../services/deals-wire-snapshot');

const router = express.Router();

router.get('/snapshot', async (req, res) => {
  try {
    const snapshot = await buildDealsWireSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error('deals-wire snapshot error:', error);
    res.status(500).json({ ok: false, error: 'Could not build deals wire snapshot' });
  }
});

module.exports = router;
