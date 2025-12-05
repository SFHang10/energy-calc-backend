const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking Your Requested Categories...\n');

// Your requested categories in order
const requestedCategories = [
    'Heat Pumps',
    'Heating, Ventilation and Air Conditioning (HVAC) Equipment',
    'Professional Food Services Equipment', // Need to check variations
    'Refrigerator Equipment', // Need to check variations  
    'Shower' // Need to check variations
];

// Also check for variations
const variations = [
    'food service', 'refrigerator', 'shower', 'wastewater', 'hand dryer'
];

let completed = 0;

// Check your main categories
requestedCategories.forEach((category, index) => {
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
        
        completed++;
        if (completed === requestedCategories.length) {
            checkVariations();
        }
    });
});

function checkVariations() {
    console.log('\n🔍 Checking for Category Variations...\n');
    
    variations.forEach(term => {
        db.all(`
            SELECT DISTINCT category, COUNT(*) as count
            FROM products 
            WHERE source = 'ETL' 
            AND name NOT LIKE 'SK %' 
            AND name NOT LIKE 'ETL Certified%'
            AND (LOWER(category) LIKE ? OR LOWER(subcategory) LIKE ?)
            GROUP BY category
        `, [`%${term}%`, `%${term}%`], (err, rows) => {
            if (err) {
                console.error(`Error searching for ${term}:`, err);
                return;
            }
            
            if (rows.length > 0) {
                console.log(`✅ Found categories matching "${term}":`);
                rows.forEach(row => {
                    console.log(`   - ${row.category} (${row.count} products)`);
                });
            } else {
                console.log(`❌ No categories found matching "${term}"`);
            }
        });
    });
    
    db.close();
}






