/**
 * Upload Image to Wix Media Manager
 * 
 * Step 1: Generate upload URL (via Wix MCP - already done)
 * Step 2: Upload file binary to upload URL (this script)
 * Step 3: Get Wix Media URL from response
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Upload a file to Wix using the upload URL
 */
function uploadFileToWix(filePath, uploadUrl, fileName) {
    return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(filePath);
        const url = new URL(uploadUrl);
        
        // Create multipart/form-data boundary
        const boundary = '----WebKitFormBoundary' + Date.now();
        const filename = path.basename(filePath);
        
        // Build multipart body
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
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const result = JSON.parse(data);
                        resolve(result);
                    } catch (e) {
                        resolve({ raw: data, statusCode: res.statusCode });
                    }
                } else {
                    reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        // Write multipart body
        req.write(bodyStart);
        req.write(fileData);
        req.write(bodyEnd);
        req.end();
    });
}

// Test with first image
const testImage = path.join(__dirname, 'Product Placement', 'Appliances.jpg');
const testUploadUrl = process.argv[2]; // Get upload URL from command line

if (!testUploadUrl) {
    console.log('Usage: node do-wix-image-upload.js <uploadUrl>');
    console.log('This script uploads a file binary to the Wix upload URL');
    process.exit(1);
}

console.log('📤 Uploading file to Wix...');
console.log(`File: ${testImage}`);
console.log(`Upload URL: ${testUploadUrl.substring(0, 50)}...`);

uploadFileToWix(testImage, testUploadUrl, 'Appliances.jpg')
    .then(result => {
        console.log('✅ Upload successful!');
        console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
        console.error('❌ Upload failed:', error.message);
        process.exit(1);
    });


 * 
 * Step 1: Generate upload URL (via Wix MCP - already done)
 * Step 2: Upload file binary to upload URL (this script)
 * Step 3: Get Wix Media URL from response
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Upload a file to Wix using the upload URL
 */
function uploadFileToWix(filePath, uploadUrl, fileName) {
    return new Promise((resolve, reject) => {
        const fileData = fs.readFileSync(filePath);
        const url = new URL(uploadUrl);
        
        // Create multipart/form-data boundary
        const boundary = '----WebKitFormBoundary' + Date.now();
        const filename = path.basename(filePath);
        
        // Build multipart body
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
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const result = JSON.parse(data);
                        resolve(result);
                    } catch (e) {
                        resolve({ raw: data, statusCode: res.statusCode });
                    }
                } else {
                    reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        // Write multipart body
        req.write(bodyStart);
        req.write(fileData);
        req.write(bodyEnd);
        req.end();
    });
}

// Test with first image
const testImage = path.join(__dirname, 'Product Placement', 'Appliances.jpg');
const testUploadUrl = process.argv[2]; // Get upload URL from command line

if (!testUploadUrl) {
    console.log('Usage: node do-wix-image-upload.js <uploadUrl>');
    console.log('This script uploads a file binary to the Wix upload URL');
    process.exit(1);
}

console.log('📤 Uploading file to Wix...');
console.log(`File: ${testImage}`);
console.log(`Upload URL: ${testUploadUrl.substring(0, 50)}...`);

uploadFileToWix(testImage, testUploadUrl, 'Appliances.jpg')
    .then(result => {
        console.log('✅ Upload successful!');
        console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
        console.error('❌ Upload failed:', error.message);
        process.exit(1);
    });

