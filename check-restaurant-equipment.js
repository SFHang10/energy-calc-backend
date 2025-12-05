const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/energy_calculator_with_collection.db');

console.log('🔍 Checking Restaurant Equipment Distribution...\n');

// Check ETL Technology subcategories for restaurant/commercial equipment
db.all(`
    SELECT subcategory, COUNT(*) as count 
    FROM products 
    WHERE category = 'ETL Technology' 
    AND (
        subcategory LIKE '%Restaurant%' OR 
        subcategory LIKE '%Commercial%' OR 
        subcategory LIKE '%Kitchen%' OR 
        subcategory LIKE '%Food%' OR 
        subcategory LIKE '%Catering%' OR
        subcategory LIKE '%Cooking%' OR
        subcategory LIKE '%Refrigeration%' OR
        subcategory LIKE '%Freezer%' OR
        subcategory LIKE '%Chiller%'
    )
    GROUP BY subcategory 
    ORDER BY count DESC 
    LIMIT 15
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('🍽️ ETL Technology - Restaurant/Commercial Subcategories:');
    let totalRestaurantETL = 0;
    rows.forEach(row => {
        console.log(`  ${row.subcategory}: ${row.count} products`);
        totalRestaurantETL += row.count;
    });
    console.log(`\n📊 Total Restaurant/Commercial ETL products: ${totalRestaurantETL}\n`);
    
    // Check standalone Restaurant Equipment category
    db.all(`
        SELECT subcategory, COUNT(*) as count 
        FROM products 
        WHERE category = 'Restaurant Equipment'
        GROUP BY subcategory 
        ORDER BY count DESC
    `, (err, restaurantRows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        
        console.log('🏪 Standalone Restaurant Equipment:');
        let totalStandalone = 0;
        restaurantRows.forEach(row => {
            console.log(`  ${row.subcategory}: ${row.count} products`);
            totalStandalone += row.count;
        });
        console.log(`\n📊 Total Standalone Restaurant Equipment: ${totalStandalone}\n`);
        
        console.log(`🎯 TOTAL RESTAURANT EQUIPMENT: ${totalRestaurantETL + totalStandalone} products\n`);
        
        // Check sample restaurant products
        db.all(`
            SELECT name, category, subcategory, brand 
            FROM products 
            WHERE (
                category = 'ETL Technology' AND (
                    subcategory LIKE '%Restaurant%' OR 
                    subcategory LIKE '%Commercial%' OR 
                    subcategory LIKE '%Kitchen%' OR 
                    subcategory LIKE '%Food%' OR 
                    subcategory LIKE '%Catering%'
                )
            ) OR category = 'Restaurant Equipment'
            LIMIT 10
        `, (err, sampleRows) => {
            if (err) {
                console.error('Error:', err);
                return;
            }
            
            console.log('🍽️ Sample Restaurant Equipment Products:');
            sampleRows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.name}`);
                console.log(`   Category: ${row.category}`);
                console.log(`   Subcategory: ${row.subcategory}`);
                console.log(`   Brand: ${row.brand}`);
                console.log('');
            });
            
            db.close();
        });
    });
});



