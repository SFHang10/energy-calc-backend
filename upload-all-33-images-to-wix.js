/**
 * Complete Automated Upload: All 33 Images to Wix Media Manager
 * 
 * This script will:
 * 1. Generate upload URLs for all images (via Wix MCP API calls)
 * 2. Upload each image file to Wix
 * 3. Get Wix Media URLs
 * 4. Create mapping: local path → Wix Media URL
 * 5. Update database with Wix Media URLs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const siteId = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
const imagesFolder = path.join(__dirname, 'Product Placement');
const databaseFile = path.join(__dirname, 'FULL-DATABASE-5554.json');

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
            mimeType: mimeTypes[ext] || 'image/jpeg',
            localPath: `Product Placement/${file}`
        };
    });

console.log('\n🌐 UPLOAD ALL 33 IMAGES TO WIX MEDIA MANAGER');
console.log('='.repeat(70));
console.log('');
console.log(`📸 Found ${imageFiles.length} images to upload`);
console.log('');

// Image mapping: localPath -> Wix Media URL
const imageMapping = {};
let uploadedCount = 0;

/**
 * Upload file to Wix using upload URL
 */
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

        req.write(bodyStart);
        req.write(fileData);
        req.write(bodyEnd);
        req.end();
    });
}

/**
 * Update database with Wix Media URLs
 */
function updateDatabase(wixMediaMap) {
    console.log('\n📝 Updating database with Wix Media URLs...');
    
    const dbContent = fs.readFileSync(databaseFile, 'utf8');
    const db = JSON.parse(dbContent);
    
    let updatedCount = 0;
    
    db.products.forEach(product => {
        const localPath = product.imageUrl;
        if (localPath && wixMediaMap[localPath]) {
            const wixUrl = wixMediaMap[localPath];
            product.imageUrl = wixUrl;
            if (product.image_url) {
                product.image_url = wixUrl;
            }
            updatedCount++;
        }
    });
    
    // Create backup
    const backupFile = databaseFile.replace('.json', `-BACKUP-WIX-UPLOAD-${Date.now()}.json`);
    fs.copyFileSync(databaseFile, backupFile);
    console.log(`💾 Backup created: ${path.basename(backupFile)}`);
    
    // Save updated database
    fs.writeFileSync(databaseFile, JSON.stringify(db, null, 2), 'utf8');
    
    console.log(`✅ Database updated: ${updatedCount} products now have Wix Media URLs`);
    console.log(`📁 Updated database saved: ${path.basename(databaseFile)}`);
}

console.log('📋 IMPORTANT: This script requires Wix API calls.');
console.log('   I will need to call Wix MCP for each image to generate upload URLs.');
console.log('');
console.log('💡 Strategy:');
console.log('   1. Display image list');
console.log('   2. For each image, generate upload URL (via Wix MCP)');
console.log('   3. Upload file binary to Wix');
console.log('   4. Collect all Wix Media URLs');
console.log('   5. Update database');
console.log('');
console.log('⏳ This will take several minutes for 33 images...');
console.log('');
console.log('🚀 Starting upload process...');
console.log('');

// Export for use
module.exports = {
    siteId,
    imageFiles,
    databaseFile,
    uploadFileToWix,
    updateDatabase,
    imageMapping
};


 * Complete Automated Upload: All 33 Images to Wix Media Manager
 * 
 * This script will:
 * 1. Generate upload URLs for all images (via Wix MCP API calls)
 * 2. Upload each image file to Wix
 * 3. Get Wix Media URLs
 * 4. Create mapping: local path → Wix Media URL
 * 5. Update database with Wix Media URLs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const siteId = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
const imagesFolder = path.join(__dirname, 'Product Placement');
const databaseFile = path.join(__dirname, 'FULL-DATABASE-5554.json');

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
            mimeType: mimeTypes[ext] || 'image/jpeg',
            localPath: `Product Placement/${file}`
        };
    });

console.log('\n🌐 UPLOAD ALL 33 IMAGES TO WIX MEDIA MANAGER');
console.log('='.repeat(70));
console.log('');
console.log(`📸 Found ${imageFiles.length} images to upload`);
console.log('');

// Image mapping: localPath -> Wix Media URL
const imageMapping = {};
let uploadedCount = 0;

/**
 * Upload file to Wix using upload URL
 */
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

        req.write(bodyStart);
        req.write(fileData);
        req.write(bodyEnd);
        req.end();
    });
}

/**
 * Update database with Wix Media URLs
 */
function updateDatabase(wixMediaMap) {
    console.log('\n📝 Updating database with Wix Media URLs...');
    
    const dbContent = fs.readFileSync(databaseFile, 'utf8');
    const db = JSON.parse(dbContent);
    
    let updatedCount = 0;
    
    db.products.forEach(product => {
        const localPath = product.imageUrl;
        if (localPath && wixMediaMap[localPath]) {
            const wixUrl = wixMediaMap[localPath];
            product.imageUrl = wixUrl;
            if (product.image_url) {
                product.image_url = wixUrl;
            }
            updatedCount++;
        }
    });
    
    // Create backup
    const backupFile = databaseFile.replace('.json', `-BACKUP-WIX-UPLOAD-${Date.now()}.json`);
    fs.copyFileSync(databaseFile, backupFile);
    console.log(`💾 Backup created: ${path.basename(backupFile)}`);
    
    // Save updated database
    fs.writeFileSync(databaseFile, JSON.stringify(db, null, 2), 'utf8');
    
    console.log(`✅ Database updated: ${updatedCount} products now have Wix Media URLs`);
    console.log(`📁 Updated database saved: ${path.basename(databaseFile)}`);
}

console.log('📋 IMPORTANT: This script requires Wix API calls.');
console.log('   I will need to call Wix MCP for each image to generate upload URLs.');
console.log('');
console.log('💡 Strategy:');
console.log('   1. Display image list');
console.log('   2. For each image, generate upload URL (via Wix MCP)');
console.log('   3. Upload file binary to Wix');
console.log('   4. Collect all Wix Media URLs');
console.log('   5. Update database');
console.log('');
console.log('⏳ This will take several minutes for 33 images...');
console.log('');
console.log('🚀 Starting upload process...');
console.log('');

// Export for use
module.exports = {
    siteId,
    imageFiles,
    databaseFile,
    uploadFileToWix,
    updateDatabase,
    imageMapping
};




















