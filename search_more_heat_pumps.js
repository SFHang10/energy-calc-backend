const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔥 Searching for More Heat Pump Products...\n');

// Search for heat pump products with broader terms
const searchTerms = [
    'heat pump', 'heatpump', 'thermal', 'pump', 'heating', 
    'air source', 'ground source', 'water source', 'reversible',
    'daikin', 'mitsubishi', 'panasonic', 'carrier', 'trane'
];

let foundProducts = new Set();
let totalFound = 0;

searchTerms.forEach((term, index) => {
    db.all(`
        SELECT name, subcategory, power, energy_rating, image_url
        FROM products 
        WHERE source = 'ETL' 
        AND (LOWER(name) LIKE ? OR LOWER(subcategory) LIKE ?)
        AND image_url IS NOT NULL 
        AND image_url != ''
        ORDER BY name
        LIMIT 10
    `, [`%${term}%`, `%${term}%`], (err, rows) => {
        if (err) {
            console.error(`Error searching for ${term}:`, err);
            return;
        }

        if (rows.length > 0) {
            console.log(`✅ Found ${rows.length} products matching "${term}":`);
            rows.forEach((product, productIndex) => {
                const productKey = `${product.name}-${product.subcategory}`;
                if (!foundProducts.has(productKey)) {
                    foundProducts.add(productKey);
                    totalFound++;
                    console.log(`   ${totalFound}. ${product.name}`);
                    console.log(`      Manufacturer: ${product.subcategory}`);
                    console.log(`      Power: ${product.power}`);
                    console.log(`      Energy Rating: ${product.energy_rating}`);
                    console.log(`      Image: ${product.image_url ? '✅ Available' : '❌ Missing'}`);
                    console.log('');
                }
            });
        } else {
            console.log(`❌ No products found matching "${term}"`);
        }
        
        if (index === searchTerms.length - 1) {
            console.log(`\n🎯 Total unique heat pump products found: ${totalFound}`);
            
            // Also check for products from known heat pump manufacturers
            console.log('\n🏭 Checking known heat pump manufacturers...');
            const heatPumpManufacturers = [
                'Daikin', 'Mitsubishi', 'Panasonic', 'Carrier', 'Trane', 
                'Vaillant', 'Viessmann', 'Bosch', 'Samsung', 'LG'
            ];
            
            heatPumpManufacturers.forEach(manufacturer => {
                db.all(`
                    SELECT name, subcategory, power, energy_rating, image_url
                    FROM products 
                    WHERE source = 'ETL' 
                    AND LOWER(subcategory) LIKE ?
                    AND image_url IS NOT NULL 
                    AND image_url != ''
                    ORDER BY name
                    LIMIT 5
                `, [`%${manufacturer.toLowerCase()}%`], (err, rows) => {
                    if (err) {
                        console.error(`Error searching for ${manufacturer}:`, err);
                        return;
                    }

                    if (rows.length > 0) {
                        console.log(`✅ Found ${rows.length} products from ${manufacturer}:`);
                        rows.forEach((product, productIndex) => {
                            console.log(`   ${productIndex + 1}. ${product.name}`);
                            console.log(`      Power: ${product.power}`);
                            console.log(`      Energy Rating: ${product.energy_rating}`);
                            console.log('');
                        });
                    }
                });
            });
            
            db.close();
        }
    });
});






