const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking ETL Products with Images...\n');

db.all(`
    SELECT name, brand, image_url
    FROM products
    WHERE source = 'ETL' 
    AND image_url IS NOT NULL 
    AND image_url != ''
    LIMIT 5
`, (err, rows) => {
    if (err) {
        console.error('Error querying ETL products with images:', err);
    } else if (rows.length > 0) {
        console.log(`✅ Found ${rows.length} ETL products with images:`);
        console.log('================================================================================');
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   Brand: ${row.brand}`);
            console.log(`   Image URL: ${row.image_url}`);
            console.log('--------------------------------------------------------------------------------');
        });
    } else {
        console.log('❌ No ETL products with images found in database');
    }
    
    // Also check total count
    db.get(`SELECT COUNT(*) as total FROM products WHERE source = 'ETL'`, (err, totalRow) => {
        if (err) {
            console.error('Error counting total ETL products:', err);
        } else {
            console.log(`\n📊 Total ETL products in database: ${totalRow.total}`);
        }
        
        db.get(`SELECT COUNT(*) as withImages FROM products WHERE source = 'ETL' AND image_url IS NOT NULL AND image_url != ''`, (err, imageRow) => {
            if (err) {
                console.error('Error counting ETL products with images:', err);
            } else {
                console.log(`📸 ETL products with images: ${imageRow.withImages}`);
            }
            db.close();
        });
    });
});