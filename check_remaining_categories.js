const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking Remaining Categories for Manual Addition...\n');

// Check for Professional Food Services Equipment
console.log('🍽️ PROFESSIONAL FOOD SERVICES EQUIPMENT:');
console.log('================================================================================');

db.all(`
    SELECT name, brand, image_url, subcategory
    FROM products
    WHERE source = 'ETL' 
    AND image_url IS NOT NULL 
    AND image_url != ''
    AND (
        name LIKE '%food%' OR 
        name LIKE '%catering%' OR 
        name LIKE '%kitchen%' OR 
        name LIKE '%commercial%' OR
        name LIKE '%restaurant%' OR
        name LIKE '%cafe%' OR
        name LIKE '%hotel%' OR
        subcategory LIKE '%food%' OR
        subcategory LIKE '%catering%' OR
        subcategory LIKE '%kitchen%'
    )
    LIMIT 10
`, (err, foodRows) => {
    if (err) {
        console.error('Error querying food services products:', err);
        return;
    }

    if (foodRows.length > 0) {
        console.log(`✅ Found ${foodRows.length} Food Services products with images:`);
        foodRows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   Brand: ${row.brand}`);
            console.log(`   Image: ${row.image_url}`);
            console.log('');
        });
    } else {
        console.log('❌ No Food Services products found with images');
    }

    // Check for Refrigerator Equipment
    console.log('\n❄️ REFRIGERATOR EQUIPMENT:');
    console.log('================================================================================');

    db.all(`
        SELECT name, brand, image_url, subcategory
        FROM products
        WHERE source = 'ETL' 
        AND image_url IS NOT NULL 
        AND image_url != ''
        AND (
            name LIKE '%refrigerator%' OR 
            name LIKE '%refrigeration%' OR 
            name LIKE '%cooler%' OR 
            name LIKE '%freezer%' OR
            name LIKE '%chiller%' OR
            subcategory LIKE '%refrigerator%' OR
            subcategory LIKE '%refrigeration%'
        )
        LIMIT 10
    `, (err, refrigRows) => {
        if (err) {
            console.error('Error querying refrigerator products:', err);
            return;
        }

        if (refrigRows.length > 0) {
            console.log(`✅ Found ${refrigRows.length} Refrigerator products with images:`);
            refrigRows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.name}`);
                console.log(`   Brand: ${row.brand}`);
                console.log(`   Image: ${row.image_url}`);
                console.log('');
            });
        } else {
            console.log('❌ No Refrigerator products found with images');
        }

        // Check for Shower/Wastewater Heat Recovery
        console.log('\n🚿 SHOWER/WASTEWATER HEAT RECOVERY:');
        console.log('================================================================================');

        db.all(`
            SELECT name, brand, image_url, subcategory
            FROM products
            WHERE source = 'ETL' 
            AND image_url IS NOT NULL 
            AND image_url != ''
            AND (
                name LIKE '%shower%' OR 
                name LIKE '%wastewater%' OR 
                name LIKE '%heat recovery%' OR 
                name LIKE '%water heating%' OR
                subcategory LIKE '%shower%' OR
                subcategory LIKE '%wastewater%' OR
                subcategory LIKE '%heat recovery%'
            )
            LIMIT 10
        `, (err, showerRows) => {
            if (err) {
                console.error('Error querying shower products:', err);
                return;
            }

            if (showerRows.length > 0) {
                console.log(`✅ Found ${showerRows.length} Shower/Wastewater products with images:`);
                showerRows.forEach((row, index) => {
                    console.log(`${index + 1}. ${row.name}`);
                    console.log(`   Brand: ${row.brand}`);
                    console.log(`   Image: ${row.image_url}`);
                    console.log('');
                });
            } else {
                console.log('❌ No Shower/Wastewater products found with images');
            }

            console.log('\n🎯 MANUAL ADDITION RECOMMENDATIONS:');
            console.log('================================================================================');
            console.log('1. Check your Wix store first to see what you\'ve already added manually');
            console.log('2. Use the product names above to search for existing products');
            console.log('3. Only add products that aren\'t already in your store');
            console.log('4. Use the provided image URLs for professional product photos');

            db.close();
        });
    });
});






