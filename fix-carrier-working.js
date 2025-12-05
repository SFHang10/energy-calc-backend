const path = require('path');
const fs = require('fs');

// Use the EXACT same pattern as safe_sync_images_to_json.js
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🔄 Updating Carrier product images...\n');

// Load JSON file (same as safe_sync_images_to_json.js)
let jsonData;
try {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    jsonData = JSON.parse(jsonContent);
    console.log(`✅ Loaded JSON file with ${jsonData.products.length} products\n`);
} catch (error) {
    console.error('❌ Error loading JSON file:', error);
    process.exit(1);
}

// Wix URLs
const allGlassUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
const antiReflectiveUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';

let updatedAllGlass = 0;
let updatedAntiReflective = 0;
let foundAllGlass = 0;
let foundAntiReflective = 0;

// First, count what we have
jsonData.products.forEach(product => {
    if (product.name === 'Carrier Refrigeration all glass door') {
        foundAllGlass++;
        if (product.imageUrl === 'Product Placement/Motor.jpg') {
            console.log(`Found "all glass door" with Motor.jpg: ID ${product.id}`);
        }
    }
    if (product.name === 'Carrier Refrigeration anti-reflective all glass door') {
        foundAntiReflective++;
        if (product.imageUrl === 'Product Placement/Motor.jpg') {
            console.log(`Found "anti-reflective" with Motor.jpg: ID ${product.id}`);
        }
    }
});

console.log(`\n📊 Found ${foundAllGlass} "all glass door" products`);
console.log(`📊 Found ${foundAntiReflective} "anti-reflective" products\n`);

// Update Carrier products (same pattern as safe_sync)
jsonData.products.forEach(product => {
    if (product.name === 'Carrier Refrigeration all glass door' && 
        product.imageUrl === 'Product Placement/Motor.jpg') {
        console.log(`✅ UPDATING: ${product.name} (ID: ${product.id})`);
        console.log(`   Old: ${product.imageUrl}`);
        console.log(`   New: ${allGlassUrl}\n`);
        product.imageUrl = allGlassUrl;
        updatedAllGlass++;
    } else if (product.name === 'Carrier Refrigeration anti-reflective all glass door' && 
               product.imageUrl === 'Product Placement/Motor.jpg') {
        console.log(`✅ UPDATING: ${product.name} (ID: ${product.id})`);
        console.log(`   Old: ${product.imageUrl}`);
        console.log(`   New: ${antiReflectiveUrl}\n`);
        product.imageUrl = antiReflectiveUrl;
        updatedAntiReflective++;
    }
});

// Save (same as safe_sync_images_to_json.js)
try {
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log(`\n📊 UPDATE complete:`);
    console.log(`- ✅ Updated "all glass door": ${updatedAllGlass} products`);
    console.log(`- ✅ Updated "anti-reflective": ${updatedAntiReflective} products`);
    console.log(`- 📄 JSON file saved successfully\n`);
} catch (error) {
    console.error('❌ Error saving JSON file:', error);
}

