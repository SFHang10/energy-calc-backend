const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Upload Images to Wix Media Manager
 * 
 * This script will:
 * 1. Read all images from Product Placement folder
 * 2. Generate upload URLs via Wix API
 * 3. Upload each image to Wix Media Manager
 * 4. Get Wix Media URLs
 * 5. Return mapping of local file names to Wix Media URLs
 */

const siteId = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
const imagesFolder = path.join(__dirname, 'Product Placement');

console.log('\n🌐 UPLOADING IMAGES TO WIX MEDIA MANAGER');
console.log('='.repeat(70));
console.log('');

// Get all image files
const imageFiles = fs.readdirSync(imagesFolder)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .map(file => {
        const filePath = path.join(imagesFolder, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        return {
            name: file,
            path: filePath,
            size: stats.size,
            mimeType: mimeTypes[ext] || 'image/jpeg'
        };
    });

console.log(`📸 Found ${imageFiles.length} images to upload`);
console.log('');

// This will store the mapping: local filename -> Wix Media URL
const wixMediaMap = {};

// Export function to upload one image
async function uploadImageToWix(imageFile) {
    return new Promise((resolve, reject) => {
        // Note: In production, we'll use Wix MCP tools to generate upload URL
        // and then upload the file. For now, this is a template.
        
        console.log(`📤 Preparing to upload: ${imageFile.name} (${(imageFile.size / 1024).toFixed(2)} KB)`);
        resolve({
            filename: imageFile.name,
            status: 'pending',
            note: 'Will be uploaded via Wix MCP API calls'
        });
    });
}

console.log('📋 IMAGES READY FOR UPLOAD:');
console.log('');
imageFiles.forEach((img, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${img.name} (${(img.size / 1024).toFixed(2)} KB, ${img.mimeType})`);
});

console.log('');
console.log('🚀 NEXT STEP:');
console.log('   This script prepares images for upload.');
console.log('   I will now use Wix MCP to actually upload each image.');
console.log('   This may take a few minutes for 33 images...');
console.log('');

// Export the image list for use in actual upload
module.exports = {
    siteId,
    imageFiles,
    uploadImageToWix
};


const path = require('path');
const https = require('https');

/**
 * Upload Images to Wix Media Manager
 * 
 * This script will:
 * 1. Read all images from Product Placement folder
 * 2. Generate upload URLs via Wix API
 * 3. Upload each image to Wix Media Manager
 * 4. Get Wix Media URLs
 * 5. Return mapping of local file names to Wix Media URLs
 */

const siteId = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
const imagesFolder = path.join(__dirname, 'Product Placement');

console.log('\n🌐 UPLOADING IMAGES TO WIX MEDIA MANAGER');
console.log('='.repeat(70));
console.log('');

// Get all image files
const imageFiles = fs.readdirSync(imagesFolder)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .map(file => {
        const filePath = path.join(imagesFolder, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        return {
            name: file,
            path: filePath,
            size: stats.size,
            mimeType: mimeTypes[ext] || 'image/jpeg'
        };
    });

console.log(`📸 Found ${imageFiles.length} images to upload`);
console.log('');

// This will store the mapping: local filename -> Wix Media URL
const wixMediaMap = {};

// Export function to upload one image
async function uploadImageToWix(imageFile) {
    return new Promise((resolve, reject) => {
        // Note: In production, we'll use Wix MCP tools to generate upload URL
        // and then upload the file. For now, this is a template.
        
        console.log(`📤 Preparing to upload: ${imageFile.name} (${(imageFile.size / 1024).toFixed(2)} KB)`);
        resolve({
            filename: imageFile.name,
            status: 'pending',
            note: 'Will be uploaded via Wix MCP API calls'
        });
    });
}

console.log('📋 IMAGES READY FOR UPLOAD:');
console.log('');
imageFiles.forEach((img, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${img.name} (${(img.size / 1024).toFixed(2)} KB, ${img.mimeType})`);
});

console.log('');
console.log('🚀 NEXT STEP:');
console.log('   This script prepares images for upload.');
console.log('   I will now use Wix MCP to actually upload each image.');
console.log('   This may take a few minutes for 33 images...');
console.log('');

// Export the image list for use in actual upload
module.exports = {
    siteId,
    imageFiles,
    uploadImageToWix
};




















