const express = require('express');
const router = express.Router();

router.get('/products', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Energy Efficient Fridge',
      power: 150,
      category: 'Appliances',
      brand: 'EcoBrand',
      runningCostPerYear: 45.50
    },
    {
      id: '2', 
      name: 'LED TV 55"',
      power: 80,
      category: 'Electronics',
      brand: 'GreenTech',
      runningCostPerYear: 24.30
    }
  ]);
});

router.post('/calculate-single', (req, res) => {
  const { productId, hoursPerDay, electricityRate } = req.body;
  
  const daily = (80 / 1000) * hoursPerDay * electricityRate;
  const monthly = daily * 30;
  const yearly = daily * 365;
  
  res.json({
    productId,
    daily,
    monthly,
    yearly,
    hoursPerDay,
    electricityRate
  });
});

module.exports = router;
