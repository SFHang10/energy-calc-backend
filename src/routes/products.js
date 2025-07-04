const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { fetchEnergyStarProducts } = require('../services/energystar');

// GET /products?q=search
router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q;
    let filter = {};
    if (q) {
      filter = { name: { $regex: q, $options: 'i' } };
    }
    const products = await Product.find(filter).limit(50);
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// POST /products/import-energystar
router.post('/import-energystar', async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }
  try {
    const products = await fetchEnergyStarProducts();
    let imported = 0;
    let updated = 0;
    for (const prod of products) {
      const result = await Product.findOneAndUpdate(
        { name: prod.name, manufacturer: prod.manufacturer, modelNo: prod.modelNo },
        prod,
        { upsert: true, new: true }
      );
      if (result.wasNew) {
        imported++;
      } else {
        updated++;
      }
    }
    res.json({ imported, updated, total: products.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router; 