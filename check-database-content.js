const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/energy_calculator_with_collection.db');

console.log('🔍 Checking database content...\n');

// Check total products
db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log(`📊 Total products: ${row.count}\n`);
});

// Check categories
db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('📂 Categories:');
    rows.forEach(row => {
        console.log(`  ${row.category}: ${row.count} products`);
    });
    console.log('');
});

// Check for commercial/restaurant products
db.all('SELECT name, category, subcategory, brand FROM products WHERE category LIKE "%Restaurant%" OR subcategory LIKE "%Commercial%" OR name LIKE "%Commercial%" LIMIT 10', (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('🍽️ Commercial/Restaurant products:');
    if (rows.length === 0) {
        console.log('  No commercial/restaurant products found');
    } else {
        rows.forEach(row => {
            console.log(`  ${row.name} (${row.category}/${row.subcategory}) - ${row.brand}`);
        });
    }
    console.log('');
});

// Check sample products
db.all('SELECT name, category, subcategory, brand, price FROM products LIMIT 5', (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('📋 Sample products:');
    rows.forEach(row => {
        console.log(`  ${row.name} (${row.category}) - €${row.price || 'N/A'} - ${row.brand}`);
    });
    
    db.close();
});



