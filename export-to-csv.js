const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Path to your SQLite database
const dbPath = './database/energy_calculator.db';

// Create database connection
const db = new sqlite3.Database(dbPath);

// Export products to CSV
db.all('SELECT * FROM products LIMIT 100', (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    if (rows.length === 0) {
        console.log('No products found');
        return;
    }
    
    // Create CSV header
    const headers = ['id', 'name', 'power', 'brand', 'category', 'subcategory', 'energyRating', 'efficiency', 'modelNumber'];
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    rows.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csv += values.join(',') + '\n';
    });
    
    // Write to file
    fs.writeFileSync('products_export.csv', csv);
    console.log(`✅ Exported ${rows.length} products to products_export.csv`);
    
    // Show sample data
    console.log('\n📊 Sample data:');
    console.log('Headers:', headers);
    console.log('First product:', rows[0]);
    
    db.close();
});


