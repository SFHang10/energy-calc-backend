const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🔍 ETL Subcategories:\n');

db.all(`
    SELECT DISTINCT subcategory, COUNT(*) as count 
    FROM products 
    WHERE source = 'ETL' 
    GROUP BY subcategory 
    ORDER BY count DESC 
    LIMIT 20
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('📋 Available Subcategories:');
        console.log('='.repeat(50));
        rows.forEach(row => {
            console.log(`• ${row.subcategory}: ${row.count} products`);
        });
    }
    db.close();
});













