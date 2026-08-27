const express = require('express');
const { buildEquipmentWireSnapshot } = require('../services/equipment-wire-snapshot');

const router = express.Router();

router.get('/snapshot', async (req, res) => {
  try {
    const snapshot = await buildEquipmentWireSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error('equipment-wire snapshot error:', error);
    res.status(500).json({ ok: false, error: 'Could not build equipment wire snapshot' });
  }
});

module.exports = router;
