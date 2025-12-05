/**
 * Regenerate upload URLs for failed images (401 errors)
 * Generates fresh URLs for indices: 1, 2, 4, 6, 8, 9, 11
 */

const fs = require('fs');
const path = require('path');

// Failed image indices and their file names
const failedImages = [
    { index: 1, filename: "LG LDE4413ST 30 Double Wall Oven.jpeg", mimeType: "image/jpeg" },
    { index: 2, filename: "Light.jpeg", mimeType: "image/jpeg" },
    { index: 4, filename: "microwavemainhp.jpg", mimeType: "image/jpeg" },
    { index: 6, filename: "Motor.jpg", mimeType: "image/jpeg" },
    { index: 8, filename: "Savings.jpg", mimeType: "image/jpeg" },
    { index: 9, filename: "Smart Home. jpeg.jpeg", mimeType: "image/jpeg" },
    { index: 11, filename: "Whirlpool WOD51HZES 30 Double Wall Oven.jpg", mimeType: "image/jpeg" }
];

const siteId = "cfa82ec2-a075-4152-9799-6a1dd5c01ef4";
const apiUrl = "https://www.wixapis.com/site-media/v1/files/generate-upload-url";

console.log('\n🔄 Regenerating upload URLs for failed images...\n');
console.log(`📊 Failed images: ${failedImages.length}\n`);

// Store results
const newUrls = {};

// Generate URL for each failed image
async function generateUrls() {
    for (const img of failedImages) {
        try {
            console.log(`Generating URL for ${img.filename} (index ${img.index})...`);
            
            // Get file size
            const filePath = path.join(__dirname, 'Product Placement', img.filename);
            const fileStats = fs.statSync(filePath);
            const sizeInBytes = fileStats.size;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': process.env.WIX_API_KEY || 'YOUR_API_KEY_HERE'
                },
                body: JSON.stringify({
                    mimeType: img.mimeType,
                    fileName: img.filename,
                    sizeInBytes: sizeInBytes
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            newUrls[img.index] = data.uploadUrl;
            console.log(`   ✅ Generated URL for index ${img.index}\n`);
        } catch (error) {
            console.error(`   ❌ Failed to generate URL for ${img.filename}: ${error.message}\n`);
        }
    }
    
    // Save new URLs
    if (Object.keys(newUrls).length > 0) {
        const outputFile = path.join(__dirname, 'regenerated-urls.json');
        fs.writeFileSync(outputFile, JSON.stringify(newUrls, null, 2), 'utf8');
        console.log(`✅ Saved ${Object.keys(newUrls).length} new URLs to ${outputFile}\n`);
        console.log('📋 New URLs:');
        Object.entries(newUrls).forEach(([index, url]) => {
            console.log(`   Index ${index}: ${url.substring(0, 80)}...`);
        });
    }
}

// Note: This requires Wix API authentication
// For now, we'll use the MCP tool to generate URLs
console.log('⚠️  Note: This script requires Wix API authentication.');
console.log('⚠️  Using MCP tools to generate URLs instead...\n');

module.exports = { failedImages, generateUrls };








