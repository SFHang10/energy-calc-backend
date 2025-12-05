const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking ETL Products with Images...\n');

db.all(`
    SELECT * FROM products 
    WHERE source = 'ETL' 
    AND name NOT LIKE 'SK %' 
    AND image_url IS NOT NULL 
    AND image_url != ''
    LIMIT 5
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log(`Found ${rows.length} ETL products with images:`);
    console.log('='.repeat(80));
    
    rows.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Subcategory: ${product.subcategory}`);
        console.log(`   Power: ${product.power}`);
        console.log(`   Energy Rating: ${product.energy_rating}`);
        console.log(`   Image: ${product.image_url}`);
        console.log('-'.repeat(80));
    });
    
    db.close();
});






