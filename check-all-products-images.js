const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');

console.log('🔍 Checking All Products for Images...\n');

const db = new sqlite3.Database(dbPath);

// Count total products
db.get('SELECT COUNT(*) as total FROM products', (err, totalRow) => {
    if (err) {
        console.error('❌ Error:', err);
        db.close();
        return;
    }

    const totalProducts = totalRow.total;
    console.log(`📊 Total products in database: ${totalProducts}\n`);

    // Count products WITH images
    db.get(
        `SELECT COUNT(*) as total 
         FROM products 
         WHERE image_url IS NOT NULL 
         AND image_url != '' 
         AND image_url != 'null'`,
        (err, withImagesRow) => {
            if (err) {
                console.error('❌ Error:', err);
                db.close();
                return;
            }

            const withImages = withImagesRow.total;
            console.log(`✅ Products WITH images: ${withImages}`);

            // Count products WITHOUT images
            db.get(
                `SELECT COUNT(*) as total 
                 FROM products 
                 WHERE image_url IS NULL 
                 OR image_url = '' 
                 OR image_url = 'null'`,
                (err, withoutImagesRow) => {
                    if (err) {
                        console.error('❌ Error:', err);
                        db.close();
                        return;
                    }

                    const withoutImages = withoutImagesRow.total;
                    console.log(`❌ Products WITHOUT images: ${withoutImages}\n`);

                    if (withoutImages > 0) {
                        console.log('⚠️  Products missing images:\n');
                        
                        // Show first 10 products without images
                        db.all(
                            `SELECT id, name, brand, category 
                             FROM products 
                             WHERE image_url IS NULL 
                             OR image_url = '' 
                             OR image_url = 'null'
                             LIMIT 10`,
                            (err, rows) => {
                                if (err) {
                                    console.error('Error:', err);
                                } else {
                                    rows.forEach((row, index) => {
                                        console.log(`${index + 1}. ${row.name}`);
                                        console.log(`   ID: ${row.id}`);
                                        console.log(`   Brand: ${row.brand || 'Unknown'}`);
                                        console.log(`   Category: ${row.category || 'Unknown'}`);
                                        console.log('');
                                    });
                                    
                                    if (withoutImages > 10) {
                                        console.log(`   ... and ${withoutImages - 10} more\n`);
                                    }
                                }
                                
                                console.log('\n💡 To fix: Check if placeholder images were assigned during Saturday\'s work');
                                console.log('   Or check if there\'s a script that assigns placeholders to products\n');
                                
                                db.close();
                            }
                        );
                    } else {
                        console.log('✅ Perfect! All products have images assigned!\n');
                        db.close();
                    }
                }
            );
        }
    );
});







