const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');

console.log('🔍 Checking Carrier products in database...\n');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

db.all(`
    SELECT id, name, imageUrl
    FROM products 
    WHERE name LIKE '%Carrier%'
`, (err, rows) => {
    if (err) {
        console.error('❌ Query error:', err.message);
        db.close();
        return;
    }

    console.log(`Found ${rows.length} Carrier products:\n`);
    rows.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`Name: ${row.name}`);
        console.log(`ImageUrl: ${row.imageUrl || 'null'}`);
        console.log('');
    });

    db.close();
});

