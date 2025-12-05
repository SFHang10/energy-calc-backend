const path = require('path');
const fs = require('fs');

// EXACT same pattern as safe_sync_images_to_json.js
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const logFile = path.join(__dirname, 'carrier-fix-log.txt');

// Write to both console and file
function log(msg) {
    const message = msg + '\n';
    fs.appendFileSync(logFile, message);
    console.log(msg);
}

// Clear log file
fs.writeFileSync(logFile, '');

log('🔄 Updating Carrier products in JSON (exact pattern)...');
log(`Started at: ${new Date().toISOString()}\n`);

// Load JSON file
let jsonData;
try {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    jsonData = JSON.parse(jsonContent);
    log(`✅ Loaded JSON file with ${jsonData.products.length} products`);
} catch (error) {
    log(`❌ Error loading JSON file: ${error.message}`);
    process.exit(1);
}

// Create backup
const backupPath = jsonPath + '.backup_' + Date.now();
fs.copyFileSync(jsonPath, backupPath);
log(`📦 Backup created: ${path.basename(backupPath)}\n`);

// Wix URLs
const allGlassDoorUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
const antiReflectiveUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';

let updatedCount = 0;

// Update ONLY Carrier products with Motor.jpg
jsonData.products.forEach(product => {
    if (product.name === 'Carrier Refrigeration all glass door' && 
        product.imageUrl === 'Product Placement/Motor.jpg') {
        log(`✅ Updating: ${product.name} (ID: ${product.id})`);
        product.imageUrl = allGlassDoorUrl;
        updatedCount++;
    } else if (product.name === 'Carrier Refrigeration anti-reflective all glass door' && 
               product.imageUrl === 'Product Placement/Motor.jpg') {
        log(`✅ Updating: ${product.name} (ID: ${product.id})`);
        product.imageUrl = antiReflectiveUrl;
        updatedCount++;
    }
});

log(`\nFound ${updatedCount} Carrier products to update`);

// Save updated JSON file (EXACT same pattern)
try {
    log(`\n💾 Attempting to stringify JSON (${jsonData.products.length} products)...`);
    const jsonString = JSON.stringify(jsonData, null, 2);
    log(`✅ Stringified successfully (${jsonString.length} characters)`);
    
    log(`💾 Writing to file: ${jsonPath}...`);
    fs.writeFileSync(jsonPath, jsonString);
    log(`✅ File written successfully`);
    
    log(`\n✅ Updated ${updatedCount} Carrier products`);
    log(`📄 JSON file saved successfully`);
    log(`📝 Full log: ${logFile}`);
    log(`\n🔄 Please restart the server to see updated images`);
} catch (error) {
    log(`❌ Error saving JSON file: ${error.message}`);
    log(`Stack: ${error.stack}`);
    process.exit(1);
}

