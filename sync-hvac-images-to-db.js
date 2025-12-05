const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database paths
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const hvacImagePath = 'Product Placement/HVAC Main.jpeg';

console.log('\n🔄 SYNCING HVAC IMAGES FROM JSON TO DATABASE');
console.log('='.repeat(70));
console.log('');

// Load JSON data
console.log('📂 Loading JSON file...');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`✅ Loaded ${jsonData.products.length} products from JSON\n`);

// Find HVAC products with HVAC Main.jpeg in JSON
const hvacProductsMap = new Map();
jsonData.products.forEach(product => {
    if (product.id && product.imageUrl === hvacImagePath) {
        hvacProductsMap.set(product.id, hvacImagePath);
    }
});

console.log(`✅ Found ${hvacProductsMap.size} HVAC products with HVAC Main.jpeg in JSON\n`);

// Open database
const db = new sqlite3.Database(dbPath);

// Find products in database that need HVAC image update
db.all(
    `SELECT id, name, category, subcategory, image_url 
     FROM products 
     WHERE (name LIKE '%BTwin%' 
     OR name LIKE '%VLT%' 
     OR name LIKE '%HVAC%' 
     OR name LIKE '%Frenic%'
     OR name LIKE '%Optidrive%'
     OR brand LIKE '%Reznor%'
     OR brand LIKE '%Nortek%'
     OR brand LIKE '%Danfoss%'
     OR subcategory LIKE '%HVAC%'
     OR category LIKE '%HVAC%')
     AND (image_url IS NULL 
     OR image_url = '' 
     OR image_url = 'null'
     OR image_url LIKE '%Motor.jpg%'
     OR image_url LIKE '%Motor.jpeg%')`,
    (err, dbProducts) => {
        if (err) {
            console.error('❌ Database error:', err);
            db.close();
            return;
        }

        console.log(`📊 Found ${dbProducts.length} HVAC products in database that may need update\n`);

        if (dbProducts.length === 0) {
            console.log('✅ All HVAC products already have correct images!\n');
            db.close();
            return;
        }

        // Update products
        let updated = 0;
        let notFound = 0;
        let processed = 0;

        function updateNext() {
            if (processed >= dbProducts.length) {
                // All done
                console.log('\n📊 SYNC RESULTS:');
                console.log(`   ✅ Updated: ${updated} products`);
                console.log(`   ❌ Not found in JSON: ${notFound} products`);
                console.log(`   📊 Total checked: ${dbProducts.length} products\n`);

                // Verify results
                db.all(
                    `SELECT COUNT(*) as total 
                     FROM products 
                     WHERE image_url = ?`,
                    [hvacImagePath],
                    (err, result) => {
                        if (!err) {
                            console.log(`✅ Total products with HVAC Main.jpeg: ${result[0].total}\n`);
                        }

                        db.close();
                    }
                );
                return;
            }

            const dbProduct = dbProducts[processed];
            
            // Check if product is in JSON with HVAC image
            if (hvacProductsMap.has(dbProduct.id)) {
                // Update database with HVAC image
                db.run(
                    `UPDATE products 
                     SET image_url = ? 
                     WHERE id = ?`,
                    [hvacImagePath, dbProduct.id],
                    (err) => {
                        if (err) {
                            console.error(`❌ Error updating ${dbProduct.id}:`, err);
                        } else {
                            updated++;
                            if (processed < 10) {
                                console.log(`   ✅ ${dbProduct.id}: ${dbProduct.name.substring(0, 50)}...`);
                                console.log(`      Image: ${hvacImagePath}`);
                            }
                        }

                        processed++;
                        updateNext();
                    }
                );
            } else {
                // Check if it should be HVAC based on name/brand
                const name = (dbProduct.name || '').toLowerCase();
                const brand = (dbProduct.brand || '').toLowerCase();
                const subcategory = (dbProduct.subcategory || '').toLowerCase();
                
                const isHVAC = name.includes('btwin') || 
                             name.includes('vlt') || 
                             name.includes('hvac') ||
                             name.includes('frenic') ||
                             name.includes('optidrive') ||
                             brand.includes('reznor') ||
                             brand.includes('nortek') ||
                             subcategory.includes('hvac');
                
                if (isHVAC) {
                    // Update even if not in JSON (might be new product)
                    db.run(
                        `UPDATE products 
                         SET image_url = ? 
                         WHERE id = ?`,
                        [hvacImagePath, dbProduct.id],
                        (err) => {
                            if (err) {
                                console.error(`❌ Error updating ${dbProduct.id}:`, err);
                            } else {
                                updated++;
                                if (processed < 10) {
                                    console.log(`   ✅ ${dbProduct.id}: ${dbProduct.name.substring(0, 50)}... (HVAC detected)`);
                                    console.log(`      Image: ${hvacImagePath}`);
                                }
                            }

                            processed++;
                            updateNext();
                        }
                    );
                } else {
                    notFound++;
                    processed++;
                    updateNext();
                }
            }
        }

        // Start processing
        console.log('🔄 Updating HVAC products in database...\n');
        updateNext();
    }
);







