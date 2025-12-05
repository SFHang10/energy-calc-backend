/**
 * Generate upload URLs for all 13 images and update files
 * Site: Greenways Market (cfa82ec2-a075-4152-9799-6a1dd5c01ef4)
 */

const fs = require('fs');
const path = require('path');

// The 13 target images (matching upload-final-batch.js order)
const imageNames = [
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

// Get file info for each image
const productPlacementPath = path.join(__dirname, 'Product Placement');
const all13Urls = [];

console.log('📋 Gathering file information for 13 images...\n');

imageNames.forEach((imageName, index) => {
    const filePath = path.join(productPlacementPath, imageName);
    
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeInBytes = stats.size;
        
        // Determine mime type from extension
        let mimeType = 'image/jpeg';
        if (imageName.endsWith('.jpg') || imageName.endsWith('.jpeg')) {
            mimeType = 'image/jpeg';
        } else if (imageName.endsWith('.png')) {
            mimeType = 'image/png';
        }
        
        console.log(`${index + 1}. ${imageName}`);
        console.log(`   Size: ${(sizeInBytes / 1024).toFixed(2)} KB`);
        console.log(`   Type: ${mimeType}`);
        console.log('');
        
        // For now, we'll use placeholders - these will be filled by API calls
        all13Urls.push({
            index: index + 1,
            fileName: imageName,
            sizeInBytes: sizeInBytes,
            mimeType: mimeType,
            uploadUrl: null // Will be generated via Wix API
        });
    } else {
        console.error(`❌ File not found: ${imageName}`);
        all13Urls.push({
            index: index + 1,
            fileName: imageName,
            error: 'File not found'
        });
    }
});

// Save file info to JSON for API calls
const fileInfoPath = path.join(__dirname, 'all-13-images-info.json');
fs.writeFileSync(fileInfoPath, JSON.stringify(all13Urls, null, 2), 'utf8');
console.log(`✅ Saved file information to: ${fileInfoPath}\n`);
console.log(`📝 Next: Generate upload URLs using Wix API for all 13 images\n`);









