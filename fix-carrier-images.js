/**
 * Fix Carrier Refrigeration product images
 * Changes Motor.jpg to correct Carrier product images
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const OUTPUT_FILE = path.join(__dirname, 'carrier-fix-results.txt');

let output = [];

function log(message) {
    console.log(message);
    output.push(message);
}

// Image mappings for Carrier products
// Note: File names in product-placement folder match these exactly
const CARRIER_IMAGE_MAP = {
    'Carrier Refrigeration all glass door': 'Product Placement/Carrier Refrigeration all glass door  by Carrier Linde Commercial Refrigeration.jpeg',
    'Carrier Refrigeration anti-reflective all glass door': 'Product Placement/Carrier Refrigeration anti-reflective all glass door by Carrier Linde Commercial.jpeg'
};

// Fallback image for other Carrier products
const FALLBACK_IMAGE = 'Product Placement/Cm Fridge.jpeg';

log('\n🔧 FIXING CARRIER REFRIGERATION PRODUCT IMAGES');
log('='.repeat(70));
log('');

// Load database
let database;
try {
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    database = JSON.parse(databaseContent);
    log(`✅ Loaded database with ${database.products?.length || 0} products`);
} catch (error) {
    log(`❌ Error loading database: ${error.message}`);
    fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
    process.exit(1);
}

// Find Carrier products with Motor.jpg
const carrierProductsToFix = database.products.filter(p => 
    p.brand && p.brand.toLowerCase().includes('carrier') &&
    p.imageUrl && (
        p.imageUrl.includes('Motor.jpg') || 
        p.imageUrl.includes('Motor.jpeg') ||
        p.imageUrl === 'Product Placement/Motor.jpg'
    )
);

log(`\n📦 Found ${carrierProductsToFix.length} Carrier products with Motor.jpg\n`);

if (carrierProductsToFix.length === 0) {
    log('✅ No Carrier products need fixing!\n');
    fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
    process.exit(0);
}

// Show products to fix
log('🔍 Products to fix:');
carrierProductsToFix.forEach((p, i) => {
    const correctImage = CARRIER_IMAGE_MAP[p.name] || 'Product Placement/Cm Fridge.jpeg';
    log(`   ${i + 1}. ${p.id}: ${p.name}`);
    log(`      Current: ${p.imageUrl}`);
    log(`      Will be: ${correctImage}`);
});

// Fix products
let fixedCount = 0;
let fixedDetails = [];

carrierProductsToFix.forEach(product => {
    // Get correct image for this product
    const correctImage = CARRIER_IMAGE_MAP[product.name] || FALLBACK_IMAGE;
    const oldImage = product.imageUrl;
    
    if (oldImage === correctImage) {
        log(`   ⏭️  Skipping ${product.name} - already has correct image`);
        return;
    }
    
    product.imageUrl = correctImage;
    fixedDetails.push({
        id: product.id,
        name: product.name,
        old: oldImage,
        new: correctImage
    });
    
    // Update images array if it exists
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
        if (!images.includes(correctImage) && !images.includes(`/${correctImage}`)) {
            images.unshift(correctImage);
        }
        
        product.images = JSON.stringify(images);
    } else {
        product.images = JSON.stringify([correctImage]);
    }
    
    // Update metadata
    product.imageSource = 'fixed-manual';
    product.imageFixedDate = new Date().toISOString();
    
    fixedCount++;
});

log(`\n✅ Fixed ${fixedCount} Carrier products\n`);

// Create backup
const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_before_carrier_fix_${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
log(`💾 Created backup: ${path.basename(backupPath)}\n`);

// Save updated database
if (fixedCount > 0) {
    log('💾 Saving updated database (this may take a moment - large file)...');
    try {
        // Write in chunks to avoid memory issues
        const jsonString = JSON.stringify(database, null, 2);
        fs.writeFileSync(FULL_DATABASE_PATH, jsonString, 'utf8');
        log(`✅ Database updated successfully!`);
        log(`   Total products: ${database.products.length}`);
        log(`   Fixed: ${fixedCount} Carrier products\n`);
        
        // Show what was fixed
        log('📋 Fixed products:');
        fixedDetails.forEach((detail, i) => {
            log(`   ${i + 1}. ${detail.name}`);
            log(`      Old: ${detail.old}`);
            log(`      New: ${detail.new}`);
        });
        log('');
    } catch (error) {
        log(`❌ Error saving database: ${error.message}`);
        log(`   Stack: ${error.stack}`);
        throw error;
    }
} else {
    log('ℹ️  No products needed fixing, skipping save.\n');
}

// Verify fix
const verifyCarrier = database.products.filter(p => 
    p.brand && p.brand.includes('Carrier') &&
    p.imageUrl && p.imageUrl.includes('Motor')
);

if (verifyCarrier.length === 0) {
    log('✅ Verification: No Carrier products have Motor.jpg anymore!\n');
} else {
    log(`⚠️  Warning: ${verifyCarrier.length} Carrier products still have Motor.jpg\n`);
}

log('🎉 Carrier fix complete!\n');

// Save results
fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
log(`💾 Results saved to: ${path.basename(OUTPUT_FILE)}`);

