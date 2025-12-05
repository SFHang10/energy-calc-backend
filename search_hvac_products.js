const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🏭 Searching for HVAC Equipment Products...\n');

// Search for HVAC products with different terms
const searchTerms = [
    'hvac', 'ventilation', 'air conditioning', 'air cooler', 'chilled beam',
    'evaporative', 'fan', 'motor', 'drive', 'inverter', 'control'
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
        LIMIT 8
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
            console.log(`\n🎯 Total unique HVAC products found: ${totalFound}`);
            
            // Also check for products from known HVAC manufacturers
            console.log('\n🏭 Checking known HVAC manufacturers...');
            const hvacManufacturers = [
                'ABB Ltd', 'Evapco Europe NV', 'WEG Electric Motors', 'Invertek Drives Ltd',
                'Danfoss Ltd', 'Schneider Electric Ltd', 'Eaton Electrical Limited',
                'Vacon Drives UK Ltd', 'Grundfos Pumps Ltd', 'Fuji Electric'
            ];
            
            hvacManufacturers.forEach(manufacturer => {
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






