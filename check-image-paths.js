const db = require('./FULL-DATABASE-5554.json').products;

// Check for "Product Placement" (wrong format) vs "product-placement" (correct)
const wrongFormat = db.filter(p => (p.imageUrl || '').includes('Product Placement'));
const correctFormat = db.filter(p => (p.imageUrl || '').includes('product-placement'));

console.log('Products with "Product Placement" (WRONG - has space):', wrongFormat.length);
console.log('Products with "product-placement" (correct):', correctFormat.length);

// Check if files exist for the correct format
const fs = require('fs');
const path = require('path');

console.log('\n--- Checking if product-placement folder has the images ---');
const productPlacementDir = './product-placement';
if (fs.existsSync(productPlacementDir)) {
    const files = fs.readdirSync(productPlacementDir);
    console.log('Files in product-placement folder:', files.length);
    console.log('Sample files:', files.slice(0, 10));
    
    // Check what images are being referenced
    const referencedImages = new Set();
    wrongFormat.forEach(p => {
        const img = p.imageUrl.replace('Product Placement/', '');
        referencedImages.add(img);
    });
    console.log('\nUnique images referenced:', referencedImages.size);
    console.log('Referenced images:', Array.from(referencedImages).slice(0, 15));
    
    // Check which ones exist
    let found = 0, missing = 0;
    referencedImages.forEach(img => {
        const fullPath = path.join(productPlacementDir, img);
        if (fs.existsSync(fullPath)) found++;
        else missing++;
    });
    console.log('\n✅ Found:', found);
    console.log('❌ Missing:', missing);
} else {
    console.log('product-placement folder NOT FOUND');
}



















