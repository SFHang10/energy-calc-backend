const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Analyzing Category Image Assignments...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// First, check database schema
console.log('📋 Checking database schema...\n');

db.all("PRAGMA table_info(products)", (err, columns) => {
    if (err) {
        console.error('❌ Error getting schema:', err);
        db.close();
        return;
    }

    console.log('Available columns:');
    columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
    });
    console.log('');

    // Now check for products with Motor images in Heat Pumps category
    console.log('📊 Checking for Motor images in Heat Pumps category...\n');

    db.all(`
        SELECT name, brand, category, subcategory, image_url
        FROM products 
        WHERE (category LIKE '%Heat Pump%' OR category LIKE '%heat pump%' 
               OR subcategory LIKE '%Heat Pump%' OR name LIKE '%Heat Pump%'
               OR name LIKE '%Altherma%' OR name LIKE '%Auriga%' 
               OR name LIKE '%Vitocal%' OR name LIKE '%Compress%')
        AND (
            image_url LIKE '%Motor%' OR 
            image_url LIKE '%motor%'
        )
        ORDER BY name
        LIMIT 50
    `, (err, heatPumpProductsWithMotorImages) => {
        if (err) {
            console.error('❌ Error:', err);
            db.close();
            return;
        }

        console.log(`✅ Found ${heatPumpProductsWithMotorImages.length} Heat Pump products with Motor images:\n`);
        
        if (heatPumpProductsWithMotorImages.length > 0) {
            heatPumpProductsWithMotorImages.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Brand: ${product.brand}`);
                console.log(`   Category: ${product.category || 'N/A'}`);
                console.log(`   Subcategory: ${product.subcategory || 'N/A'}`);
                console.log(`   Image URL: ${(product.image_url || 'N/A').substring(0, 100)}...`);
                console.log('');
            });
        } else {
            console.log('✅ No Heat Pump products found with Motor images\n');
        }

        // Now check Motor Drives category
        console.log('\n📊 Checking Motor Drives category products...\n');

        db.all(`
            SELECT name, brand, category, subcategory, image_url
            FROM products 
            WHERE (category LIKE '%Motor%' OR category LIKE '%Drive%' 
                   OR subcategory LIKE '%Motor%' OR subcategory LIKE '%Drive%'
                   OR name LIKE '%Drive%' OR name LIKE '%Motor%'
                   OR name LIKE '%VLT%' OR name LIKE '%ACS%' OR name LIKE '%Frenic%')
            ORDER BY name
            LIMIT 50
        `, (err, motorDriveProducts) => {
            if (err) {
                console.error('❌ Error:', err);
                db.close();
                return;
            }

            console.log(`✅ Found ${motorDriveProducts.length} Motor Drive products:\n`);
            
            // Group by image
            const imageGroups = {};
            motorDriveProducts.forEach(product => {
                const imgUrl = product.image_url || 'NO IMAGE';
                if (!imageGroups[imgUrl]) {
                    imageGroups[imgUrl] = [];
                }
                imageGroups[imgUrl].push(product);
            });

            console.log('📸 Image Usage Analysis:\n');
            Object.entries(imageGroups).forEach(([imgUrl, products]) => {
                const shortUrl = imgUrl.length > 80 ? imgUrl.substring(0, 80) + '...' : imgUrl;
                console.log(`Image: ${shortUrl}`);
                console.log(`   Used by ${products.length} products:`);
                products.slice(0, 5).forEach(p => {
                    console.log(`   - ${p.name} (${p.brand}) - Category: ${p.category || 'N/A'}`);
                });
                if (products.length > 5) {
                    console.log(`   ... and ${products.length - 5} more`);
                }
                console.log('');
            });

            // Find the Motor image that's appearing in both categories
            console.log('\n🔗 Finding shared Motor images...\n');
            
            const motorImageUrl = 'Product Placement/Motor.jpg';
            const motorImageUrl2 = 'Product Placement/Motor.jpeg';
            
            db.all(`
                SELECT name, brand, category, subcategory, image_url
                FROM products 
                WHERE (image_url LIKE '%Motor.jpg' OR image_url LIKE '%Motor.jpeg')
                ORDER BY category, name
                LIMIT 100
            `, (err, allProductsWithMotorImages) => {
                if (err) {
                    console.error('❌ Error:', err);
                    db.close();
                    return;
                }

                if (allProductsWithMotorImages.length > 0) {
                    console.log(`⚠️  Found ${allProductsWithMotorImages.length} products using Motor images:\n`);
                    
                    // Group by category
                    const byCategory = {};
                    allProductsWithMotorImages.forEach(product => {
                        const cat = product.category || 'UNKNOWN';
                        if (!byCategory[cat]) {
                            byCategory[cat] = [];
                        }
                        byCategory[cat].push(product);
                    });

                    Object.entries(byCategory).forEach(([category, products]) => {
                        console.log(`\n📁 Category: ${category} (${products.length} products)`);
                        products.slice(0, 10).forEach(p => {
                            console.log(`   - ${p.name} (${p.brand})`);
                        });
                        if (products.length > 10) {
                            console.log(`   ... and ${products.length - 10} more`);
                        }
                    });
                }

                db.close();
                console.log('\n✅ Analysis complete!');
            });
        });
    });
});
