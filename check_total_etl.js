const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🔍 Checking Total ETL Products...\n');

// Get total count
db.all('SELECT COUNT(*) as total FROM products WHERE source = "ETL"', (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log(`📊 Total ETL Products: ${rows[0].total}`);
    }
    
    // Get unique categories
    db.all(`
        SELECT DISTINCT category, COUNT(*) as count 
        FROM products 
        WHERE source = 'ETL' 
        GROUP BY category 
        ORDER BY count DESC
    `, (err, categoryRows) => {
        if (err) {
            console.error('Error getting categories:', err);
        } else {
            console.log('\n📋 ETL Categories:');
            console.log('='.repeat(50));
            categoryRows.forEach(row => {
                console.log(`${row.category}: ${row.count} products`);
            });
        }
        
        db.close();
    });
});
