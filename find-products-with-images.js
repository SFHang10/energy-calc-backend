const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path - use same as product-widget.js
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');

console.log('🔍 Finding Products with Images...\n');
console.log('Database:', dbPath);

const db = new sqlite3.Database(dbPath);

// Find products with images
db.all(
    `SELECT id, name, brand, category, image_url 
     FROM products 
     WHERE image_url IS NOT NULL 
     AND image_url != '' 
     AND image_url != 'null'
     LIMIT 20`,
    (err, rows) => {
        if (err) {
            console.error('❌ Error:', err);
            db.close();
            return;
        }

        if (rows.length === 0) {
            console.log('❌ No products with images found in database');
            console.log('\n📋 Checking total products:');
            
            // Check total products
            db.all('SELECT COUNT(*) as total FROM products', (err, countRows) => {
                if (err) {
                    console.error('Error:', err);
                } else {
                    console.log(`   Total products: ${countRows[0].total}`);
                }
                
                // Check products with null/empty image_url
                db.all(
                    `SELECT COUNT(*) as total FROM products 
                     WHERE image_url IS NULL OR image_url = '' OR image_url = 'null'`,
                    (err, nullRows) => {
                        if (err) {
                            console.error('Error:', err);
                        } else {
                            console.log(`   Products without images: ${nullRows[0].total}`);
                        }
                        db.close();
                    }
                );
            });
            return;
        }

        console.log(`✅ Found ${rows.length} products with images:\n`);
        
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   Brand: ${row.brand || 'Unknown'}`);
            console.log(`   Category: ${row.category || 'Unknown'}`);
            console.log(`   ID: ${row.id}`);
            
            // Show first 80 chars of image URL
            const imgUrl = row.image_url || '';
            if (imgUrl.length > 80) {
                console.log(`   Image: ${imgUrl.substring(0, 80)}...`);
            } else {
                console.log(`   Image: ${imgUrl}`);
            }
            console.log('');
        });

        console.log(`\n💡 Test URL examples:\n`);
        rows.slice(0, 5).forEach((row) => {
            console.log(`   http://localhost:4000/product-page-v2.html?product=${row.id}`);
        });

        db.close();
    }
);







