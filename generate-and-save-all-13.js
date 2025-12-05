/**
 * SAFE: Generate all 13 upload URLs via Wix API and save to urls.txt
 * This script writes URLs directly to urls.txt (one per line) to avoid token limits
 */

const fs = require('fs');
const path = require('path');

const imagesInfo = require('./all-13-images-info.json');
const urlsFile = path.join(__dirname, 'urls.txt');
const siteId = "cfa82ec2-a075-4152-9799-6a1dd5c01ef4"; // Greenways Market

console.log('📋 Generating upload URLs for all 13 images via Wix API...\n');

// Clear existing urls.txt (start fresh)
fs.writeFileSync(urlsFile, '', 'utf8');
console.log(`📝 Cleared ${urlsFile}\n`);

// Generate URLs one at a time and append to urls.txt
for (let i = 0; i < imagesInfo.length; i++) {
    const image = imagesInfo[i];
    console.log(`[${i + 1}/13] Generating URL for: ${image.fileName}...`);
    
    try {
        // Call Wix API to generate upload URL
        const response = await CallWixSiteAPI(
            siteId,
            "POST",
            "https://www.wixapis.com/mediaManager/v1/files/generate-upload-url",
            {
                mimeType: image.mimeType,
                fileName: image.fileName,
                sizeInBytes: image.sizeInBytes.toString()
            }
        );
        
        if (response && response.uploadUrl) {
            // Append URL to urls.txt (one per line)
            fs.appendFileSync(urlsFile, response.uploadUrl + '\n', 'utf8');
            console.log(`   ✅ URL generated and saved to ${urlsFile}`);
        } else {
            console.error(`   ❌ No uploadUrl in response`);
        }
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
    }
}

console.log(`\n✅ All URLs generated and saved to ${urlsFile}\n`);
console.log(`💡 Next step: Run 'node extract-all-13-from-api.js' to consolidate into final-13-urls.json\n`);








