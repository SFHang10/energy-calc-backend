const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🔍 ETL Product Categories:\n');

db.all(`
    SELECT DISTINCT subcategory, COUNT(*) as count 
    FROM products 
    WHERE source = 'ETL' 
    ORDER BY subcategory
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('📋 Available Categories:');
        console.log('='.repeat(50));
        rows.forEach(row => {
            console.log(`• ${row.subcategory} (${row.count} products)`);
        });
        
        console.log('\n🎯 Top Categories for Shop:');
        console.log('='.repeat(30));
        const topCategories = rows.slice(0, 10);
        topCategories.forEach(row => {
            console.log(`• ${row.subcategory}`);
        });
    }
    
    db.close();
});