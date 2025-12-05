const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🔍 Searching for "Invoq Bake 6" oven...\n');

db.all(`
    SELECT name, brand, image_url, category, id
    FROM products 
    WHERE name LIKE '%invoq%' 
       OR name LIKE '%bake%'
       OR name LIKE '%oven%'
    ORDER BY name
`, (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }
    
    console.log(`✅ Found ${rows.length} products:\n`);
    rows.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Image URL: ${product.image_url || 'NO IMAGE'}`);
        console.log('');
    });
    
    // Look specifically for "Invoq Bake 6"
    const invoqProduct = rows.find(p => p.name.toLowerCase().includes('invoq') && p.name.toLowerCase().includes('bake'));
    if (invoqProduct) {
        console.log('🎯 FOUND MATCHING PRODUCT:');
        console.log(`   Name: ${invoqProduct.name}`);
        console.log(`   Brand: ${invoqProduct.brand}`);
        console.log(`   ID: ${invoqProduct.id}`);
        console.log(`   Image URL: ${invoqProduct.image_url || 'NO IMAGE'}`);
    } else {
        console.log('❌ No exact match found for "Invoq Bake 6"');
    }
    
    db.close();
});












