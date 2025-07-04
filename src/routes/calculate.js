const express = require('express');
const router = express.Router();

// POST /calculate
// Body: { power (W), hoursPerDay, rate (cost per kWh) }
router.post('/', (req, res) => {
  const { power, hoursPerDay, rate } = req.body;
  if (typeof power !== 'number' || typeof hoursPerDay !== 'number' || typeof rate !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid input fields' });
  }
  // kWh per day
  const kWhPerDay = (power / 1000) * hoursPerDay;
  const daily = kWhPerDay * rate;
  const monthly = daily * 30;
  const yearly = daily * 365;
  res.json({ daily, monthly, yearly });
});

module.exports = router; 