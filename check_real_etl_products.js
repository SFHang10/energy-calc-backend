const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🔍 Checking Real ETL Products...\n');

// Get real ETL products (not the generic "ETL Certified" ones)
db.all(`
    SELECT name, brand, subcategory, power, energy_rating, category 
    FROM products 
    WHERE source = 'ETL' 
    AND name NOT LIKE 'ETL Certified%'
    ORDER BY subcategory, name
    LIMIT 20
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('✅ Real ETL Products Found:');
        console.log('='.repeat(80));
        
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   Brand: ${row.brand}`);
            console.log(`   Category: ${row.category}`);
            console.log(`   Subcategory: ${row.subcategory}`);
            console.log(`   Power: ${row.power}W`);
            console.log(`   Energy Rating: ${row.energy_rating}`);
            console.log('');
        });
        
        // Get count by subcategory
        db.all(`
            SELECT subcategory, COUNT(*) as count 
            FROM products 
            WHERE source = 'ETL' 
            AND name NOT LIKE 'ETL Certified%'
            GROUP BY subcategory 
            ORDER BY count DESC
        `, (err, categoryRows) => {
            if (err) {
                console.error('Error getting categories:', err);
            } else {
                console.log('📊 Real ETL Products by Category:');
                console.log('='.repeat(40));
                categoryRows.forEach(row => {
                    console.log(`${row.subcategory}: ${row.count} products`);
                });
            }
            db.close();
        });
    }
});






