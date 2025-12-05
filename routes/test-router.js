const express = require('express');
const router = express.Router();

router.get('/categories', (req, res) => {
  res.json(['Appliances', 'Electronics', 'Renewable', 'Smart Home']);
});

router.get('/energy-efficient', (req, res) => {
  res.json([{id: '1', name: 'Energy Efficient Fridge'}]);
});

router.get('/brands', (req, res) => {
  res.json(['EcoBrand', 'GreenTech', 'SunPower', 'EcoControl']);
});

module.exports = router;
