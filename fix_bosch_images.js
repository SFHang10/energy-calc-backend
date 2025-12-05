const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔧 Fixing Bosch product image URLs...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Update Bosch products to use absolute URLs
db.run(`
    UPDATE products 
    SET image_url = 'http://localhost:4000' || image_url 
    WHERE image_url LIKE '/product-media/images/%'
`, function(err) {
    if (err) {
        console.error('Error updating Bosch images:', err);
    } else {
        console.log(`✅ Updated ${this.changes} Bosch products with absolute URLs`);
    }
    
    // Check the results
    db.all(`
        SELECT name, brand, image_url
        FROM products
        WHERE brand = 'Bosch'
    `, (err, rows) => {
        if (err) {
            console.error('Error checking results:', err);
            return;
        }
        
        console.log('\n📋 Updated Bosch products:');
        rows.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   New Image URL: ${product.image_url}`);
        });
        
        db.close();
    });
});



















