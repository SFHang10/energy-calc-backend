const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 COMPREHENSIVE PRODUCT VERIFICATION\n');

// Check current database
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 CURRENT DATABASE STATUS:');

// Get total count
db.get('SELECT COUNT(*) as total FROM products', (err, row) => {
  if (err) {
    console.error('Error getting total count:', err);
  } else {
    console.log(`   Total products: ${row.total}`);
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
});

// Check for specific categories you mentioned
console.log('\n🔍 CHECKING FOR YOUR SPECIFIC CATEGORIES:');
const targetCategories = [
  'Hand Dryers',
  'Heat Pumps', 
  'HVAC Equipment',
  'Lighting',
  'Professional Food Service',
  'Refrigerator Equipment',
  'Showers'
];

targetCategories.forEach(category => {
  db.get(`SELECT COUNT(*) as count FROM products WHERE category = ? OR subcategory = ?`, [category, category], (err, row) => {
    if (err) {
      console.error(`Error checking ${category}:`, err);
    } else {
      console.log(`   ${category}: ${row.count} products`);
    }
  });
});

// Check what we had before migration
console.log('\n📋 CHECKING ENERGY CAL 2 DATABASE:');
try {
  const PRODUCT_DATABASE_BACKUP = require('./Energy Cal 2/product-database-backup.js');
  
  let totalEnergyCal = 0;
  Object.keys(PRODUCT_DATABASE_BACKUP).forEach(category => {
    if (Array.isArray(PRODUCT_DATABASE_BACKUP[category])) {
      const count = PRODUCT_DATABASE_BACKUP[category].length;
      totalEnergyCal += count;
      console.log(`   ${category}: ${count} products`);
    }
  });
  
  console.log(`   Total in Energy Cal 2: ${totalEnergyCal} products`);
  
} catch (error) {
  console.error('Error reading Energy Cal 2 database:', error.message);
}

// Check ETL products
console.log('\n🌐 CHECKING ETL PRODUCTS:');
try {
  const etlRouter = require('./routes/etl-wix.js');
  console.log('   ETL route loaded successfully');
} catch (error) {
  console.error('   Error loading ETL route:', error.message);
}

setTimeout(() => {
  db.close();
  console.log('\n✅ Verification complete!');
}, 2000);















