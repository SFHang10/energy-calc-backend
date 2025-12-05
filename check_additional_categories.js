const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking Additional Categories...\n');

// Check Refrigeration Equipment (might be what you meant by Refrigerator Equipment)
const additionalCategories = [
    'Refrigeration Equipment',
    'Hand Dryers', // Found this as a variation
    'Wastewater Heat Recovery Systems (Instantaneous)' // Found this as a variation
];

additionalCategories.forEach((category, index) => {
    db.all(`
        SELECT name, brand, subcategory, power, energy_rating, image_url
        FROM products 
        WHERE source = 'ETL' 
        AND name NOT LIKE 'SK %' 
        AND name NOT LIKE 'ETL Certified%'
        AND category = ?
        AND image_url IS NOT NULL 
        AND image_url != ''
        ORDER BY name
        LIMIT 5
    `, [category], (err, rows) => {
        if (err) {
            console.error(`Error querying ${category}:`, err);
            return;
        }

        console.log(`\n📋 ${category.toUpperCase()}:`);
        console.log('='.repeat(60));
        
        if (rows.length === 0) {
            console.log(`❌ No products found for "${category}"`);
        } else {
            console.log(`✅ Found ${rows.length} products (showing first 5):`);
            rows.forEach((product, productIndex) => {
                console.log(`   ${productIndex + 1}. ${product.name}`);
                console.log(`      Brand: ${product.subcategory}`);
                console.log(`      Power: ${product.brand}kW`);
                console.log(`      Energy Rating: ${product.energy_rating}`);
                console.log(`      Image: ${product.image_url ? '✅ Available' : '❌ Missing'}`);
                console.log('');
            });
        }
        
        if (index === additionalCategories.length - 1) {
            console.log('\n🎯 Category Analysis Complete!');
            db.close();
        }
    });
});






