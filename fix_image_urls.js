const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🔍 Checking current image URLs and fixing them...\n');

// Check current image URLs
db.all('SELECT name, image_url FROM products WHERE image_url IS NOT NULL', (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }
    
    console.log('📸 Current image URLs:');
    rows.forEach(product => {
        console.log(`  ${product.name}: ${product.image_url}`);
    });
    
    console.log('\n🛠️ The issue: file:// URLs don\'t work in browsers');
    console.log('💡 Solution: Convert to HTTP URLs or use placeholder images');
    
    // Fix the URLs by converting to HTTP URLs that the server can serve
    console.log('\n🔄 Fixing image URLs...');
    
    const updates = rows.map(product => {
        if (product.image_url && product.image_url.startsWith('file:///')) {
            // Convert file path to HTTP URL
            const filePath = product.image_url.replace('file:///', '');
            const fileName = path.basename(filePath);
            const httpUrl = `/product-media/images/${fileName}`;
            
            console.log(`  ${product.name}: ${product.image_url} -> ${httpUrl}`);
            
            return new Promise((resolve, reject) => {
                db.run(
                    'UPDATE products SET image_url = ? WHERE name = ?',
                    [httpUrl, product.name],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }
        return Promise.resolve();
    });
    
    Promise.all(updates).then(() => {
        console.log('\n✅ Image URLs updated successfully!');
        console.log('📋 Next step: Copy images to /product-media/images/ folder');
        db.close();
    }).catch(error => {
        console.error('❌ Error updating URLs:', error);
        db.close();
    });
});












