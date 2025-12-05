const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Debugging Category Data...\n');

// Check a few sample products to see their actual data
db.all(`
    SELECT name, brand, category, subcategory, image_url
    FROM products
    WHERE source = 'ETL'
    AND image_url IS NOT NULL 
    AND image_url != ''
    LIMIT 10
`, (err, rows) => {
    if (err) {
        console.error('Error querying sample products:', err);
        return;
    }

    console.log('📋 Sample ETL Products:');
    console.log('================================================================================');
    rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name}`);
        console.log(`   Brand: ${row.brand}`);
        console.log(`   Category: ${row.category}`);
        console.log(`   Subcategory: ${row.subcategory}`);
        console.log(`   Image: ${row.image_url ? '✅' : '❌'}`);
        console.log('');
    });

    // Check if there are any products with different categories
    db.all(`
        SELECT DISTINCT category, COUNT(*) as count
        FROM products
        WHERE source = 'ETL'
        GROUP BY category
        ORDER BY count DESC
        LIMIT 20
    `, (err, categoryRows) => {
        if (err) {
            console.error('Error querying distinct categories:', err);
            return;
        }

        console.log('📊 All Categories Found:');
        console.log('================================================================================');
        categoryRows.forEach((row, index) => {
            console.log(`${index + 1}. "${row.category}" (${row.count} products)`);
        });

        db.close();
    });
});






