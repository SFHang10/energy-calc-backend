const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/energy_calculator_with_collection.db');

console.log('🔍 Checking ETL Marking and Data Sources...\n');

// Check total products
db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log(`📊 Total products: ${row.count}\n`);
});

// Check categories and their sources
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

// Check for ETL identification fields
db.all('SELECT DISTINCT extractedFrom FROM products WHERE extractedFrom IS NOT NULL', (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('🏷️ Data Sources (extractedFrom):');
    rows.forEach(row => {
        console.log(`  ${row.extractedFrom}`);
    });
    console.log('');
});

// Check for ETL Technology products specifically
db.all('SELECT COUNT(*) as count FROM products WHERE category = "ETL Technology"', (err, row) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log(`🔬 ETL Technology products: ${row.count}\n`);
});

// Check sample ETL products to see their marking
db.all('SELECT name, category, subcategory, extractedFrom, source FROM products WHERE category = "ETL Technology" LIMIT 5', (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('🔬 Sample ETL Technology products:');
    rows.forEach(row => {
        console.log(`  ${row.name}`);
        console.log(`    Category: ${row.category}`);
        console.log(`    Subcategory: ${row.subcategory}`);
        console.log(`    Extracted From: ${row.extractedFrom || 'NULL'}`);
        console.log(`    Source: ${row.source || 'NULL'}`);
        console.log('');
    });
});

// Check for comparison data
db.all('SELECT COUNT(*) as count FROM products WHERE category LIKE "%Comparison%" OR category LIKE "%Old%" OR category LIKE "%Inefficient%"', (err, row) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log(`📊 Comparison/Old products: ${row.count}\n`);
});

// Check Appliances category (should be actual products, not comparison)
db.all('SELECT name, category, subcategory, extractedFrom FROM products WHERE category = "Appliances" LIMIT 5', (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('🏠 Sample Appliances products:');
    rows.forEach(row => {
        console.log(`  ${row.name} (${row.subcategory}) - Source: ${row.extractedFrom || 'NULL'}`);
    });
    console.log('');
    
    db.close();
});



