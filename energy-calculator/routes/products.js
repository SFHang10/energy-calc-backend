const express = require('express');
const router = express.Router();

// GET /products
router.get('/', (req, res) => {
  res.json([
    { id: 1, name: 'Sample Product 1', power: 100 },
    { id: 2, name: 'Sample Product 2', power: 150 }
  ]);
});

module.exports = router; 