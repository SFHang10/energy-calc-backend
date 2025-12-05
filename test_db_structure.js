const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🔍 Checking database structure safely...\n');

// Check table structure
db.all('PRAGMA table_info(products)', (err, rows) => {
    if (err) {
        console.error('❌ Error checking table structure:', err);
        return;
    }
    
    console.log('📋 Products table columns:');
    rows.forEach(col => {
        console.log(`  ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : ''}`);
    });
    
    console.log('\n🔍 Checking current image_url values...');
    
    // Check current image_url values for foodservice products
    db.all(`
        SELECT name, brand, image_url 
        FROM products 
        WHERE name LIKE '%dishwasher%' OR name LIKE '%oven%'
        LIMIT 5
    `, (err, rows) => {
        if (err) {
            console.error('❌ Error checking products:', err);
            return;
        }
        
        console.log('\n📸 Current image status:');
        rows.forEach(product => {
            console.log(`  ${product.name}: ${product.image_url || 'NO IMAGE'}`);
        });
        
        console.log('\n✅ Database check complete - safe to proceed');
        db.close();
    });
});












