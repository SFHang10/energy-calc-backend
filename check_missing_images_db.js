const sqlite3 = require('sqlite3').verbose();

console.log('🔍 CHECKING DATABASE FOR PRODUCTS WITHOUT IMAGES\n');

const db = new sqlite3.Database('database/energy_calculator_central.db');

db.all(`
    SELECT name, imageUrl 
    FROM products 
    WHERE category = 'professional-foodservice' 
    AND (imageUrl IS NULL OR imageUrl = '' OR imageUrl = 'NO IMAGE')
    LIMIT 10
`, [], (err, rows) => {
    if (err) {
        console.log('❌ Error:', err.message);
    } else {
        console.log(`📊 Found ${rows.length} products still without images:`);
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   Image URL: ${row.imageUrl || 'NULL'}`);
        });
    }
    
    // Also check total count
    db.get(`
        SELECT COUNT(*) as count 
        FROM products 
        WHERE category = 'professional-foodservice' 
        AND (imageUrl IS NULL OR imageUrl = '' OR imageUrl = 'NO IMAGE')
    `, [], (err, result) => {
        if (err) {
            console.log('❌ Error getting count:', err.message);
        } else {
            console.log(`\n📊 Total products without images: ${result.count}`);
        }
        
        db.close();
    });
});



















