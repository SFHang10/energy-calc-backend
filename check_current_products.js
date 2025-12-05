const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/energy_calculator.db');

console.log('📦 CHECKING CURRENT PRODUCTS IN DATABASE\n');

// Check sample products
db.all('SELECT name, brand, source FROM products WHERE source = "Sample" LIMIT 10', (err, sampleRows) => {
  if (err) {
    console.error('Error getting sample products:', err);
  } else {
    console.log('📋 Sample Products (likely already in your store):');
    sampleRows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.name} (${row.brand})`);
    });
  }
});

// Check ETL products
db.all('SELECT name, brand, source FROM products WHERE source = "ETL" LIMIT 10', (err, etlRows) => {
  if (err) {
    console.error('Error getting ETL products:', err);
  } else {
    console.log('\n🌐 ETL Products (new products for store):');
    etlRows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.name} (${row.brand})`);
    });
  }
});

// Check total counts
db.get('SELECT source, COUNT(*) as count FROM products GROUP BY source', (err, rows) => {
  if (err) {
    console.error('Error getting counts:', err);
  } else {
    console.log('\n📊 Product Summary:');
    rows.forEach(row => {
      console.log(`   ${row.source}: ${row.count} products`);
    });
  }
  
  db.close();
});















