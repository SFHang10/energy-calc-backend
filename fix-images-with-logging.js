/**
 * Fix Carrier and Baxi images WITH file-based logging
 * This will show us what's happening even if console output is suppressed
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const LOG_FILE = path.join(__dirname, 'fix-images-log.txt');

// Clear previous log
fs.writeFileSync(LOG_FILE, '');
function log(msg) {
    const message = new Date().toISOString() + ' - ' + msg + '\n';
    fs.appendFileSync(LOG_FILE, message);
    console.log(msg); // Also try console
}

log('🚀 Script started');
log(`📁 Working directory: ${process.cwd()}`);
log(`📁 Script directory: ${__dirname}`);
log(`📄 JSON path: ${FULL_DATABASE_PATH}`);
log(`📝 Log file: ${LOG_FILE}`);
log('');

// Image mappings
const IMAGE_UPDATES = {
    'Carrier Refrigeration all glass door': {
        imageUrl: 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg'
    },
    'Carrier Refrigeration anti-reflective all glass door': {
        imageUrl: 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg'
    },
    'Baxi Solarflo (In-Roof)': {
        imageUrl: 'Product Placement/Baxi-STS-1.jpeg'
    }
};

// Load database
let database;
try {
    log('📖 Loading JSON file...');
    if (!fs.existsSync(FULL_DATABASE_PATH)) {
        log(`❌ ERROR: File not found: ${FULL_DATABASE_PATH}`);
        process.exit(1);
    }
    
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    database = JSON.parse(databaseContent);
    log(`✅ Loaded: ${database.products?.length || 0} products`);
    log('');
} catch (error) {
    log(`❌ Error loading: ${error.message}`);
    log(`   Stack: ${error.stack}`);
    process.exit(1);
}

// Update products
log('🔄 Searching for products to fix...');
let updatedCount = 0;

database.products.forEach((product, index) => {
    const productName = product.name || '';
    const currentImage = product.imageUrl || '';
    
    // Only update if currently has Motor.jpg
    if (currentImage === 'Product Placement/Motor.jpg' || currentImage === 'product-placement/Motor.jpg') {
        let match = null;
        if (productName === 'Carrier Refrigeration all glass door') {
            match = IMAGE_UPDATES['Carrier Refrigeration all glass door'];
        } else if (productName === 'Carrier Refrigeration anti-reflective all glass door') {
            match = IMAGE_UPDATES['Carrier Refrigeration anti-reflective all glass door'];
        } else if (productName === 'Baxi Solarflo (In-Roof)') {
            match = IMAGE_UPDATES['Baxi Solarflo (In-Roof)'];
        }
        
        if (match) {
            log(`📸 FIXING: ${productName}`);
            log(`   ID: ${product.id}`);
            log(`   Old: ${currentImage}`);
            log(`   New: ${match.imageUrl}`);
            
            product.imageUrl = match.imageUrl;
            product.images = JSON.stringify([match.imageUrl]);
            
            updatedCount++;
            log(`   ✅ Updated\n`);
        }
    }
});

log(`\n📊 Found ${updatedCount} products to update`);

if (updatedCount > 0) {
    // Create backup
    const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_fix_${Date.now()}.json`);
    log(`\n💾 Creating backup: ${path.basename(backupPath)}`);
    try {
        fs.copyFileSync(FULL_DATABASE_PATH, backupPath);
        log(`✅ Backup created`);
    } catch (error) {
        log(`❌ Backup failed: ${error.message}`);
        process.exit(1);
    }
    
    // Save updated database
    log(`\n💾 Saving updated database...`);
    try {
        const jsonString = JSON.stringify(database, null, 2);
        log(`✅ Stringified: ${jsonString.length} characters`);
        
        fs.writeFileSync(FULL_DATABASE_PATH, jsonString);
        log(`✅ File written successfully`);
        
        // Verify write
        const verify = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
        const verifyData = JSON.parse(verify);
        const verifyCarrier = verifyData.products.find(p => p.name === 'Carrier Refrigeration all glass door');
        if (verifyCarrier && verifyCarrier.imageUrl.includes('c123de_e8e3856e5d4f4043bcae90d8198038ed')) {
            log(`✅ VERIFICATION: Carrier image updated correctly`);
        } else {
            log(`❌ VERIFICATION FAILED: Image not updated`);
        }
        
        log(`\n✅ SUCCESS: Updated ${updatedCount} products`);
        log(`📄 Database saved: ${FULL_DATABASE_PATH}`);
        log(`💾 Backup: ${path.basename(backupPath)}`);
        log(`\n🔄 Restart server to see changes`);
    } catch (error) {
        log(`❌ Save failed: ${error.message}`);
        log(`   Stack: ${error.stack}`);
        process.exit(1);
    }
} else {
    log(`\n⚠️  No products found with Motor.jpg that need fixing`);
    
    // Check current status
    log(`\n🔍 Current image status:`);
    Object.keys(IMAGE_UPDATES).forEach(name => {
        const product = database.products.find(p => p.name === name);
        if (product) {
            log(`  - ${name}:`);
            log(`    ImageUrl: ${product.imageUrl || 'NONE'}`);
        } else {
            log(`  - ${name}: NOT FOUND`);
        }
    });
}

log(`\n✅ Script completed`);
log(`📝 Full log saved to: ${LOG_FILE}`);

