/**
 * Script to update ATHEN XL refrigerator product images
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

// Image mappings - product name patterns to image paths
const IMAGE_UPDATES = {
    'ATHEN XL 175': {
        imagePath: 'product-placement/ATHEN XL 175 (-) LDHF.jpeg',
        fileName: 'ATHEN XL 175 (-) LDHF.jpeg',
        keywords: ['175', 'ATHEN XL 175']
    },
    'ATHEN XL 250': {
        imagePath: 'product-placement/AHT-Athens-250-XL-Eco.jpg',
        fileName: 'AHT-Athens-250-XL-Eco.jpg',
        keywords: ['250', 'ATHEN XL 250']
    },
    'ATHEN XL 250 (-) LDHF by AHT': {
        imagePath: 'product-placement/ATHEN XL 250 (-) LDHF by AHT Cooling Systems GmbH.jpeg',
        fileName: 'ATHEN XL 250 (-) LDHF by AHT Cooling Systems GmbH.jpeg',
        keywords: ['250', 'LDHF', 'AHT Cooling Systems']
    },
    'ATHEN XL 210': {
        imagePath: 'product-placement/ATHEN XL 210 (-) LDHF by AHT Cooling Systems GmbH.jpeg',
        fileName: 'ATHEN XL 210 (-) LDHF by AHT Cooling Systems GmbH.jpeg',
        keywords: ['210', 'LDHF', 'AHT Cooling Systems']
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

Object.keys(IMAGE_UPDATES).forEach(key => {
    const imageInfo = IMAGE_UPDATES[key];
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
    const productName = (product.name || '').toLowerCase();
    
    // Find matching product - check each update rule
    let match = null;
    
    // Check for ATHEN XL 210 (most specific)
    if (productName.includes('athen xl 210') && productName.includes('ldhf')) {
        match = IMAGE_UPDATES['ATHEN XL 210'];
    }
    // Check for ATHEN XL 250 with full name
    else if (productName.includes('athen xl 250') && productName.includes('ldhf') && productName.includes('aht cooling systems')) {
        match = IMAGE_UPDATES['ATHEN XL 250 (-) LDHF by AHT'];
    }
    // Check for ATHEN XL 250 (generic)
    else if (productName.includes('athen xl 250') && !productName.includes('ldhf')) {
        match = IMAGE_UPDATES['ATHEN XL 250'];
    }
    // Check for ATHEN XL 175
    else if (productName.includes('athen xl 175')) {
        match = IMAGE_UPDATES['ATHEN XL 175'];
    }
    // Check for ATHEN XL EC 207 (use 210 image as placeholder until specific image available)
    else if (productName.includes('athen xl ec 207')) {
        // Use 210 image as they're similar models
        match = IMAGE_UPDATES['ATHEN XL 210'];
    }
    
    if (match) {
        console.log(`📸 Updating: ${product.name}`);
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
    console.log('⚠️  No matching products found. Searching for ATHEN products...\n');
    const athenProducts = database.products.filter(p => 
        p.name && p.name.toLowerCase().includes('athen')
    );
    
    if (athenProducts.length > 0) {
        console.log('Found ATHEN products:');
        athenProducts.forEach(p => {
            console.log(`  - ${p.id}: ${p.name}`);
        });
    } else {
        console.log('❌ No ATHEN products found in database.');
    }
} else {
    // Create backup
    const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_athen_images_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
    console.log(`💾 Created backup: ${path.basename(backupPath)}\n`);
    
    // Save updated database
    fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(database, null, 2));
    console.log(`✅ Database updated successfully!`);
    console.log(`   Updated ${updatedCount} product(s)`);
    console.log(`   Total products: ${database.products.length}`);
}

