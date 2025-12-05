/**
 * Diagnose Carrier product image issues
 */

const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('\n🔍 DIAGNOSING CARRIER PRODUCT IMAGES');
console.log('='.repeat(70));
console.log('');

// Load JSON
const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const products = data.products || [];

console.log(`📦 Total products: ${products.length}\n`);

// Find Carrier products
const carrierProducts = products.filter(p => 
    p.brand && p.brand.includes('Carrier')
);

console.log(`📦 Carrier products: ${carrierProducts.length}\n`);

// Find Carrier "all glass door" products
const carrierGlassDoor = carrierProducts.filter(p => 
    p.name && p.name.includes('all glass door')
);

console.log(`📦 Carrier "all glass door" products: ${carrierGlassDoor.length}\n`);

// Check their images
console.log('🔍 Carrier "all glass door" products with Motor.jpg:');
let motorCount = 0;
carrierGlassDoor.forEach(p => {
    if (p.imageUrl && p.imageUrl.includes('Motor')) {
        motorCount++;
        console.log(`   ${p.id}: ${p.name}`);
        console.log(`      Current: ${p.imageUrl}`);
    }
});

console.log(`\n❌ Total with Motor.jpg: ${motorCount}\n`);

// Find what images other Carrier products use
const otherCarrier = carrierProducts.filter(p => 
    !p.name.includes('all glass door') &&
    p.imageUrl && !p.imageUrl.includes('Motor')
);

console.log(`✅ Other Carrier products with non-Motor images: ${otherCarrier.length}\n`);

if (otherCarrier.length > 0) {
    console.log('📋 Sample images used by other Carrier products:');
    const imageCounts = {};
    otherCarrier.slice(0, 20).forEach(p => {
        const img = p.imageUrl || 'NONE';
        imageCounts[img] = (imageCounts[img] || 0) + 1;
    });
    
    Object.entries(imageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([img, count]) => {
            console.log(`   ${img}: ${count} products`);
        });
}

// Find commercial refrigeration images in database
console.log('\n📋 Commercial refrigeration images available:');
const fridgeImages = new Set();
products.forEach(p => {
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

Array.from(fridgeImages).slice(0, 10).forEach(img => {
    console.log(`   - ${img}`);
});

// Check category/subcategory
console.log('\n📋 Carrier "all glass door" category info:');
if (carrierGlassDoor.length > 0) {
    const sample = carrierGlassDoor[0];
    console.log(`   Category: ${sample.category || 'NONE'}`);
    console.log(`   Subcategory: ${sample.subcategory || 'NONE'}`);
}

console.log('\n');

