/**
 * Fix Carrier Refrigeration product images
 * Changes Motor.jpg to correct commercial refrigeration image
 * 
 * Usage: node fix-carrier-refrigeration-images.js
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const CORRECT_IMAGE = 'Product Placement/Cm Fridge.jpeg'; // From assign-placeholders-to-remaining.js

console.log('\n🔧 FIXING CARRIER REFRIGERATION PRODUCT IMAGES');
console.log('='.repeat(70));
console.log('');

// Load database
let database;
try {
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    database = JSON.parse(databaseContent);
    console.log(`✅ Loaded database with ${database.products?.length || 0} products`);
} catch (error) {
    console.error('❌ Error loading database:', error.message);
    process.exit(1);
}

// Find Carrier products with Motor.jpg
const carrierProductsToFix = database.products.filter(p => 
    p.brand && p.brand.includes('Carrier') &&
    p.imageUrl && (
        p.imageUrl.includes('Motor.jpg') || 
        p.imageUrl.includes('Motor.jpeg') ||
        p.imageUrl === 'Product Placement/Motor.jpg'
    )
);

console.log(`\n📦 Found ${carrierProductsToFix.length} Carrier products with Motor.jpg\n`);

if (carrierProductsToFix.length === 0) {
    console.log('✅ No Carrier products need fixing!\n');
    process.exit(0);
}

// Show sample products
console.log('🔍 Sample products to fix:');
carrierProductsToFix.slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.id}: ${p.name}`);
    console.log(`      Current: ${p.imageUrl}`);
    console.log(`      Will be: ${CORRECT_IMAGE}`);
});

// Fix products
let fixedCount = 0;
carrierProductsToFix.forEach(product => {
    const oldImage = product.imageUrl;
    product.imageUrl = CORRECT_IMAGE;
    
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
        
        // Remove Motor images
        images = images.filter(img => 
            !img.includes('Motor.jpg') && 
            !img.includes('Motor.jpeg')
        );
        
        // Add correct image if not already present
        if (!images.includes(CORRECT_IMAGE) && !images.includes(`/${CORRECT_IMAGE}`)) {
            images.unshift(CORRECT_IMAGE);
        }
        
        product.images = JSON.stringify(images);
    } else {
        // Create images array with correct image
        product.images = JSON.stringify([CORRECT_IMAGE]);
    }
    
    fixedCount++;
});

console.log(`\n✅ Fixed ${fixedCount} Carrier products\n`);

// Create backup
const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_before_carrier_fix_${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
console.log(`💾 Created backup: ${path.basename(backupPath)}\n`);

// Save updated database
fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(database, null, 2));
console.log(`✅ Database updated successfully!`);
console.log(`   Total products: ${database.products.length}`);
console.log(`   Fixed: ${fixedCount} Carrier products`);
console.log(`   New image: ${CORRECT_IMAGE}\n`);

// Verify fix
const verifyCarrier = database.products.filter(p => 
    p.brand && p.brand.includes('Carrier') &&
    p.imageUrl && p.imageUrl.includes('Motor')
);

if (verifyCarrier.length === 0) {
    console.log('✅ Verification: No Carrier products have Motor.jpg anymore!\n');
} else {
    console.log(`⚠️  Warning: ${verifyCarrier.length} Carrier products still have Motor.jpg\n`);
}

console.log('🎉 Fix complete!\n');

