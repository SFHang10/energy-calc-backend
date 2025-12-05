const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🖼️ ADDING PLACEHOLDER IMAGES FOR MISSING PRODUCTS\n');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DB_PATH = path.join(__dirname, 'database', 'energy_calculator_central.db');

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function addPlaceholderImages() {
    try {
        console.log('📋 Connecting to database...');
        const db = new sqlite3.Database(DB_PATH);
        
        return new Promise((resolve, reject) => {
            // Get all professional foodservice products without images
            const query = `
                SELECT id, name, brand, category
                FROM products 
                WHERE category = 'professional-foodservice'
                AND (imageUrl IS NULL OR imageUrl = '' OR imageUrl = 'NO IMAGE')
                ORDER BY brand, name
            `;
            
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log(`🔍 Found ${rows.length} products without images`);
                
                if (rows.length === 0) {
                    console.log('✅ All products already have images!');
                    db.close();
                    resolve({ updated: 0 });
                    return;
                }
                
                // Update each product with a placeholder image
                let updated = 0;
                let completed = 0;
                
                rows.forEach((product, index) => {
                    // Create a placeholder image URL based on the product
                    const placeholderUrl = `https://via.placeholder.com/300x200/f8f9fa/6c757d?text=${encodeURIComponent(product.brand + ' ' + product.name.split(' ')[0])}`;
                    
                    const updateQuery = `
                        UPDATE products 
                        SET imageUrl = ?
                        WHERE id = ?
                    `;
                    
                    db.run(updateQuery, [placeholderUrl, product.id], function(err) {
                        if (err) {
                            console.error(`❌ Error updating ${product.name}:`, err.message);
                        } else {
                            updated++;
                            console.log(`✅ Updated: ${product.name} (${product.brand})`);
                        }
                        
                        completed++;
                        if (completed === rows.length) {
                            console.log(`\n🎉 COMPLETE! Updated ${updated} products with placeholder images`);
                            db.close();
                            resolve({ updated });
                        }
                    });
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error adding placeholder images:', error);
        return { updated: 0, error: error.message };
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    try {
        console.log('🚀 Starting Placeholder Image Addition...\n');
        
        const result = await addPlaceholderImages();
        
        if (result.error) {
            console.log('\n❌ OPERATION FAILED!');
            console.log(`   Error: ${result.error}`);
        } else {
            console.log('\n✅ OPERATION COMPLETE!');
            console.log(`   Products updated: ${result.updated}`);
            console.log('\n📝 Next steps:');
            console.log('1. Restart the server to clear cache');
            console.log('2. Test the professional-foodservice page');
            console.log('3. Verify flashing is reduced');
        }
        
    } catch (error) {
        console.error('❌ Error during placeholder image addition:', error);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    addPlaceholderImages
};



















