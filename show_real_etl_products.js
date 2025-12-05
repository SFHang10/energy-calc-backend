const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🔍 Real ETL Products (Not SKU Codes)...\n');

// Get real ETL products (not SKU-based ones)
db.all(`
    SELECT name, brand, category, subcategory, image_url, power, energy_rating
    FROM products
    WHERE source = 'ETL'
    AND name NOT LIKE 'SK %'
    AND name NOT LIKE 'ETL Certified%'
    AND image_url IS NOT NULL
    ORDER BY category, name
    LIMIT 15
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('✅ Real ETL Products with Images:');
        console.log('='.repeat(100));
        
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   Brand: ${row.brand}`);
            console.log(`   Category: ${row.category}`);
            console.log(`   Subcategory: ${row.subcategory}`);
            console.log(`   Power: ${row.power}W`);
            console.log(`   Energy Rating: ${row.energy_rating}`);
            console.log(`   Image: ${row.image_url}`);
            console.log('-'.repeat(100));
        });
        
        if (rows.length === 0) {
            console.log('❌ No real ETL products found');
        }
    }
    
    db.close();
});






