const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking Electrolux products...');

db.all(`
    SELECT name, brand, imageUrl 
    FROM products 
    WHERE brand = 'Electrolux' AND category = 'professional-foodservice'
    ORDER BY name
`, (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
    } else {
        console.log(`\n📋 Found ${rows.length} Electrolux products:`);
        rows.forEach((row, index) => {
            const hasImage = row.imageUrl ? '✅ HAS IMAGE' : '❌ NO IMAGE';
            console.log(`${index + 1}. ${row.name} - ${hasImage}`);
        });
    }
    db.close();
});



















