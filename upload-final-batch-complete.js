/**
 * Upload FINAL BATCH - Generate URLs and upload all 13 remaining images
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Image metadata
const images = [
    { name: "KitchenAid KODE500ESS 30 Double Wall Ovenjpg.jpg", size: 82509 },
    { name: "LG LDE4413ST 30 Double Wall Oven.jpeg", size: 154861 },
    { name: "Light.jpeg", size: 146428 },
    { name: "Maytag MWO5105BZ 30 Single Wall Ovenjpg.jpg", size: 203164 },
    { name: "microwavemainhp.jpg", size: 20693 },
    { name: "Motor.jpeg", size: 26004 },
    { name: "Motor.jpg", size: 18029 },
    { name: "Samsung NE58K9430WS 30 Wall Oven.jpg", size: 21663 },
    { name: "Savings.jpg", size: 13100 },
    { name: "Smart Home. jpeg.jpeg", size: 22495 },
    { name: "Smart Warm Home. jpeg.jpeg", size: 32454 },
    { name: "Whirlpool WOD51HZES 30 Double Wall Oven.jpg", size: 44076 },
    { name: "Appliances.jpg", size: 198485 }
];

function uploadFileToWix(filePath, uploadUrl) {
    return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(filePath);
        const url = new URL(uploadUrl);
        
        const boundary = '----WebKitFormBoundary' + Date.now();
        const filename = path.basename(filePath);
        
        let body = '';
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
        body += `Content-Type: image/jpeg\r\n\r\n`;
        
        const bodyStart = Buffer.from(body, 'utf8');
        const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
        const totalLength = bodyStart.length + fileData.length + bodyEnd.length;
        
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': totalLength
            }
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
        req.write(bodyStart);
        req.write(fileData);
        req.write(bodyEnd);
        req.end();
    });
}

async function generateUploadUrl(fileName, sizeInBytes) {
    // This would need to call Wix MCP - for now, user needs to provide URLs or we can generate them separately
    throw new Error('Generate upload URLs using Wix MCP first, then update this script');
}

async function uploadBatch() {
    console.log('\n📤 Uploading FINAL BATCH of 13 remaining images...\n');
    console.log('⚠️  Note: Upload URLs need to be generated first using Wix MCP\n');
    console.log('Please generate upload URLs for these 13 images and add them to uploadUrls array:\n');
    images.forEach((img, i) => {
        console.log(`${i + 1}. ${img.name} (${img.size} bytes)`);
    });
}

uploadBatch();

 * Upload FINAL BATCH - Generate URLs and upload all 13 remaining images
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Image metadata
const images = [
    { name: "KitchenAid KODE500ESS 30 Double Wall Ovenjpg.jpg", size: 82509 },
    { name: "LG LDE4413ST 30 Double Wall Oven.jpeg", size: 154861 },
    { name: "Light.jpeg", size: 146428 },
    { name: "Maytag MWO5105BZ 30 Single Wall Ovenjpg.jpg", size: 203164 },
    { name: "microwavemainhp.jpg", size: 20693 },
    { name: "Motor.jpeg", size: 26004 },
    { name: "Motor.jpg", size: 18029 },
    { name: "Samsung NE58K9430WS 30 Wall Oven.jpg", size: 21663 },
    { name: "Savings.jpg", size: 13100 },
    { name: "Smart Home. jpeg.jpeg", size: 22495 },
    { name: "Smart Warm Home. jpeg.jpeg", size: 32454 },
    { name: "Whirlpool WOD51HZES 30 Double Wall Oven.jpg", size: 44076 },
    { name: "Appliances.jpg", size: 198485 }
];

function uploadFileToWix(filePath, uploadUrl) {
    return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(filePath);
        const url = new URL(uploadUrl);
        
        const boundary = '----WebKitFormBoundary' + Date.now();
        const filename = path.basename(filePath);
        
        let body = '';
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
        body += `Content-Type: image/jpeg\r\n\r\n`;
        
        const bodyStart = Buffer.from(body, 'utf8');
        const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
        const totalLength = bodyStart.length + fileData.length + bodyEnd.length;
        
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': totalLength
            }
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
        req.write(bodyStart);
        req.write(fileData);
        req.write(bodyEnd);
        req.end();
    });
}

async function generateUploadUrl(fileName, sizeInBytes) {
    // This would need to call Wix MCP - for now, user needs to provide URLs or we can generate them separately
    throw new Error('Generate upload URLs using Wix MCP first, then update this script');
}

async function uploadBatch() {
    console.log('\n📤 Uploading FINAL BATCH of 13 remaining images...\n');
    console.log('⚠️  Note: Upload URLs need to be generated first using Wix MCP\n');
    console.log('Please generate upload URLs for these 13 images and add them to uploadUrls array:\n');
    images.forEach((img, i) => {
        console.log(`${i + 1}. ${img.name} (${img.size} bytes)`);
    });
}

uploadBatch();



















