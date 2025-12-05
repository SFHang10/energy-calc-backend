const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// SAFE sync: Only update image URLs, never overwrite existing data
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🔄 SAFE SYNC: Updating only image URLs from database to JSON file...\n');
console.log('⚠️  RULE: NEVER OVERWRITE existing data - only update imageUrl field\n');

// Load JSON file
let jsonData;
try {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    jsonData = JSON.parse(jsonContent);
    console.log(`📄 Loaded JSON file with ${jsonData.products.length} products`);
} catch (error) {
    console.error('❌ Error loading JSON file:', error);
    process.exit(1);
}

// Connect to database
const db = new sqlite3.Database(dbPath);

// Get all products with updated images from database
db.all(`
    SELECT id, name, brand, imageUrl, category
    FROM products 
    WHERE category = 'professional-foodservice'
    AND imageUrl IS NOT NULL 
    AND imageUrl != ''
`, (err, dbProducts) => {
    if (err) {
        console.error('❌ Database error:', err);
        return;
    }

    console.log(`🔍 Found ${dbProducts.length} professional-foodservice products in database\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    // SAFELY update JSON products with database images
    dbProducts.forEach(dbProduct => {
        const jsonProduct = jsonData.products.find(p => p.id === dbProduct.id);
        
        if (jsonProduct) {
            // Only update if the image URL is different and not empty
            if (dbProduct.imageUrl && dbProduct.imageUrl !== jsonProduct.imageUrl) {
                console.log(`✅ SAFE UPDATE: ${jsonProduct.name} (${jsonProduct.brand})`);
                console.log(`   Old imageUrl: ${jsonProduct.imageUrl || 'null'}`);
                console.log(`   New imageUrl: ${dbProduct.imageUrl}`);
                console.log('');
                
                // ONLY update the imageUrl field - preserve everything else
                jsonProduct.imageUrl = dbProduct.imageUrl;
                updatedCount++;
            } else {
                console.log(`⏭️  SKIPPED: ${jsonProduct.name} - imageUrl already correct or empty`);
                skippedCount++;
            }
        } else {
            console.log(`⚠️ Product not found in JSON: ${dbProduct.name} (${dbProduct.brand})`);
            notFoundCount++;
        }
    });

    // Save updated JSON file
    try {
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        console.log(`\n📊 SAFE SYNC complete:`);
        console.log(`- ✅ Updated: ${updatedCount} products (imageUrl only)`);
        console.log(`- ⏭️  Skipped: ${skippedCount} products (no change needed)`);
        console.log(`- ⚠️  Not found in JSON: ${notFoundCount} products`);
        console.log(`- 📄 JSON file saved successfully`);
        console.log(`\n🔄 Please restart the server to clear the cache and see updated images`);
        
    } catch (error) {
        console.error('❌ Error saving JSON file:', error);
    }

    db.close();
});



















