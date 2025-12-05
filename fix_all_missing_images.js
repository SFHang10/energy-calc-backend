const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding placeholder images for ALL products without working images...');

// Function to add placeholder images for products without images
function addPlaceholderImages() {
    return new Promise((resolve, reject) => {
        // Find all products in professional-foodservice category without images
        db.all(`
            SELECT id, name, brand, imageUrl 
            FROM products 
            WHERE category = 'professional-foodservice' 
            AND (imageUrl IS NULL OR imageUrl = '' OR imageUrl LIKE '%etl.energysecurity.gov.uk%')
            ORDER BY brand, name
        `, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            if (rows.length === 0) {
                console.log('✅ All products already have images!');
                resolve();
                return;
            }

            console.log(`📋 Found ${rows.length} products that need placeholder images:`);
            
            let updateCount = 0;
            rows.forEach((row, index) => {
                // Create a brand-specific placeholder
                const brandPlaceholders = {
                    'Electrolux': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Electrolux+Professional',
                    'Bosch': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Bosch+Professional',
                    'UNOX': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=UNOX+Professional',
                    'CHEFTOP': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=CHEFTOP+Professional',
                    'Frigidaire': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Frigidaire+Professional',
                    'GE': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=GE+Professional',
                    'Hisense': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Hisense+Professional',
                    'KitchenAid': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=KitchenAid+Professional',
                    'LG': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=LG+Professional',
                    'Maytag': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Maytag+Professional',
                    'Samsung': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Samsung+Professional',
                    'Whirlpool': 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Whirlpool+Professional'
                };
                
                const placeholderUrl = brandPlaceholders[row.brand] || 
                                    'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=Professional+Equipment';
                
                db.run(
                    `UPDATE products SET imageUrl = ? WHERE id = ?`,
                    [placeholderUrl, row.id],
                    function(err) {
                        if (err) {
                            console.error(`❌ Error updating product ${row.id}:`, err);
                        } else {
                            console.log(`✅ Added placeholder for: ${row.name} (${row.brand})`);
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
        await addPlaceholderImages();
        
        console.log('\n🎯 Final Professional Foodservice Products Status:');
        
        // Check final status
        db.all(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN imageUrl IS NOT NULL AND imageUrl != '' THEN 1 ELSE 0 END) as with_images
            FROM products 
            WHERE category = 'professional-foodservice'
        `, (err, rows) => {
            if (err) {
                console.error('❌ Error checking status:', err);
            } else {
                const stats = rows[0];
                console.log(`   Total products: ${stats.total}`);
                console.log(`   Products with images: ${stats.with_images}`);
                console.log(`   Products without images: ${stats.total - stats.with_images}`);
                
                if (stats.total - stats.with_images === 0) {
                    console.log('\n🎉 SUCCESS! All products now have images - no more flashing!');
                } else {
                    console.log(`\n⚠️  Still ${stats.total - stats.with_images} products without images`);
                }
            }
            
            db.close();
            console.log('\n🌐 Test the preview page:');
            console.log('   http://localhost:4000/category-product-page.html?category=professional-foodservice');
        });
        
    } catch (error) {
        console.error('❌ Error processing products:', error);
        db.close();
    }
}

processProducts();



















