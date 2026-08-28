const express = require('express');
const { buildGrantsWireSnapshot } = require('../services/grants-wire-snapshot');

const router = express.Router();

router.get('/snapshot', async (req, res) => {
  try {
    const snapshot = await buildGrantsWireSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error('grants-wire snapshot error:', error);
    res.status(500).json({ ok: false, error: 'Could not build grants wire snapshot' });
  }
});

module.exports = router;
