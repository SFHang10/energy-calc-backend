const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🔄 UPDATING CARRIER PRODUCTS: Database first, then sync to JSON');
console.log('='.repeat(70));
console.log('');

// Wix URLs
const allGlassDoorUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
const antiReflectiveUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';

// Step 1: Update database
console.log('📊 STEP 1: Updating database...');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

db.serialize(() => {
    // Update "Carrier Refrigeration all glass door"
    db.run(
        `UPDATE products 
         SET imageUrl = ? 
         WHERE name = 'Carrier Refrigeration all glass door' 
         AND imageUrl = 'Product Placement/Motor.jpg'`,
        [allGlassDoorUrl],
        function(err) {
            if (err) {
                console.error('❌ Error updating all glass door:', err.message);
            } else {
                console.log(`✅ Updated "all glass door": ${this.changes} row(s)`);
            }
        }
    );

    // Update "Carrier Refrigeration anti-reflective all glass door"
    db.run(
        `UPDATE products 
         SET imageUrl = ? 
         WHERE name = 'Carrier Refrigeration anti-reflective all glass door' 
         AND imageUrl = 'Product Placement/Motor.jpg'`,
        [antiReflectiveUrl],
        function(err) {
            if (err) {
                console.error('❌ Error updating anti-reflective:', err.message);
            } else {
                console.log(`✅ Updated "anti-reflective": ${this.changes} row(s)`);
            }
        }
    );

    // Step 2: Sync from database to JSON (same pattern as safe_sync_images_to_json.js)
    db.all(`
        SELECT id, name, imageUrl
        FROM products 
        WHERE name = 'Carrier Refrigeration all glass door' 
        OR name = 'Carrier Refrigeration anti-reflective all glass door'
    `, (err, dbProducts) => {
        if (err) {
            console.error('❌ Database query error:', err.message);
            db.close();
            process.exit(1);
        }

        console.log(`\n📊 STEP 2: Syncing ${dbProducts.length} Carrier products to JSON...`);

        // Load JSON file (same pattern as safe_sync_images_to_json.js)
        let jsonData;
        try {
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');
            jsonData = JSON.parse(jsonContent);
            console.log(`✅ Loaded JSON file with ${jsonData.products.length} products`);
        } catch (error) {
            console.error('❌ Error loading JSON file:', error);
            db.close();
            process.exit(1);
        }

        // Create backup
        const backupPath = jsonPath + '.backup_' + Date.now();
        fs.copyFileSync(jsonPath, backupPath);
        console.log(`📦 Backup created: ${path.basename(backupPath)}\n`);

        let updatedCount = 0;
        let skippedCount = 0;

        // Sync Carrier products from database to JSON (ONLY imageUrl field)
        dbProducts.forEach(dbProduct => {
            const jsonProduct = jsonData.products.find(p => p.id === dbProduct.id);
            
            if (jsonProduct) {
                if (jsonProduct.imageUrl !== dbProduct.imageUrl) {
                    console.log(`✅ SYNCING: ${jsonProduct.name} (ID: ${jsonProduct.id})`);
                    console.log(`   Old JSON: ${jsonProduct.imageUrl}`);
                    console.log(`   New from DB: ${dbProduct.imageUrl}\n`);
                    // ONLY update imageUrl - preserve everything else
                    jsonProduct.imageUrl = dbProduct.imageUrl;
                    updatedCount++;
                } else {
                    skippedCount++;
                }
            } else {
                console.log(`⚠️  Product not found in JSON: ${dbProduct.name} (ID: ${dbProduct.id})`);
            }
        });

        if (updatedCount > 0) {
            // Save JSON file (same pattern as safe_sync_images_to_json.js)
            try {
                fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
                console.log(`\n📊 SYNC COMPLETE:`);
                console.log(`- ✅ Updated: ${updatedCount} products in JSON`);
                console.log(`- ⏭️  Skipped: ${skippedCount} products (already correct)`);
                console.log(`- 📄 JSON file saved successfully`);
                console.log(`\n🔄 Please restart the server to clear the cache and see updated images`);
            } catch (error) {
                console.error('❌ Error saving JSON file:', error);
                console.error(`⚠️  Backup available at: ${path.basename(backupPath)}`);
            }
        } else {
            console.log('\n⚠️  No Carrier products needed updating in JSON.');
        }

        db.close();
    });
});

