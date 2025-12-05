/**
 * Update final-13-urls.json and upload-final-batch.js with newly generated URLs
 * for the 7 failed images (indices 1, 2, 4, 6, 8, 9, 11)
 */

const fs = require('fs');
const path = require('path');

// Map of failed indices to their new upload URLs
// These URLs will be populated from regenerated-urls.json or API responses
const newUrls = {
    1: null, // LG LDE4413ST 30 Double Wall Oven.jpeg
    2: null, // Light.jpeg
    4: null, // microwavemainhp.jpg
    6: null, // Motor.jpg
    8: null, // Savings.jpg
    9: null, // Smart Home. jpeg.jpeg
    11: null // Whirlpool WOD51HZES 30 Double Wall Oven.jpg
};

// Read regenerated URLs if they exist
const regeneratedUrlsPath = path.join(__dirname, 'regenerated-urls.json');
if (fs.existsSync(regeneratedUrlsPath)) {
    const regeneratedUrls = JSON.parse(fs.readFileSync(regeneratedUrlsPath, 'utf8'));
    Object.assign(newUrls, regeneratedUrls);
}

console.log('📋 Updating files with new upload URLs...\n');

// Check if all URLs are available
const missingUrls = Object.entries(newUrls).filter(([index, url]) => !url);
if (missingUrls.length > 0) {
    console.error(`❌ Missing URLs for indices: ${missingUrls.map(([i]) => i).join(', ')}`);
    console.error('⚠️  Please generate URLs first using MCP tools or regenerate-failed-urls.js\n');
    process.exit(1);
}

// Update final-13-urls.json
const jsonFilePath = path.join(__dirname, 'final-13-urls.json');
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

// Update URLs at the specified indices
Object.entries(newUrls).forEach(([index, url]) => {
    const idx = parseInt(index);
    if (jsonData.urls && jsonData.urls[idx]) {
        jsonData.urls[idx] = url;
        console.log(`✅ Updated index ${idx} in final-13-urls.json`);
    }
});

fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
console.log(`\n✅ Updated ${jsonFilePath}\n`);

// Update upload-final-batch.js
const jsFilePath = path.join(__dirname, 'upload-final-batch.js');
let jsContent = fs.readFileSync(jsFilePath, 'utf8');

// Find the uploadUrls array and replace URLs at specified indices
const urlArrayMatch = jsContent.match(/const uploadUrls = \[([\s\S]*?)\];/);
if (urlArrayMatch) {
    const urlArrayContent = urlArrayMatch[1];
    const urlLines = urlArrayContent.split('\n').filter(line => line.trim());
    
    // Extract existing URLs
    const existingUrls = urlLines
        .map(line => {
            const match = line.match(/"(https:\/\/[^"]+)"/);
            return match ? match[1] : null;
        })
        .filter(url => url !== null);
    
    // Update URLs at specified indices
    Object.entries(newUrls).forEach(([index, url]) => {
        const idx = parseInt(index);
        if (existingUrls[idx]) {
            existingUrls[idx] = url;
            console.log(`✅ Updated index ${idx} in upload-final-batch.js`);
        }
    });
    
    // Reconstruct the uploadUrls array
    const newUrlArray = existingUrls.map(url => `    "${url}"`).join(',\n');
    jsContent = jsContent.replace(
        /const uploadUrls = \[([\s\S]*?)\];/,
        `const uploadUrls = [\n${newUrlArray}\n];`
    );
    
    fs.writeFileSync(jsFilePath, jsContent, 'utf8');
    console.log(`\n✅ Updated ${jsFilePath}\n`);
} else {
    console.error('❌ Could not find uploadUrls array in upload-final-batch.js');
    process.exit(1);
}

console.log('🎉 Successfully updated both files with new URLs!\n');








