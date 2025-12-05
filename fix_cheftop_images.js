const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding placeholder images for products with external URLs...');

// Products that need placeholder images (based on what we see in the preview)
const productsToUpdate = [
    {
        name: 'CHEFTOP MIND.Maps™ PLUS COUNTERTOP Electrical Combi-Steam Professional Oven',
        brand: 'UNOX UK LIMITED',
        placeholderUrl: 'http://localhost:4000/product-images/placeholder-cheftop-oven.jpg'
    }
];

// Create a simple placeholder image for CHEFTOP products
const placeholderImages = {
    'CHEFTOP': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=CHEFTOP+Professional+Oven',
    'UNOX': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=UNOX+Professional+Equipment'
};

// Function to update product with placeholder image
function updateProductWithPlaceholder(product) {
    return new Promise((resolve, reject) => {
        // Find products by name and brand
        db.all(`
            SELECT id, name, brand, imageUrl 
            FROM products 
            WHERE name LIKE ? AND brand = ?
        `, [`%${product.name}%`, product.brand], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            if (rows.length === 0) {
                console.log(`⚠️  No products found for: ${product.name} (${product.brand})`);
                resolve();
                return;
            }

            // Update each matching product
            let updateCount = 0;
            rows.forEach((row, index) => {
                const placeholderUrl = placeholderImages[product.brand] || placeholderImages['CHEFTOP'];
                
                db.run(
                    `UPDATE products SET imageUrl = ? WHERE id = ?`,
                    [placeholderUrl, row.id],
                    function(err) {
                        if (err) {
                            console.error(`❌ Error updating product ${row.id}:`, err);
                        } else {
                            console.log(`✅ Updated ${product.name} (${product.brand}) - Row ${index + 1}`);
                            updateCount++;
                        }
                        
                        // Resolve when all updates are done
                        if (updateCount === rows.length) {
                            resolve();
                        }
                    }
                );
            });
        });
    });
}

// Process all products
async function processProducts() {
    try {
        for (const product of productsToUpdate) {
            await updateProductWithPlaceholder(product);
        }
        
        console.log('\n🎯 CHEFTOP Products Status After Update:');
        
        // Check final status
        db.all(`
            SELECT name, brand, imageUrl 
            FROM products 
            WHERE name LIKE '%CHEFTOP%'
            ORDER BY name
        `, (err, rows) => {
            if (err) {
                console.error('❌ Error checking status:', err);
            } else {
                console.log(`\n📋 Found ${rows.length} CHEFTOP products:`);
                rows.forEach((row, index) => {
                    const hasImage = row.imageUrl ? '✅ HAS IMAGE' : '❌ NO IMAGE';
                    console.log(`${index + 1}. ${row.name} - ${hasImage}`);
                    if (row.imageUrl) {
                        console.log(`   URL: ${row.imageUrl}`);
                    }
                });
            }
            
            db.close();
            console.log('\n✅ SUCCESS! CHEFTOP products now have placeholder images.');
            console.log('   Test: http://localhost:4000/category-product-page.html?category=professional-foodservice');
        });
        
    } catch (error) {
        console.error('❌ Error processing products:', error);
        db.close();
    }
}

processProducts();



















