/**
 * Script to fix incorrect image assignments for oven products
 * 
 * Usage: node fix-oven-images.js
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

// Product image fixes - mapping product IDs to correct image paths
const IMAGE_FIXES = {
    'oven_10': { // Electrolux EI30EF55QS 30" Single Wall Oven
        currentImage: 'Product Placement/Motor.jpg',
        correctImage: 'product-placement/Electrolux EI30EF55QS 30 Single Wall Oven.jpg',
        name: 'Electrolux EI30EF55QS 30" Single Wall Oven'
    },
    'oven_6': { // Frigidaire Gallery FGEW3065UF 30" Wall Oven
        currentImage: 'Product Placement/Motor.jpg',
        correctImage: 'product-placement/Frigidaire Gallery FGEW3065UF 30 Wall Oven.jpg',
        name: 'Frigidaire Gallery FGEW3065UF 30" Wall Oven'
    },
    'rest_oven_3': { // Garland GR6 6-Burner Gas Range
        currentImage: 'Product Placement/Food Services.jpeg',
        correctImage: 'product-placement/Oven.jpeg',
        name: 'Garland GR6 6-Burner Gas Range'
    },
    // Additional oven products with incorrect images
    'oven_2': { // GE Profile P2B940YPFS 30" Double Wall Oven
        currentImage: 'Product Placement/Motor.jpg',
        correctImage: 'product-placement/GE Profile P2B940YPFS 30 Double Wall Oven.jpeg',
        name: 'GE Profile P2B940YPFS 30" Double Wall Oven'
    },
    'oven_3': { // KitchenAid KODE500ESS 30" Double Wall Oven
        currentImage: 'Product Placement/Motor.jpg',
        correctImage: 'product-placement/KitchenAid KODE500ESS 30 Double Wall Oven.jpg',
        name: 'KitchenAid KODE500ESS 30" Double Wall Oven'
    },
    'oven_8': { // LG LDE4413ST 30" Double Wall Oven
        currentImage: 'Product Placement/Motor.jpg',
        correctImage: 'product-placement/LG LDE4413ST 30 Double Wall Oven.jpeg',
        name: 'LG LDE4413ST 30" Double Wall Oven'
    },
    'oven_5': { // Maytag MWO5105BZ 30" Single Wall Oven
        currentImage: 'Product Placement/Motor.jpg',
        correctImage: 'product-placement/Maytag MWO5105BZ 30 Single Wall Ovenjpg.jpg',
        name: 'Maytag MWO5105BZ 30" Single Wall Oven'
    },
    'oven_7': { // Samsung NE58K9430WS 30" Wall Oven
        currentImage: 'Product Placement/Motor.jpg',
        correctImage: 'product-placement/Samsung NE58K9430WS 30 Wall Oven.jpg',
        name: 'Samsung NE58K9430WS 30" Wall Oven'
    },
    'oven_4': { // Whirlpool WOD51HZES 30" Double Wall Oven
        currentImage: 'Product Placement/Motor.jpg',
        correctImage: 'product-placement/Whirlpool WOD51HZES 30 Double Wall Oven.jpg',
        name: 'Whirlpool WOD51HZES 30" Double Wall Oven'
    },
    'rest_oven_1': { // Vulcan VC4GD 4-Burner Gas Range
        currentImage: 'Product Placement/Food Services.jpeg',
        correctImage: 'product-placement/Oven.jpeg',
        name: 'Vulcan VC4GD 4-Burner Gas Range'
    },
    'rest_oven_2': { // Wolf CR3040 30" Gas Range
        currentImage: 'Product Placement/Food Services.jpeg',
        correctImage: 'product-placement/Oven.jpeg',
        name: 'Wolf CR3040 30" Gas Range'
    }
};

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

// Fix product images
function fixProductImages() {
    console.log('\n🔧 Starting image fix process...\n');
    
    let fixedCount = 0;
    let notFoundCount = 0;
    
    Object.keys(IMAGE_FIXES).forEach(productId => {
        const fix = IMAGE_FIXES[productId];
        const productIndex = database.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            console.log(`❌ Product not found: ${productId} - ${fix.name}`);
            notFoundCount++;
            return;
        }
        
        const product = database.products[productIndex];
        
        // Check if product has the incorrect image
        if (product.imageUrl === fix.currentImage || 
            product.imageUrl === `Product Placement/${path.basename(fix.currentImage)}` ||
            product.imageUrl === fix.currentImage.replace('Product Placement/', 'product-placement/')) {
            
            console.log(`\n📸 Fixing image for: ${fix.name}`);
            console.log(`   Current: ${product.imageUrl}`);
            console.log(`   New: ${fix.correctImage}`);
            
            // Update image URL
            product.imageUrl = fix.correctImage;
            
            // Also update images array if it exists
            if (product.images) {
                let images = [];
                try {
                    images = typeof product.images === 'string' 
                        ? JSON.parse(product.images) 
                        : product.images;
                } catch (e) {
                    images = [];
                }
                
                // Remove old incorrect image
                images = images.filter(img => 
                    !img.includes('Motor.jpg') && 
                    !img.includes('Food Services.jpeg')
                );
                
                // Add correct image if not already present
                if (!images.includes(fix.correctImage) && !images.includes(`/${fix.correctImage}`)) {
                    images.unshift(fix.correctImage); // Add to beginning
                }
                
                product.images = JSON.stringify(images);
            } else {
                // Create images array with correct image
                product.images = JSON.stringify([fix.correctImage]);
            }
            
            // Add metadata
            product.imageFixed = true;
            product.imageFixedDate = new Date().toISOString();
            
            fixedCount++;
            console.log(`   ✅ Image updated successfully`);
        } else {
            console.log(`\nℹ️  Product ${productId} already has different image: ${product.imageUrl}`);
        }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Fixed: ${fixedCount} products`);
    console.log(`   ❌ Not found: ${notFoundCount} products`);
    
    return fixedCount > 0;
}

// Main function
function main() {
    const hasChanges = fixProductImages();
    
    if (hasChanges) {
        // Create backup
        const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_images_${Date.now()}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
        console.log(`\n💾 Created backup: ${path.basename(backupPath)}`);
        
        // Save updated database
        fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(database, null, 2));
        console.log(`\n✅ Database updated successfully!`);
        console.log(`   Total products: ${database.products.length}`);
    } else {
        console.log(`\n⚠️  No changes made. All products may already have correct images.`);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { fixProductImages, IMAGE_FIXES };

