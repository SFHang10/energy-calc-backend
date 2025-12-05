const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking ETL Manufacturers and Categories...\n');

// Check manufacturers
db.all(`
    SELECT DISTINCT subcategory, COUNT(*) as count 
    FROM products 
    WHERE source = 'ETL' 
    GROUP BY subcategory 
    ORDER BY count DESC 
    LIMIT 15
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('📋 Top ETL Manufacturers:');
    console.log('='.repeat(50));
    rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.subcategory} (${row.count} products)`);
    });

    // Check for shower products specifically
    console.log('\n🚿 Checking for Shower Products...');
    db.all(`
        SELECT name, subcategory, image_url
        FROM products 
        WHERE source = 'ETL' 
        AND (name LIKE '%shower%' OR subcategory LIKE '%shower%')
        AND image_url IS NOT NULL 
        AND image_url != ''
        LIMIT 10
    `, (err, showerRows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        if (showerRows.length > 0) {
            console.log(`✅ Found ${showerRows.length} shower products with images:`);
            showerRows.forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name} - ${product.subcategory}`);
            });
        } else {
            console.log('❌ No shower products found');
        }

        // Check for heat pump products
        console.log('\n🔥 Checking for Heat Pump Products...');
        db.all(`
            SELECT name, subcategory, image_url
            FROM products 
            WHERE source = 'ETL' 
            AND (name LIKE '%heat pump%' OR subcategory LIKE '%heat pump%')
            AND image_url IS NOT NULL 
            AND image_url != ''
            LIMIT 10
        `, (err, heatPumpRows) => {
            if (err) {
                console.error('Error:', err);
                return;
            }

            if (heatPumpRows.length > 0) {
                console.log(`✅ Found ${heatPumpRows.length} heat pump products with images:`);
                heatPumpRows.forEach((product, index) => {
                    console.log(`   ${index + 1}. ${product.name} - ${product.subcategory}`);
                });
            } else {
                console.log('❌ No heat pump products found');
            }

            db.close();
        });
    });
});






