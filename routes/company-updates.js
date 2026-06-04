const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'company-updates.json');

router.get('/', async (req, res) => {
  try {
    const raw = await fs.readFile(dataPath, 'utf8');
    res.json(JSON.parse(raw));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json({ updatedAt: null, byId: {} });
    }
    console.error('Failed to read company-updates store:', error);
    res.status(500).json({ error: 'Failed to load company updates' });
  }
});

module.exports = router;
