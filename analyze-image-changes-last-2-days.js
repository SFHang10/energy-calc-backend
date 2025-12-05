/**
 * Analyze image changes in the last 2 days
 * Compare current state with backups to identify what broke
 */

const fs = require('fs');
const path = require('path');

const CURRENT_JSON = path.join(__dirname, 'FULL-DATABASE-5554.json');
const BACKUP_JSON = path.join(__dirname, 'FULL-DATABASE-5554_backup_athen_images_1763404173142.json');

console.log('\n🔍 ANALYZING IMAGE CHANGES - LAST 2 DAYS');
console.log('='.repeat(70));
console.log('');

// Load current JSON
console.log('📂 Loading current JSON file...');
let currentData;
try {
    currentData = JSON.parse(fs.readFileSync(CURRENT_JSON, 'utf8'));
    console.log(`✅ Loaded ${currentData.products.length} products from current file\n`);
} catch (error) {
    console.error('❌ Error loading current JSON:', error.message);
    process.exit(1);
}

// Load backup JSON
console.log('📂 Loading backup JSON file...');
let backupData;
try {
    backupData = JSON.parse(fs.readFileSync(BACKUP_JSON, 'utf8'));
    console.log(`✅ Loaded ${backupData.products.length} products from backup file\n`);
} catch (error) {
    console.error('❌ Error loading backup JSON:', error.message);
    console.log('⚠️  Continuing without backup comparison...\n');
    backupData = null;
}

// Analyze current state
console.log('📊 ANALYZING CURRENT STATE');
console.log('-'.repeat(70));

// Count products with Motor.jpg
const motorProducts = currentData.products.filter(p => 
    p.imageUrl && (
        p.imageUrl.includes('Motor.jpg') || 
        p.imageUrl.includes('Motor.jpeg') ||
        p.imageUrl === 'Product Placement/Motor.jpg'
    )
);

console.log(`\n❌ Products with Motor.jpg: ${motorProducts.length}`);

// Find Carrier products specifically
const carrierProducts = currentData.products.filter(p => 
    p.name && p.name.includes('Carrier Refrigeration all glass door')
);

console.log(`\n📦 Carrier "all glass door" products: ${carrierProducts.length}`);

if (carrierProducts.length > 0) {
    console.log('\n🔍 Sample Carrier products:');
    carrierProducts.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.id}: ${p.name}`);
        console.log(`      imageUrl: ${p.imageUrl || 'NONE'}`);
        console.log(`      category: ${p.category || 'NONE'}`);
        console.log(`      subcategory: ${p.subcategory || 'NONE'}`);
    });
}

// Count by category
const motorByCategory = {};
motorProducts.forEach(p => {
    const cat = p.category || 'Uncategorized';
    motorByCategory[cat] = (motorByCategory[cat] || 0) + 1;
});

console.log('\n📊 Motor.jpg products by category:');
Object.entries(motorByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} products`);
    });

// Compare with backup if available
if (backupData) {
    console.log('\n\n📊 COMPARING WITH BACKUP');
    console.log('-'.repeat(70));
    
    // Find Carrier products in backup
    const backupCarrierProducts = backupData.products.filter(p => 
        p.name && p.name.includes('Carrier Refrigeration all glass door')
    );
    
    console.log(`\n📦 Carrier products in backup: ${backupCarrierProducts.length}`);
    
    if (backupCarrierProducts.length > 0 && carrierProducts.length > 0) {
        console.log('\n🔍 Comparing first Carrier product:');
        const currentCarrier = carrierProducts[0];
        const backupCarrier = backupCarrierProducts.find(p => p.id === currentCarrier.id);
        
        if (backupCarrier) {
            console.log(`   Current imageUrl: ${currentCarrier.imageUrl || 'NONE'}`);
            console.log(`   Backup imageUrl:  ${backupCarrier.imageUrl || 'NONE'}`);
            
            if (currentCarrier.imageUrl !== backupCarrier.imageUrl) {
                console.log(`   ⚠️  IMAGE CHANGED!`);
                console.log(`      Current: ${currentCarrier.imageUrl}`);
                console.log(`      Backup:  ${backupCarrier.imageUrl}`);
            } else {
                console.log(`   ✅ Image is the same (both have issue or both fixed)`);
            }
        }
    }
    
    // Count Motor.jpg in backup
    const backupMotorProducts = backupData.products.filter(p => 
        p.imageUrl && (
            p.imageUrl.includes('Motor.jpg') || 
            p.imageUrl.includes('Motor.jpeg') ||
            p.imageUrl === 'Product Placement/Motor.jpg'
        )
    );
    
    console.log(`\n📊 Motor.jpg count comparison:`);
    console.log(`   Current: ${motorProducts.length} products`);
    console.log(`   Backup:  ${backupMotorProducts.length} products`);
    
    if (motorProducts.length > backupMotorProducts.length) {
        console.log(`   ⚠️  INCREASED by ${motorProducts.length - backupMotorProducts.length} products`);
    } else if (motorProducts.length < backupMotorProducts.length) {
        console.log(`   ✅ DECREASED by ${backupMotorProducts.length - motorProducts.length} products`);
    } else {
        console.log(`   ℹ️  Same count (no change)`);
    }
}

// Check what images Carrier products SHOULD have
console.log('\n\n🔍 WHAT IMAGES SHOULD CARRIER PRODUCTS HAVE?');
console.log('-'.repeat(70));

// Look for other Carrier products with different images
const otherCarrierProducts = currentData.products.filter(p => 
    p.brand && p.brand.includes('Carrier') && 
    p.name && !p.name.includes('all glass door') &&
    p.imageUrl && !p.imageUrl.includes('Motor')
);

if (otherCarrierProducts.length > 0) {
    console.log(`\n✅ Found ${otherCarrierProducts.length} other Carrier products with non-Motor images:`);
    otherCarrierProducts.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`);
        console.log(`      imageUrl: ${p.imageUrl}`);
    });
}

// Check for fridge/commercial refrigeration images
const fridgeImages = new Set();
currentData.products.forEach(p => {
    if (p.imageUrl && (
        p.imageUrl.includes('Fridge') || 
        p.imageUrl.includes('fridge') ||
        p.imageUrl.includes('Refrigerat') ||
        p.imageUrl.includes('Commercial') ||
        p.imageUrl.includes('Cm Fridge')
    )) {
        fridgeImages.add(p.imageUrl);
    }
});

console.log(`\n📦 Available fridge/refrigeration images in database:`);
Array.from(fridgeImages).slice(0, 10).forEach(img => {
    console.log(`   - ${img}`);
});

// Summary
console.log('\n\n📋 SUMMARY');
console.log('='.repeat(70));
console.log(`\n❌ Current Issues:`);
console.log(`   - ${motorProducts.length} products have Motor.jpg (should be fixed)`);
console.log(`   - ${carrierProducts.length} Carrier "all glass door" products have wrong images`);
console.log(`   - These are REFRIGERATION products, not motors`);

console.log(`\n✅ Recommended Fix:`);
console.log(`   - Carrier products should have: product-placement/Cm Fridge.jpeg`);
console.log(`   - Or: product-placement/Commercial Refrigeration image`);
console.log(`   - NOT: Product Placement/Motor.jpg`);

console.log(`\n🔧 Next Steps:`);
console.log(`   1. Check if JSON file was reverted/overwritten`);
console.log(`   2. Check file modification dates`);
console.log(`   3. Restore from backup if needed`);
console.log(`   4. Run image fix script for Carrier products`);

console.log('\n');

