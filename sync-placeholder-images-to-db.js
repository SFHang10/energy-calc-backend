const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database paths
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('\n🔄 SYNCING PLACEHOLDER IMAGES FROM JSON TO DATABASE');
console.log('='.repeat(70));
console.log('');

// Check if JSON file exists
if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found: ${jsonPath}`);
    console.log('\n💡 Make sure FULL-DATABASE-5554.json exists in the project root');
    process.exit(1);
}

// Load JSON data
console.log('📂 Loading JSON file...');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`✅ Loaded ${jsonData.products.length} products from JSON\n`);

// Open database
console.log('📂 Opening database...');
const db = new sqlite3.Database(dbPath);

// Create a map of products from JSON (for quick lookup)
const jsonProducts = new Map();
jsonData.products.forEach(product => {
    if (product.id && product.imageUrl) {
        jsonProducts.set(product.id, product.imageUrl);
    }
});

console.log(`✅ Found ${jsonProducts.size} products with images in JSON\n`);

// Find products in database that need images
db.all(
    `SELECT id, name, category, image_url 
     FROM products 
     WHERE image_url IS NULL 
     OR image_url = '' 
     OR image_url = 'null'`,
    (err, dbProducts) => {
        if (err) {
            console.error('❌ Database error:', err);
            db.close();
            return;
        }

        console.log(`📊 Found ${dbProducts.length} products in database without images\n`);

        if (dbProducts.length === 0) {
            console.log('✅ All products in database already have images!\n');
            db.close();
            return;
        }

        // Match and update products
        let updated = 0;
        let notFound = 0;

        console.log('🔄 Syncing images from JSON to database...\n');

        // Process products sequentially
        let currentIndex = 0;

        function updateNext() {
            if (currentIndex >= dbProducts.length) {
                // All done - show results
                console.log('\n📊 SYNC RESULTS:');
                console.log(`   ✅ Updated: ${updated} products`);
                console.log(`   ❌ Not found in JSON: ${notFound} products`);
                console.log(`   📊 Total checked: ${dbProducts.length} products\n`);

                // Verify results
                db.all(
                    `SELECT COUNT(*) as total 
                     FROM products 
                     WHERE image_url IS NOT NULL 
                     AND image_url != '' 
                     AND image_url != 'null'`,
                    (err, result) => {
                        if (!err) {
                            console.log(`✅ Total products with images: ${result[0].total}`);
                        }

                        // Check remaining without images
                        db.all(
                            `SELECT COUNT(*) as total 
                             FROM products 
                             WHERE image_url IS NULL 
                             OR image_url = '' 
                             OR image_url = 'null'`,
                            (err, remaining) => {
                                if (!err) {
                                    console.log(`❌ Products still without images: ${remaining[0].total}\n`);
                                }

                                if (remaining && remaining[0].total === 0) {
                                    console.log('🎉 SUCCESS! All products now have images!\n');
                                } else if (remaining) {
                                    console.log(`⚠️  ${remaining[0].total} products still need images`);
                                    console.log('   (These may be products not in JSON file)\n');
                                }

                                db.close();
                            }
                        );
                    }
                );
                return;
            }

            const dbProduct = dbProducts[currentIndex];
            const jsonImageUrl = jsonProducts.get(dbProduct.id);

            if (jsonImageUrl && jsonImageUrl.trim() !== '') {
                // Update database with image from JSON
                db.run(
                    `UPDATE products 
                     SET image_url = ? 
                     WHERE id = ?`,
                    [jsonImageUrl, dbProduct.id],
                    (err) => {
                        if (err) {
                            console.error(`❌ Error updating ${dbProduct.id}:`, err);
                        } else {
                            updated++;
                            if (currentIndex < 10) {
                                console.log(`   ✅ ${dbProduct.id}: ${dbProduct.name.substring(0, 50)}...`);
                                const displayUrl = jsonImageUrl.length > 60 ? jsonImageUrl.substring(0, 60) + '...' : jsonImageUrl;
                                console.log(`      Image: ${displayUrl}`);
                            }
                        }

                        currentIndex++;
                        updateNext(); // Process next product
                    }
                );
            } else {
                notFound++;
                if (currentIndex < 10) {
                    console.log(`   ⚠️  ${dbProduct.id}: ${dbProduct.name.substring(0, 50)}... - No image in JSON`);
                }

                currentIndex++;
                updateNext(); // Process next product
            }
        }

        // Start processing
        updateNext();
    }
);

