const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Available ETL Product Categories...\n');

db.all(`
    SELECT category, COUNT(*) as count
    FROM products
    WHERE source = 'ETL'
    GROUP BY category
    ORDER BY count DESC
`, (err, rows) => {
    if (err) {
        console.error('Error querying categories:', err);
        return;
    }

    console.log('📋 All ETL Categories:');
    console.log('================================================================================');
    rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.category} (${row.count} products)`);
    });

    console.log('\n🔍 Checking for categories with images...');
    
    db.all(`
        SELECT category, COUNT(*) as count
        FROM products
        WHERE source = 'ETL' 
        AND image_url IS NOT NULL 
        AND image_url != ''
        GROUP BY category
        ORDER BY count DESC
    `, (err, imageRows) => {
        if (err) {
            console.error('Error querying categories with images:', err);
            return;
        }

        console.log('\n📸 Categories with Images:');
        console.log('================================================================================');
        imageRows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.category} (${row.count} products with images)`);
        });

        console.log('\n🎯 Recommended Next Categories to Sync:');
        console.log('================================================================================');
        
        const recommendedCategories = [
            'Refrigeration Equipment',
            'Hand Dryers', 
            'Wastewater Heat Recovery Systems (Instantaneous)',
            'Motors, Drives & Fans',
            'Lighting',
            'Boiler Equipment'
        ];

        recommendedCategories.forEach(cat => {
            const found = imageRows.find(row => row.category === cat);
            if (found) {
                console.log(`✅ ${cat} - ${found.count} products with images`);
            } else {
                console.log(`❌ ${cat} - Not found or no images`);
            }
        });

        db.close();
    });
});