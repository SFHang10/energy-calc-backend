const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🔍 Checking energy_calculator.db for manually added products...\n');

// Check products with images
db.all('SELECT name, brand, images FROM products WHERE images IS NOT NULL AND images != "" AND images != "[]" LIMIT 10', (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('📸 Products with images in energy_calculator.db:');
    rows.forEach(row => {
        try {
            const images = JSON.parse(row.images || '[]');
            console.log(`  ${row.name} (${row.brand}) - ${images.length} images`);
            if (images.length > 0) {
                console.log(`    Images: ${images.slice(0, 2).join(', ')}${images.length > 2 ? '...' : ''}`);
            }
        } catch (e) {
            console.log(`  ${row.name} (${row.brand}) - Invalid images data`);
        }
    });
    console.log('');
    
    // Check total count
    db.get('SELECT COUNT(*) as count FROM products', (err, countRow) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.log(`📊 Total products in energy_calculator.db: ${countRow.count}\n`);
        
        // Check categories
        db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', (err, categoryRows) => {
            if (err) {
                console.error('Error:', err);
                return;
            }
            
            console.log('📂 Categories in energy_calculator.db:');
            categoryRows.forEach(row => {
                console.log(`  ${row.category}: ${row.count} products`);
            });
            console.log('');
            
            // Check sample products
            db.all('SELECT name, brand, category FROM products LIMIT 5', (err, sampleRows) => {
                if (err) {
                    console.error('Error:', err);
                    return;
                }
                
                console.log('📋 Sample products in energy_calculator.db:');
                sampleRows.forEach(row => {
                    console.log(`  ${row.name} (${row.category}) - ${row.brand}`);
                });
                
                db.close();
            });
        });
    });
});



