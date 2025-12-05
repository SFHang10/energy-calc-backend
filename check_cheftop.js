const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking CHEFTOP products...');

db.all(`
    SELECT name, brand, imageUrl 
    FROM products 
    WHERE name LIKE '%CHEFTOP%'
    ORDER BY name
`, (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
    } else {
        console.log(`\n📋 Found ${rows.length} CHEFTOP products:`);
        rows.forEach((row, index) => {
            const hasImage = row.imageUrl ? '✅ HAS IMAGE' : '❌ NO IMAGE';
            console.log(`${index + 1}. ${row.name} - ${hasImage}`);
            if (row.imageUrl) {
                console.log(`   URL: ${row.imageUrl}`);
            }
        });
    }
    db.close();
});



















