const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🔧 Updating Database Schema to Include Images...\n');

// Add image_url column to products table
db.run('ALTER TABLE products ADD COLUMN image_url TEXT', (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('✅ Image URL column already exists');
        } else {
            console.error('❌ Error adding image_url column:', err.message);
        }
    } else {
        console.log('✅ Successfully added image_url column');
    }
    
    // Check the updated schema
    db.all('PRAGMA table_info(products)', (err, rows) => {
        if (err) {
            console.error('Error getting schema:', err);
        } else {
            console.log('\n📋 Updated Database Schema:');
            rows.forEach(row => {
                console.log(`  ${row.name}: ${row.type}`);
            });
        }
        db.close();
    });
});






