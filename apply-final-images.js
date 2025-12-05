const fs = require('fs');
const path = require('path');

console.log('\n🖼️ APPLYING FINAL IMAGES TO REMAINING 39 PRODUCTS\n');
console.log('='.repeat(70));

// Load database
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const withoutImages = data.products.filter(p => !p.imageUrl);
console.log(`📦 Products without images: ${withoutImages.length}\n`);

if (withoutImages.length > 0) {
    console.log('Applying generic images...\n');
    
    // Map remaining products to appropriate images
    withoutImages.forEach(product => {
        // Use appropriate image based on category
        if (product.category === 'Office Equipment') {
            product.imageUrl = 'Product Placement/Motor.jpg'; // Generic tech image
        } else if (product.category === 'Smart Home') {
            product.imageUrl = 'Product Placement/Smart Home. jpeg.jpeg';
        } else if (product.category === 'Appliances') {
            product.imageUrl = 'Product Placement/Appliances.jpg';
        } else if (product.category === 'Lighting') {
            product.imageUrl = 'Product Placement/Light.jpeg';
        } else {
            // Generic fallback
            product.imageUrl = 'Product Placement/Motor.jpg';
        }
        product.imageSource = 'placeholder-generic';
        product.imageAssigned = new Date().toISOString();
    });
    
    console.log(`✅ Applied images to ${withoutImages.length} products\n`);
    
    // Save
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log('✅ Database saved!\n');
    
    // Final count
    const finalWithImages = data.products.filter(p => p.imageUrl).length;
    console.log('📊 FINAL RESULTS:');
    console.log(`   Total Products: ${data.products.length}`);
    console.log(`   With Images: ${finalWithImages}`);
    console.log(`   Coverage: ${((finalWithImages / data.products.length) * 100).toFixed(1)}%`);
    console.log('\n✨ ALL PRODUCTS NOW HAVE IMAGES!\n');
} else {
    console.log('🎉 All products already have images!');
}



const path = require('path');

console.log('\n🖼️ APPLYING FINAL IMAGES TO REMAINING 39 PRODUCTS\n');
console.log('='.repeat(70));

// Load database
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const withoutImages = data.products.filter(p => !p.imageUrl);
console.log(`📦 Products without images: ${withoutImages.length}\n`);

if (withoutImages.length > 0) {
    console.log('Applying generic images...\n');
    
    // Map remaining products to appropriate images
    withoutImages.forEach(product => {
        // Use appropriate image based on category
        if (product.category === 'Office Equipment') {
            product.imageUrl = 'Product Placement/Motor.jpg'; // Generic tech image
        } else if (product.category === 'Smart Home') {
            product.imageUrl = 'Product Placement/Smart Home. jpeg.jpeg';
        } else if (product.category === 'Appliances') {
            product.imageUrl = 'Product Placement/Appliances.jpg';
        } else if (product.category === 'Lighting') {
            product.imageUrl = 'Product Placement/Light.jpeg';
        } else {
            // Generic fallback
            product.imageUrl = 'Product Placement/Motor.jpg';
        }
        product.imageSource = 'placeholder-generic';
        product.imageAssigned = new Date().toISOString();
    });
    
    console.log(`✅ Applied images to ${withoutImages.length} products\n`);
    
    // Save
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log('✅ Database saved!\n');
    
    // Final count
    const finalWithImages = data.products.filter(p => p.imageUrl).length;
    console.log('📊 FINAL RESULTS:');
    console.log(`   Total Products: ${data.products.length}`);
    console.log(`   With Images: ${finalWithImages}`);
    console.log(`   Coverage: ${((finalWithImages / data.products.length) * 100).toFixed(1)}%`);
    console.log('\n✨ ALL PRODUCTS NOW HAVE IMAGES!\n');
} else {
    console.log('🎉 All products already have images!');
}





















