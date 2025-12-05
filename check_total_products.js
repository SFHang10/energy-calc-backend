const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/energy_calculator.db');

console.log('🔍 Checking total product count in database...\n');

// Get total count
db.get('SELECT COUNT(*) as total FROM products', (err, row) => {
  if (err) {
    console.error('Error getting total count:', err);
  } else {
    console.log(`📊 Total products in database: ${row.total}`);
  }
});

// Get count by source
db.all('SELECT source, COUNT(*) as count FROM products GROUP BY source', (err, rows) => {
  if (err) {
    console.error('Error getting count by source:', err);
  } else {
    console.log('\n📈 Products by source:');
    rows.forEach(row => {
      console.log(`   ${row.source}: ${row.count}`);
    });
  }
});

// Get count by category
db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', (err, rows) => {
  if (err) {
    console.error('Error getting count by category:', err);
  } else {
    console.log('\n🏷️ Products by category:');
    rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count}`);
    });
  }
  
  db.close();
});















