const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔥 Checking Heat Pump Products...\n');

// Search for heat pump products with different variations
const searchTerms = ['heat pump', 'heatpump', 'pump', 'thermal', 'heating'];

searchTerms.forEach((term, index) => {
    db.all(`
        SELECT name, subcategory, power, energy_rating, image_url
        FROM products 
        WHERE source = 'ETL' 
        AND (LOWER(name) LIKE ? OR LOWER(subcategory) LIKE ?)
        AND image_url IS NOT NULL 
        AND image_url != ''
        ORDER BY name
        LIMIT 5
    `, [`%${term}%`, `%${term}%`], (err, rows) => {
        if (err) {
            console.error(`Error searching for ${term}:`, err);
            return;
        }

        if (rows.length > 0) {
            console.log(`✅ Found ${rows.length} products matching "${term}":`);
            rows.forEach((product, productIndex) => {
                console.log(`   ${productIndex + 1}. ${product.name}`);
                console.log(`      Manufacturer: ${product.subcategory}`);
                console.log(`      Power: ${product.power}`);
                console.log(`      Energy Rating: ${product.energy_rating}`);
                console.log(`      Image: ${product.image_url ? '✅ Available' : '❌ Missing'}`);
                console.log('');
            });
        } else {
            console.log(`❌ No products found matching "${term}"`);
        }
        
        if (index === searchTerms.length - 1) {
            console.log('\n🎯 Heat Pump Analysis Complete!');
            db.close();
        }
    });
});






