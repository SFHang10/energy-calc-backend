const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Check which products still have placeholder images
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking products with placeholder images...\n');

db.all(`
    SELECT id, name, brand, imageUrl, category
    FROM products 
    WHERE category = 'professional-foodservice'
    AND imageUrl LIKE '%placeholder%'
    ORDER BY name
`, (err, products) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }

    console.log(`📊 Found ${products.length} products with placeholder images:\n`);

    products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Current Image: ${product.imageUrl}`);
        console.log('');
    });

    if (products.length > 0) {
        console.log('🔧 Let me check if we have real images available for these products...\n');
        
        // Check if we have images in the product-images folder
        const fs = require('fs');
        const productImagesDir = path.join(__dirname, 'product-images');
        
        if (fs.existsSync(productImagesDir)) {
            const imageFiles = fs.readdirSync(productImagesDir);
            console.log(`📁 Found ${imageFiles.length} images in product-images folder:`);
            imageFiles.forEach(file => console.log(`   - ${file}`));
        }
    }

    db.close();
});



















