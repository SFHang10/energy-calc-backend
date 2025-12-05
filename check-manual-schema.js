const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const MANUAL_DB_PATH = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(MANUAL_DB_PATH);

console.log('🔍 Checking manual database schema...\n');

db.all('PRAGMA table_info(products)', (err, schemaRows) => {
    if (err) {
        console.error('Error getting schema:', err);
    } else {
        console.log('📋 Manual database schema:');
        schemaRows.forEach(row => {
            console.log(`  ${row.name}: ${row.type}`);
        });
        console.log('\n');
        
        // Test a simple query
        db.all('SELECT id, name, brand, category FROM products LIMIT 3', (err, rows) => {
            if (err) {
                console.error('❌ Simple query failed:', err);
            } else {
                console.log('✅ Simple query works:');
                rows.forEach(row => {
                    console.log(`  ${row.id}: ${row.name} (${row.category}) - ${row.brand}`);
                });
            }
            db.close();
        });
    }
});



