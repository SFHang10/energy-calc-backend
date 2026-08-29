const express = require('express');
const { buildFinanceWireSnapshot } = require('../services/finance-wire-snapshot');

const router = express.Router();

router.get('/snapshot', async (req, res) => {
  try {
    const snapshot = await buildFinanceWireSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error('finance-wire snapshot error:', error);
    res.status(500).json({ ok: false, error: 'Could not build finance wire snapshot' });
  }
});

module.exports = router;
