const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking database...');
console.log('Database path:', dbPath);

db.all('SELECT id, name, brand, category FROM products LIMIT 10', (err, rows) => {
  if (err) {
    console.log('❌ Database error:', err.message);
  } else {
    console.log(`✅ Found ${rows.length} sample products:`);
    rows.forEach(row => {
      console.log(`- ID: ${row.id}`);
      console.log(`  Name: ${row.name}`);
      console.log(`  Brand: ${row.brand || 'N/A'}`);
      console.log(`  Category: ${row.category || 'N/A'}`);
      console.log('');
    });
  }
  db.close();
});


