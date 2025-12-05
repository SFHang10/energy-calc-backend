const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔧 Fixing image URLs with proper encoding...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Get all products with localhost images
db.all(`
    SELECT name, brand, image_url
    FROM products
    WHERE image_url LIKE '%localhost:4000/product-images/%'
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log(`Found ${rows.length} products with localhost images to fix:`);
    
    let updatedCount = 0;
    
    rows.forEach((product, index) => {
        // URL encode the filename part
        const baseUrl = 'http://localhost:4000/product-images/';
        const filename = product.image_url.replace(baseUrl, '');
        const encodedFilename = encodeURIComponent(filename);
        const newImageUrl = baseUrl + encodedFilename;
        
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Old: ${product.image_url}`);
        console.log(`   New: ${newImageUrl}`);
        
        // Update the database
        db.run(
            'UPDATE products SET image_url = ? WHERE name = ? AND brand = ?',
            [newImageUrl, product.name, product.brand],
            function(err) {
                if (err) {
                    console.error(`❌ Error updating ${product.name}:`, err.message);
                } else {
                    console.log(`✅ Updated ${product.name}`);
                    updatedCount++;
                }
            }
        );
    });
    
    setTimeout(() => {
        console.log(`\n📊 Fix Summary:`);
        console.log(`   Products updated: ${updatedCount}`);
        console.log(`   Total processed: ${rows.length}`);
        console.log('\n🎯 Image URLs have been fixed with proper encoding!');
        console.log('Now test the category page again:');
        console.log('http://localhost:4000/category-product-page.html?category=professional-foodservice');
        db.close();
    }, 1000);
});



















