const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// EXACT pattern from safe_sync_images_to_json.js - this is the WORKING method
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🔄 FIXING CARRIER PRODUCTS - Using WORKING pattern from safe_sync_images_to_json.js');
console.log('='.repeat(70));
console.log('');

// Step 1: Update database first
console.log('📊 STEP 1: Updating database...');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

// Update Carrier products in database
db.serialize(() => {
    const allGlassUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
    const antiReflectiveUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';

    // Update "all glass door"
    db.run(
        `UPDATE products SET imageUrl = ? WHERE name = 'Carrier Refrigeration all glass door' AND imageUrl = 'Product Placement/Motor.jpg'`,
        [allGlassUrl],
        function(err) {
            if (err) {
                console.error('❌ Error:', err.message);
            } else {
                console.log(`✅ Updated "all glass door": ${this.changes} row(s)`);
            }
        }
    );

    // Update "anti-reflective"
    db.run(
        `UPDATE products SET imageUrl = ? WHERE name = 'Carrier Refrigeration anti-reflective all glass door' AND imageUrl = 'Product Placement/Motor.jpg'`,
        [antiReflectiveUrl],
        function(err) {
            if (err) {
                console.error('❌ Error:', err.message);
            } else {
                console.log(`✅ Updated "anti-reflective": ${this.changes} row(s)\n`);
            }
        }
    );

    // Step 2: Sync from database to JSON (EXACT pattern from safe_sync_images_to_json.js)
    db.all(`
        SELECT id, name, imageUrl
        FROM products 
        WHERE name = 'Carrier Refrigeration all glass door' 
        OR name = 'Carrier Refrigeration anti-reflective all glass door'
    `, (err, dbProducts) => {
        if (err) {
            console.error('❌ Database error:', err);
            db.close();
            return;
        }

        console.log(`📊 STEP 2: Syncing ${dbProducts.length} Carrier products to JSON...\n`);

        // Load JSON file (EXACT pattern from safe_sync_images_to_json.js)
        let jsonData;
        try {
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');
            jsonData = JSON.parse(jsonContent);
            console.log(`📄 Loaded JSON file with ${jsonData.products.length} products`);
        } catch (error) {
            console.error('❌ Error loading JSON file:', error);
            db.close();
            process.exit(1);
        }

        let updatedCount = 0;
        let skippedCount = 0;
        let notFoundCount = 0;

        // SAFELY update JSON products with database images (EXACT pattern)
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
                    skippedCount++;
                }
            } else {
                console.log(`⚠️ Product not found in JSON: ${dbProduct.name}`);
                notFoundCount++;
            }
        });

        // Save updated JSON file (EXACT pattern from safe_sync_images_to_json.js)
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
});

