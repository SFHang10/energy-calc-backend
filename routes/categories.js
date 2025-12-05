const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const dbPath = path.join(__dirname, '..', 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// GET /categories - distinct categories with counts
router.get('/', (req, res) => {
  const sql = `SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// GET /categories/:category/subcategories - distinct subcategories in a category with counts
router.get('/:category/subcategories', (req, res) => {
  const { category } = req.params;
  const sql = `SELECT subcategory, COUNT(*) as count FROM products WHERE category = ? GROUP BY subcategory ORDER BY subcategory`;
  db.all(sql, [category], (err, rows) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

module.exports = router;





