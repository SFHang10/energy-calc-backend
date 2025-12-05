/**
 * Script to update Tempest Hand Dryer product images
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

// Image mappings - product name patterns to image paths
const IMAGE_UPDATES = {
    'Tempest Polished Stainless Hand Dryer': {
        imagePath: 'product-placement/Tempest Polished Hand Drier.jpeg',
        fileName: 'Tempest Polished Hand Drier.jpeg'
    },
    'Tempest Satin': {
        imagePath: 'product-placement/Venyt Axia Tempest Satin.jpeg',
        fileName: 'Venyt Axia Tempest Satin.jpeg'
    },
    'Tempest Hand Dryer': {
        imagePath: 'product-placement/vent-axia-tempest Hand Drier.jpg',
        fileName: 'vent-axia-tempest Hand Drier.jpg'
    }
};

// Load database
let database;
try {
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    database = JSON.parse(databaseContent);
    console.log(`✅ Loaded database with ${database.products?.length || 0} products\n`);
} catch (error) {
    console.error('❌ Error loading database:', error.message);
    process.exit(1);
}

// Verify image files exist
console.log('🔍 Verifying image files exist...\n');
const productPlacementDir = path.join(__dirname, 'product-placement');
let allFilesExist = true;

Object.keys(IMAGE_UPDATES).forEach(productName => {
    const imageInfo = IMAGE_UPDATES[productName];
    const fullPath = path.join(productPlacementDir, imageInfo.fileName);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ Found: ${imageInfo.fileName}`);
    } else {
        console.log(`❌ NOT FOUND: ${imageInfo.fileName}`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n⚠️  Some image files are missing. Please check the file paths.');
    process.exit(1);
}

console.log('\n✅ All image files exist!\n');

// Update products
console.log('🔄 Updating product images...\n');
let updatedCount = 0;

database.products.forEach(product => {
    const productName = product.name || '';
    
    // Find matching product
    let match = null;
    for (const key in IMAGE_UPDATES) {
        if (productName.includes(key) || productName.toLowerCase().includes(key.toLowerCase())) {
            // More specific match for "Tempest Satin" - must include "Satin"
            if (key === 'Tempest Satin') {
                if (productName.toLowerCase().includes('satin')) {
                    match = IMAGE_UPDATES[key];
                    break;
                }
            }
            // More specific match for "Tempest Polished Stainless" - must include "Polished"
            else if (key === 'Tempest Polished Stainless Hand Dryer') {
                if (productName.toLowerCase().includes('polished')) {
                    match = IMAGE_UPDATES[key];
                    break;
                }
            }
            // Match for "Tempest Hand Dryer" - must NOT include "Polished" or "Satin"
            else if (key === 'Tempest Hand Dryer') {
                if (!productName.toLowerCase().includes('polished') && 
                    !productName.toLowerCase().includes('satin')) {
                    match = IMAGE_UPDATES[key];
                    break;
                }
            }
        }
    }
    
    if (match) {
        console.log(`📸 Updating: ${productName}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Old imageUrl: ${product.imageUrl || 'NONE'}`);
        
        // Update imageUrl
        product.imageUrl = match.imagePath;
        
        // Update images array
        let images = [];
        try {
            images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
        } catch (e) {
            images = [];
        }
        
        // Remove old images and add new one at the beginning
        images = [match.imagePath];
        product.images = JSON.stringify(images);
        
        console.log(`   New imageUrl: ${product.imageUrl}`);
        console.log(`   ✅ Updated successfully\n`);
        updatedCount++;
    }
});

if (updatedCount === 0) {
    console.log('⚠️  No matching products found. Searching for Tempest products...\n');
    const tempestProducts = database.products.filter(p => 
        p.name && p.name.toLowerCase().includes('tempest')
    );
    
    if (tempestProducts.length > 0) {
        console.log('Found Tempest products:');
        tempestProducts.forEach(p => {
            console.log(`  - ${p.id}: ${p.name}`);
        });
    } else {
        console.log('❌ No Tempest products found in database.');
    }
} else {
    // Create backup
    const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_tempest_images_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
    console.log(`💾 Created backup: ${path.basename(backupPath)}\n`);
    
    // Save updated database
    fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(database, null, 2));
    console.log(`✅ Database updated successfully!`);
    console.log(`   Updated ${updatedCount} product(s)`);
    console.log(`   Total products: ${database.products.length}`);
}






