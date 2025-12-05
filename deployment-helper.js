const fs = require('fs');
const path = require('path');

console.log('\n🚀 DEPLOYMENT HELPER');
console.log('='.repeat(70));
console.log('');

// Get current directory
const currentDir = __dirname;
const projectRoot = currentDir;

// Files to deploy
const filesToDeploy = {
    database: {
        source: path.join(projectRoot, 'FULL-DATABASE-5554.json'),
        size: 0,
        exists: false
    },
    imagesFolder: {
        source: path.join(projectRoot, 'Product Placement'),
        size: 0,
        fileCount: 0,
        exists: false
    }
};

// Check database file
if (fs.existsSync(filesToDeploy.database.source)) {
    const stats = fs.statSync(filesToDeploy.database.source);
    filesToDeploy.database.size = stats.size;
    filesToDeploy.database.exists = true;
}

// Check images folder
if (fs.existsSync(filesToDeploy.imagesFolder.source)) {
    const imageFiles = fs.readdirSync(filesToDeploy.imagesFolder.source)
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    
    let totalSize = 0;
    imageFiles.forEach(file => {
        const filePath = path.join(filesToDeploy.imagesFolder.source, file);
        totalSize += fs.statSync(filePath).size;
    });
    
    filesToDeploy.imagesFolder.size = totalSize;
    filesToDeploy.imagesFolder.fileCount = imageFiles.length;
    filesToDeploy.imagesFolder.exists = true;
}

// Display deployment package info
console.log('📦 DEPLOYMENT PACKAGE:');
console.log('');

if (filesToDeploy.database.exists) {
    const dbSizeMB = (filesToDeploy.database.size / 1024 / 1024).toFixed(2);
    console.log(`✅ Database: FULL-DATABASE-5554.json`);
    console.log(`   Size: ${dbSizeMB} MB`);
    console.log(`   Location: ${filesToDeploy.database.source}`);
} else {
    console.log('❌ Database file not found!');
}

console.log('');

if (filesToDeploy.imagesFolder.exists) {
    const imgSizeMB = (filesToDeploy.imagesFolder.size / 1024 / 1024).toFixed(2);
    console.log(`✅ Images Folder: Product Placement/`);
    console.log(`   Files: ${filesToDeploy.imagesFolder.fileCount} images`);
    console.log(`   Total Size: ${imgSizeMB} MB`);
    console.log(`   Location: ${filesToDeploy.imagesFolder.source}`);
} else {
    console.log('❌ Images folder not found!');
}

console.log('');
console.log('='.repeat(70));
console.log('');
console.log('📋 DEPLOYMENT OPTIONS:');
console.log('');
console.log('Based on your setup, you have:');
console.log('  • Wix Site: cfa82ec2-a075-4152-9799-6a1dd5c01ef4');
console.log('  • Backend Server: energy-cal-backend (Node.js, port 4000)');
console.log('');
console.log('🔍 WHERE IS YOUR PRODUCTION BACKEND HOSTED?');
console.log('');
console.log('Option A: Self-hosted server / VPS (SSH access)');
console.log('Option B: Cloud hosting (Heroku, Railway, Render, etc.)');
console.log('Option C: Same server as your local development');
console.log('Option D: Not sure / Need help identifying');
console.log('');
console.log('Once you know where your backend runs, you can:');
console.log('  1. Upload FULL-DATABASE-5554.json to backend server');
console.log('  2. Upload Product Placement/ folder to backend server');
console.log('  3. Test product pages to verify images load');
console.log('');
console.log('💡 Next Steps:');
console.log('  - If you know your server location, I can create specific deployment commands');
console.log('  - If using Wix, images can be uploaded via Wix Media Manager');
console.log('  - If backend is separate, you\'ll need FTP/SFTP or deployment service');
console.log('');

// Generate deployment checklist
console.log('📝 DEPLOYMENT CHECKLIST:');
console.log('');
console.log('[ ] Backup current production database');
console.log('[ ] Upload FULL-DATABASE-5554.json to production');
console.log('[ ] Upload Product Placement/ folder to production');
console.log('[ ] Verify image paths are accessible via HTTP');
console.log('[ ] Test one product page with image');
console.log('[ ] Test calculator widget still works');
console.log('[ ] Monitor for any errors');
console.log('');
console.log('✅ Ready to proceed once you identify your production server location!');
console.log('');


const path = require('path');

console.log('\n🚀 DEPLOYMENT HELPER');
console.log('='.repeat(70));
console.log('');

// Get current directory
const currentDir = __dirname;
const projectRoot = currentDir;

// Files to deploy
const filesToDeploy = {
    database: {
        source: path.join(projectRoot, 'FULL-DATABASE-5554.json'),
        size: 0,
        exists: false
    },
    imagesFolder: {
        source: path.join(projectRoot, 'Product Placement'),
        size: 0,
        fileCount: 0,
        exists: false
    }
};

// Check database file
if (fs.existsSync(filesToDeploy.database.source)) {
    const stats = fs.statSync(filesToDeploy.database.source);
    filesToDeploy.database.size = stats.size;
    filesToDeploy.database.exists = true;
}

// Check images folder
if (fs.existsSync(filesToDeploy.imagesFolder.source)) {
    const imageFiles = fs.readdirSync(filesToDeploy.imagesFolder.source)
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    
    let totalSize = 0;
    imageFiles.forEach(file => {
        const filePath = path.join(filesToDeploy.imagesFolder.source, file);
        totalSize += fs.statSync(filePath).size;
    });
    
    filesToDeploy.imagesFolder.size = totalSize;
    filesToDeploy.imagesFolder.fileCount = imageFiles.length;
    filesToDeploy.imagesFolder.exists = true;
}

// Display deployment package info
console.log('📦 DEPLOYMENT PACKAGE:');
console.log('');

if (filesToDeploy.database.exists) {
    const dbSizeMB = (filesToDeploy.database.size / 1024 / 1024).toFixed(2);
    console.log(`✅ Database: FULL-DATABASE-5554.json`);
    console.log(`   Size: ${dbSizeMB} MB`);
    console.log(`   Location: ${filesToDeploy.database.source}`);
} else {
    console.log('❌ Database file not found!');
}

console.log('');

if (filesToDeploy.imagesFolder.exists) {
    const imgSizeMB = (filesToDeploy.imagesFolder.size / 1024 / 1024).toFixed(2);
    console.log(`✅ Images Folder: Product Placement/`);
    console.log(`   Files: ${filesToDeploy.imagesFolder.fileCount} images`);
    console.log(`   Total Size: ${imgSizeMB} MB`);
    console.log(`   Location: ${filesToDeploy.imagesFolder.source}`);
} else {
    console.log('❌ Images folder not found!');
}

console.log('');
console.log('='.repeat(70));
console.log('');
console.log('📋 DEPLOYMENT OPTIONS:');
console.log('');
console.log('Based on your setup, you have:');
console.log('  • Wix Site: cfa82ec2-a075-4152-9799-6a1dd5c01ef4');
console.log('  • Backend Server: energy-cal-backend (Node.js, port 4000)');
console.log('');
console.log('🔍 WHERE IS YOUR PRODUCTION BACKEND HOSTED?');
console.log('');
console.log('Option A: Self-hosted server / VPS (SSH access)');
console.log('Option B: Cloud hosting (Heroku, Railway, Render, etc.)');
console.log('Option C: Same server as your local development');
console.log('Option D: Not sure / Need help identifying');
console.log('');
console.log('Once you know where your backend runs, you can:');
console.log('  1. Upload FULL-DATABASE-5554.json to backend server');
console.log('  2. Upload Product Placement/ folder to backend server');
console.log('  3. Test product pages to verify images load');
console.log('');
console.log('💡 Next Steps:');
console.log('  - If you know your server location, I can create specific deployment commands');
console.log('  - If using Wix, images can be uploaded via Wix Media Manager');
console.log('  - If backend is separate, you\'ll need FTP/SFTP or deployment service');
console.log('');

// Generate deployment checklist
console.log('📝 DEPLOYMENT CHECKLIST:');
console.log('');
console.log('[ ] Backup current production database');
console.log('[ ] Upload FULL-DATABASE-5554.json to production');
console.log('[ ] Upload Product Placement/ folder to production');
console.log('[ ] Verify image paths are accessible via HTTP');
console.log('[ ] Test one product page with image');
console.log('[ ] Test calculator widget still works');
console.log('[ ] Monitor for any errors');
console.log('');
console.log('✅ Ready to proceed once you identify your production server location!');
console.log('');




















