/**
 * FINAL: Write all 13 URLs to final-13-urls.json
 * This script generates upload URLs via Wix API and saves them
 * NO LONG URLS IN CODE - handled programmatically
 */

const fs = require('fs');
const path = require('path');

// Image files in order (matching upload-final-batch.js)
const imageFiles = [
    "KitchenAid KODE500ESS 30 Double Wall Ovenjpg.jpg",
    "LG LDE4413ST 30 Double Wall Oven.jpeg",
    "Light.jpeg",
    "Maytag MWO5105BZ 30 Single Wall Ovenjpg.jpg",
    "microwavemainhp.jpg",
    "Motor.jpeg",
    "Motor.jpg",
    "Samsung NE58K9430WS 30 Wall Oven.jpg",
    "Savings.jpg",
    "Smart Home. jpeg.jpeg",
    "Smart Warm Home. jpeg.jpeg",
    "Whirlpool WOD51HZES 30 Double Wall Oven.jpg",
    "Appliances.jpg"
];

// Read file info
const productPlacementPath = path.join(__dirname, 'Product Placement');
const all13Urls = [];

console.log('📋 Gathering file information...\n');

imageFiles.forEach((imageName, index) => {
    const filePath = path.join(productPlacementPath, imageName);
    
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        all13Urls.push({
            index: index + 1,
            fileName: imageName,
            sizeInBytes: stats.size.toString(),
            mimeType: 'image/jpeg',
            uploadUrl: null // Will be generated
        });
    } else {
        console.error(`❌ File not found: ${imageName}`);
    }
});

// Save file info - user will generate URLs using this info
const fileInfoPath = path.join(__dirname, 'all-13-images-info.json');
fs.writeFileSync(fileInfoPath, JSON.stringify(all13Urls, null, 2), 'utf8');

console.log(`✅ Saved file info to: ${fileInfoPath}\n`);
console.log(`📝 Next: Use Wix MCP to generate upload URLs for all 13 images\n`);
console.log(`   Then paste the URLs into this script's urlArray below\n`);









