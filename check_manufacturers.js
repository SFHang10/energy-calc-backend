const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking ETL Manufacturers/Brands...\n');

db.all(`
    SELECT DISTINCT subcategory, COUNT(*) as count
    FROM products 
    WHERE source = 'ETL' 
    AND name NOT LIKE 'SK %' 
    AND name NOT LIKE 'ETL Certified%'
    GROUP BY subcategory
    ORDER BY count DESC
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('📋 Available ETL Manufacturers/Brands:');
    console.log('='.repeat(50));
    
    rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.subcategory} (${row.count} products)`);
    });

    console.log('\n🔍 Sample products from different manufacturers:\n');
    
    // Get one product from each manufacturer
    rows.slice(0, 10).forEach((row, index) => {
        db.get(`
            SELECT name, category, power, energy_rating, image_url
            FROM products 
            WHERE source = 'ETL' 
            AND name NOT LIKE 'SK %' 
            AND name NOT LIKE 'ETL Certified%'
            AND subcategory = ?
            AND image_url IS NOT NULL 
            AND image_url != ''
            LIMIT 1
        `, [row.subcategory], (err, product) => {
            if (err) {
                console.error(`Error getting product for ${row.subcategory}:`, err);
                return;
            }
            
            if (product) {
                console.log(`${index + 1}. ${row.subcategory}:`);
                console.log(`   Product: ${product.name}`);
                console.log(`   Category: ${product.category}`);
                console.log(`   Power: ${product.power}`);
                console.log(`   Energy Rating: ${product.energy_rating}`);
                console.log(`   Image: ${product.image_url ? '✅ Available' : '❌ Missing'}`);
                console.log('');
            }
            
            if (index === Math.min(9, rows.length - 1)) {
                db.close();
            }
        });
    });
});






