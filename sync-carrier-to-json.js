const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Based on safe_sync_images_to_json.js pattern
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🔄 Syncing Carrier images from database to JSON...\n');

// Load JSON
let jsonData;
try {
    jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ Loaded JSON: ${jsonData.products.length} products\n`);
} catch (error) {
    console.error('❌ Error loading JSON:', error);
    process.exit(1);
}

// Connect to database
const db = new sqlite3.Database(dbPath);

// Get Carrier products from database
db.all(`
    SELECT id, name, imageUrl
    FROM products 
    WHERE name LIKE 'Carrier Refrigeration%'
    AND imageUrl LIKE 'https://static.wixstatic.com%'
`, (err, dbProducts) => {
    if (err) {
        console.error('❌ Database error:', err);
        db.close();
        return;
    }

    console.log(`🔍 Found ${dbProducts.length} Carrier products in database\n`);

    let updated = 0;
    dbProducts.forEach(dbProduct => {
        const jsonProduct = jsonData.products.find(p => p.id === dbProduct.id);
        if (jsonProduct && jsonProduct.imageUrl !== dbProduct.imageUrl) {
            console.log(`✅ UPDATING: ${jsonProduct.name}`);
            console.log(`   Old: ${jsonProduct.imageUrl}`);
            console.log(`   New: ${dbProduct.imageUrl}\n`);
            jsonProduct.imageUrl = dbProduct.imageUrl;
            updated++;
        }
    });

    // Save JSON
    try {
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        console.log(`\n📊 SYNC complete: Updated ${updated} products`);
        console.log(`📄 JSON file saved\n`);
    } catch (error) {
        console.error('❌ Error saving JSON:', error);
    }

    db.close();
});

