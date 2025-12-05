/**
 * Script to fix CHEFTOP products to use real ETL images instead of placeholders
 * 
 * Usage: node fix-cheftop-images.js
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

// Load the database
let database;
try {
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    database = JSON.parse(databaseContent);
    console.log(`✅ Loaded database with ${database.products?.length || 0} products`);
} catch (error) {
    console.error('❌ Error loading database:', error.message);
    process.exit(1);
}

// Fix CHEFTOP products
function fixChefTopImages() {
    console.log('\n🔧 Fixing CHEFTOP product images...\n');
    
    let fixedCount = 0;
    
    database.products.forEach((product, index) => {
        const name = (product.name || '').toLowerCase();
        
        // Check if it's a CHEFTOP product with placeholder image
        if (name.includes('cheftop') && 
            product.imageUrl && 
            product.imageUrl.includes('placeholder.com')) {
            
            // Get real image from images array
            let images = [];
            if (product.images) {
                try {
                    images = typeof product.images === 'string' 
                        ? JSON.parse(product.images) 
                        : product.images;
                } catch (e) {
                    images = [];
                }
            }
            
            // Find first non-placeholder image
            const realImage = images.find(img => 
                img && 
                !img.includes('placeholder.com') && 
                !img.includes('via.placeholder')
            );
            
            if (realImage) {
                console.log(`📸 Fixing: ${product.name.substring(0, 60)}...`);
                console.log(`   Old: ${product.imageUrl}`);
                console.log(`   New: ${realImage}`);
                
                // Update imageUrl to use real image
                product.imageUrl = realImage;
                
                // Ensure images array has this as first image
                if (!images.includes(realImage)) {
                    images.unshift(realImage);
                }
                product.images = JSON.stringify(images);
                
                fixedCount++;
                console.log(`   ✅ Fixed\n`);
            } else {
                console.log(`⚠️  No real image found for: ${product.name.substring(0, 60)}...`);
            }
        }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Fixed: ${fixedCount} CHEFTOP products`);
    
    return fixedCount > 0;
}

// Main function
function main() {
    const hasChanges = fixChefTopImages();
    
    if (hasChanges) {
        // Create backup
        const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_cheftop_${Date.now()}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
        console.log(`\n💾 Created backup: ${path.basename(backupPath)}`);
        
        // Save updated database
        fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(database, null, 2));
        console.log(`\n✅ Database updated successfully!`);
        console.log(`   Total products: ${database.products.length}`);
    } else {
        console.log(`\n⚠️  No changes made. All CHEFTOP products may already have correct images.`);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { fixChefTopImages };






