const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🖼️ Checking ETL Products with Images...\n');

// Check products with images
db.all(`
    SELECT name, image_url, brand, category 
    FROM products 
    WHERE source = 'ETL' 
    AND image_url IS NOT NULL 
    LIMIT 10
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('✅ ETL Products with Images:');
        console.log('='.repeat(80));
        
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   Brand: ${row.brand}`);
            console.log(`   Category: ${row.category}`);
            console.log(`   Image: ${row.image_url}`);
            console.log('-'.repeat(80));
        });
        
        if (rows.length === 0) {
            console.log('❌ No products with images found');
        }
    }
    
    // Also check total count
    db.get('SELECT COUNT(*) as total FROM products WHERE source = "ETL"', (err, row) => {
        if (err) {
            console.error('Error getting count:', err);
        } else {
            console.log(`\n📊 Total ETL products: ${row.total}`);
        }
        
        db.get('SELECT COUNT(*) as total FROM products WHERE source = "ETL" AND image_url IS NOT NULL', (err, row) => {
            if (err) {
                console.error('Error getting image count:', err);
            } else {
                console.log(`📸 ETL products with images: ${row.total}`);
            }
            
            db.close();
        });
    });
});






