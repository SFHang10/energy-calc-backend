const express = require('express');
const router = express.Router();

// POST /calculate
router.post('/', (req, res) => {
  const { power, hours, rate } = req.body;
  const daily = (power / 1000) * hours * rate;
  const monthly = daily * 30;
  const yearly = daily * 365;
  
  res.json({ daily, monthly, yearly });
});

module.exports = router; 