/**
 * Upload FINAL BATCH - Remaining 13 images
 * Using form-data library for better multipart handling
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const https = require('https');

function uploadFileToWix(filePath, uploadUrl) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        const fileData = fs.createReadStream(filePath);
        const filename = path.basename(filePath);
        
        // Detect content type
        const ext = path.extname(filename).toLowerCase();
        const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/jpeg';
        
        form.append('file', fileData, {
            filename: filename,
            contentType: contentType
        });
        
        const url = new URL(uploadUrl);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: form.getHeaders()
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve({ raw: data, statusCode: res.statusCode });
                    }
                } else {
                    reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (error) => reject(error));
        form.pipe(req);
    });
}

// Load URLs from the existing script file
const originalScript = fs.readFileSync(path.join(__dirname, 'upload-final-batch.js'), 'utf8');
const urlMatch = originalScript.match(/const uploadUrls = \[([\s\S]*?)\];/);
const uploadUrls = eval(urlMatch[0].replace('const uploadUrls = ', ''));

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

async function uploadBatch() {
    console.log('\n📤 Uploading with form-data library (V2) - Fresh URLs...\n');
    const results = [];
    
    // Load fresh URLs for the 6 that failed
    const freshUrls = JSON.parse(fs.readFileSync(path.join(__dirname, 'fresh-urls-for-6-remaining.json'), 'utf8'));
    const failedIndices = [1, 3, 4, 5, 6, 8];
    
    for (const i of failedIndices) {
        const imagePath = path.join(__dirname, 'Product Placement', imageNames[i]);
        const uploadUrl = freshUrls[i.toString()];
        
        console.log(`${i + 1}. Uploading: ${imageNames[i]}`);
        
        try {
            const result = await uploadFileToWix(imagePath, uploadUrl);
            const wixUrl = result.file?.url || result.raw;
            console.log(`   ✅ Success! URL: ${wixUrl}`);
            results.push({
                filename: imageNames[i],
                index: i,
                localPath: `Product Placement/${imageNames[i]}`,
                wixUrl: wixUrl
            });
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            results.push({
                filename: imageNames[i],
                index: i,
                error: error.message
            });
        }
        console.log('');
    }
    
    return results;
}

uploadBatch().then(results => {
    console.log('📊 V2 Upload Results:');
    console.log(JSON.stringify(results, null, 2));
    fs.writeFileSync('upload-results-v2.json', JSON.stringify(results, null, 2));
});

