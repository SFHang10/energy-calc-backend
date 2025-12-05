// Check central database schema
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking central database schema...');

db.all("PRAGMA table_info(products)", (err, columns) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }
    
    console.log('📊 Central database columns:');
    columns.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
    });
    
    // Test a simple query
    db.all("SELECT COUNT(*) as count FROM products", (err, row) => {
        console.log(`\n📈 Total products: ${row.count}`);
        
        // Get categories
        db.all("SELECT DISTINCT category FROM products ORDER BY category LIMIT 10", (err, categories) => {
            console.log('\n📋 Categories:');
            categories.forEach(cat => {
                console.log(`   - ${cat.category}`);
            });
            
            db.close();
        });
    });
});
