/**
 * Generate all 13 upload URLs and save directly to final-13-urls.json
 * NO LONG URLS IN CODE - everything handled programmatically
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const siteId = "cfa82ec2-a075-4152-9799-6a1dd5c01ef4"; // Greenways Market
const appToken = process.env.WIX_APP_TOKEN || process.env.WIX_API_TOKEN;

if (!appToken) {
    console.error('❌ Error: WIX_APP_TOKEN or WIX_API_TOKEN environment variable not set');
    console.log('\n💡 Set it with: $env:WIX_APP_TOKEN="your-token"');
    process.exit(1);
}

// Image files in order
const imageFiles = [
    { name: "KitchenAid KODE500ESS 30 Double Wall Ovenjpg.jpg", index: 1 },
    { name: "LG LDE4413ST 30 Double Wall Oven.jpeg", index: 2 },
    { name: "Light.jpeg", index: 3 },
    { name: "Maytag MWO5105BZ 30 Single Wall Ovenjpg.jpg", index: 4 },
    { name: "microwavemainhp.jpg", index: 5 },
    { name: "Motor.jpeg", index: 6 },
    { name: "Motor.jpg", index: 7 },
    { name: "Samsung NE58K9430WS 30 Wall Oven.jpg", index: 8 },
    { name: "Savings.jpg", index: 9 },
    { name: "Smart Home. jpeg.jpeg", index: 10 },
    { name: "Smart Warm Home. jpeg.jpeg", index: 11 },
    { name: "Whirlpool WOD51HZES 30 Double Wall Oven.jpg", index: 12 },
    { name: "Appliances.jpg", index: 13 }
];

// Get file sizes
const productPlacementPath = path.join(__dirname, 'Product Placement');
imageFiles.forEach(img => {
    const filePath = path.join(productPlacementPath, img.name);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        img.sizeInBytes = stats.size.toString(); // Must be string for API
        img.mimeType = 'image/jpeg';
    } else {
        console.error(`❌ File not found: ${img.name}`);
    }
});

// Generate upload URL via Wix API
async function generateUploadUrl(fileName, sizeInBytes, mimeType) {
    return new Promise((resolve, reject) => {
        const apiUrl = `https://www.wixapis.com/site-media/v1/files/generate-upload-url`;
        
        const postData = JSON.stringify({
            fileName: fileName,
            sizeInBytes: sizeInBytes,
            mimeType: mimeType
        });

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${appToken}`,
                'Content-Type': 'application/json',
                'wix-site-id': siteId
            }
        };

        const req = https.request(apiUrl, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    try {
                        const response = JSON.parse(data);
                        resolve(response.uploadUrl);
                    } catch (e) {
                        reject(new Error(`Failed to parse response: ${e.message}`));
                    }
                } else {
                    reject(new Error(`API error ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Main function
async function generateAndSaveAllUrls() {
    console.log('🚀 Generating upload URLs for all 13 images...\n');
    
    const urls = [];
    
    for (const img of imageFiles) {
        if (!img.sizeInBytes) {
            console.error(`⚠️  Skipping ${img.name} - file not found`);
            continue;
        }
        
        try {
            console.log(`[${img.index}/13] Generating URL for: ${img.name}`);
            const uploadUrl = await generateUploadUrl(img.name, img.sizeInBytes, img.mimeType);
            urls.push(uploadUrl);
            console.log(`✅ URL generated\n`);
        } catch (error) {
            console.error(`❌ Failed for ${img.name}: ${error.message}\n`);
        }
    }
    
    if (urls.length === 13) {
        // Save directly to final-13-urls.json
        const outputPath = path.join(__dirname, 'final-13-urls.json');
        fs.writeFileSync(outputPath, JSON.stringify({ urls }, null, 2), 'utf8');
        console.log(`✅ Saved all ${urls.length} URLs to: final-13-urls.json\n`);
        
        // Also update all-13-images-info.json with URLs
        const infoPath = path.join(__dirname, 'all-13-images-info.json');
        if (fs.existsSync(infoPath)) {
            const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
            info.forEach((item, index) => {
                if (urls[index]) {
                    item.uploadUrl = urls[index];
                }
            });
            fs.writeFileSync(infoPath, JSON.stringify(info, null, 2), 'utf8');
            console.log(`✅ Updated all-13-images-info.json with URLs\n`);
        }
        
        console.log('🎉 All URLs generated and saved!\n');
    } else {
        console.error(`⚠️  Only generated ${urls.length}/13 URLs\n`);
    }
}

// Run
generateAndSaveAllUrls().catch(console.error);









