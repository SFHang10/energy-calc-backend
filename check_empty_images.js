const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Check products with empty or null images
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking products with empty/null images...\n');

db.all(`
    SELECT id, name, brand, imageUrl, category
    FROM products 
    WHERE category = 'professional-foodservice'
    AND (imageUrl IS NULL OR imageUrl = '' OR imageUrl = 'null')
    ORDER BY name
`, (err, products) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }

    console.log(`📊 Found ${products.length} products with empty images:\n`);

    products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Image URL: ${product.imageUrl}`);
        console.log('');
    });

    db.close();
});



















