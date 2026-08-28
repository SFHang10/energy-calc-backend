const express = require('express');
const { buildProductsWireSnapshot } = require('../services/products-wire-snapshot');

const router = express.Router();

router.get('/snapshot', async (req, res) => {
  try {
    const snapshot = await buildProductsWireSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error('products-wire snapshot error:', error);
    res.status(500).json({ ok: false, error: 'Could not build products wire snapshot' });
  }
});

module.exports = router;
