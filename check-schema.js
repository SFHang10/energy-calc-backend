const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DATABASE_PATH = path.join(__dirname, 'database', 'energy_calculator_central.db');

const db = new sqlite3.Database(DATABASE_PATH);

console.log('🔍 Checking database schema...');

db.all("PRAGMA table_info(products)", [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('📋 Products table columns:');
        rows.forEach(row => {
            console.log(`   ${row.name} (${row.type})`);
        });
    }
    
    db.close();
});






