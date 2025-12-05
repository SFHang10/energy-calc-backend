const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the main energy calculator database
const dbPath = path.join(__dirname, 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    power REAL NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT,
    running_cost_per_year REAL,
    energy_rating TEXT,
    efficiency TEXT,
    source TEXT,
    model_number TEXT
  )`);

  // Indexes for fast filtering
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_source ON products(source)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);

  console.log('✅ Products schema ensured in energy_calculator.db');
});

db.close();







