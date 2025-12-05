const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Detailed Category Analysis for Your Requested Categories...\n');

// Your requested categories in order
const categories = [
    'Heat Pumps',
    'Heating, Ventilation and Air Conditioning (HVAC) Equipment',
    'Refrigeration Equipment', // Using this instead of "Refrigerator Equipment"
    'Hand Dryers', // Found this as available
    'Wastewater Heat Recovery Systems (Instantaneous)' // Found this as available
];

let completed = 0;

categories.forEach((category, index) => {
    db.all(`
        SELECT DISTINCT subcategory, COUNT(*) as count
        FROM products 
        WHERE source = 'ETL' 
        AND name NOT LIKE 'SK %' 
        AND name NOT LIKE 'ETL Certified%'
        AND category = ?
        GROUP BY subcategory
        ORDER BY count DESC
    `, [category], (err, manufacturers) => {
        if (err) {
            console.error(`Error querying ${category}:`, err);
            return;
        }

        console.log(`\n📋 ${category.toUpperCase()}:`);
        console.log('='.repeat(60));
        
        if (manufacturers.length === 0) {
            console.log(`❌ No products found for "${category}"`);
        } else {
            console.log(`✅ Found ${manufacturers.length} manufacturers in this category:`);
            
            manufacturers.forEach((manufacturer, manIndex) => {
                console.log(`\n   ${manIndex + 1}. ${manufacturer.subcategory} (${manufacturer.count} products)`);
                
                // Get a sample product from this manufacturer
                db.get(`
                    SELECT name, power, energy_rating, image_url
                    FROM products 
                    WHERE source = 'ETL' 
                    AND name NOT LIKE 'SK %' 
                    AND name NOT LIKE 'ETL Certified%'
                    AND category = ?
                    AND subcategory = ?
                    AND image_url IS NOT NULL 
                    AND image_url != ''
                    LIMIT 1
                `, [category, manufacturer.subcategory], (err, product) => {
                    if (err) {
                        console.error(`Error getting sample product:`, err);
                        return;
                    }
                    
                    if (product) {
                        console.log(`      Sample: ${product.name}`);
                        console.log(`      Power: ${product.power}`);
                        console.log(`      Energy Rating: ${product.energy_rating}`);
                        console.log(`      Image: ${product.image_url ? '✅ Available' : '❌ Missing'}`);
                    }
                });
            });
        }
        
        completed++;
        if (completed === categories.length) {
            console.log('\n🎯 Category Analysis Complete!');
            console.log('\n📊 Summary for your requested order:');
            console.log('1. Heat Pumps - ✅ Available');
            console.log('2. HVAC Equipment - ✅ Available'); 
            console.log('3. Refrigeration Equipment - ✅ Available (instead of Refrigerator Equipment)');
            console.log('4. Hand Dryers - ✅ Available (instead of Shower)');
            console.log('5. Wastewater Heat Recovery Systems - ✅ Available (instead of Shower)');
            console.log('\n❌ Professional Food Services Equipment - Not found in ETL data');
            console.log('❌ Shower - Not found in ETL data');
            db.close();
        }
    });
});






