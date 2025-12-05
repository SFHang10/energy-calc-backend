const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking ETL Product Data Structure...\n');

db.all(`
    SELECT * FROM products 
    WHERE source = 'ETL' 
    AND name NOT LIKE 'SK %' 
    LIMIT 3
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('Sample ETL product data:');
    console.log(JSON.stringify(rows[0], null, 2));
    
    db.close();
});






