/**
 * Regenerate upload URLs for remaining 6 failed images
 * Indices: 1, 3, 4, 5, 6, 8
 */

const { CallWixSiteAPI } = require('@modelcontextprotocol/sdk');

const siteId = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';

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

const failedIndices = [1, 3, 4, 5, 6, 8];

async function regenerateUrls() {
    console.log('\n🔄 Regenerating upload URLs for 6 remaining images...\n');
    const results = {};
    
    for (const i of failedIndices) {
        const filename = imageNames[i];
        const ext = filename.split('.').pop().toLowerCase();
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
        
        console.log(`${i + 1}. Generating URL for: ${filename}`);
        
        try {
            const response = await CallWixSiteAPI({
                siteId,
                url: 'https://www.wixapis.com/site-media/v1/files/generate-upload-url',
                method: 'POST',
                body: JSON.stringify({
                    mimeType: mimeType,
                    fileName: filename
                })
            });
            
            if (response.uploadUrl) {
                console.log(`   ✅ Generated URL`);
                results[i] = response.uploadUrl;
            } else {
                console.log(`   ❌ No uploadUrl in response`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            results[i] = { error: error.message };
        }
        console.log('');
    }
    
    const fs = require('fs');
    fs.writeFileSync('regenerated-remaining-6-urls.json', JSON.stringify(results, null, 2));
    console.log('📝 Saved to regenerated-remaining-6-urls.json');
}

// Note: This needs to be run with MCP context
console.log('⚠️  This script requires MCP context to call Wix APIs.');
console.log('Run this through the MCP tools instead.');








