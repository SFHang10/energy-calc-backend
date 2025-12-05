/**
 * Script to fix Carrier and Baxi product images
 * Uses the EXACT pattern from update-athen-images.js and update-tempest-images.js
 * Fixes products that were incorrectly assigned Motor.jpg
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

// Image mappings - products that need fixing
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

// Load database (EXACT pattern from working scripts)
let database;
try {
    console.log('📖 Loading database...');
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    database = JSON.parse(databaseContent);
    console.log(`✅ Loaded database with ${database.products?.length || 0} products\n`);
} catch (error) {
    console.error('❌ Error loading database:', error.message);
    process.exit(1);
}

// Update products (EXACT pattern from working scripts)
console.log('🔄 Fixing product images that were incorrectly assigned Motor.jpg...\n');
let updatedCount = 0;

database.products.forEach(product => {
    const productName = product.name || '';
    const currentImage = product.imageUrl || '';
    
    // Only update if currently has Motor.jpg (the incorrect image)
    if (currentImage === 'Product Placement/Motor.jpg' || currentImage === 'product-placement/Motor.jpg') {
        // Find matching product
        let match = null;
        if (productName === 'Carrier Refrigeration all glass door') {
            match = IMAGE_UPDATES['Carrier Refrigeration all glass door'];
        } else if (productName === 'Carrier Refrigeration anti-reflective all glass door') {
            match = IMAGE_UPDATES['Carrier Refrigeration anti-reflective all glass door'];
        } else if (productName === 'Baxi Solarflo (In-Roof)') {
            match = IMAGE_UPDATES['Baxi Solarflo (In-Roof)'];
        }
        
        if (match) {
            console.log(`📸 Fixing: ${productName}`);
            console.log(`   ID: ${product.id}`);
            console.log(`   Old imageUrl: ${currentImage}`);
            
            // Update imageUrl (EXACT pattern from working scripts)
            product.imageUrl = match.imageUrl;
            
            // Update images array (EXACT pattern from working scripts)
            let images = [];
            try {
                images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
            } catch (e) {
                images = [];
            }
            
            // Remove old images and add new one at the beginning
            images = [match.imageUrl];
            product.images = JSON.stringify(images);
            
            console.log(`   New imageUrl: ${product.imageUrl}`);
            console.log(`   ✅ Updated successfully\n`);
            updatedCount++;
        }
    }
});

if (updatedCount === 0) {
    console.log('⚠️  No products found with Motor.jpg that need fixing.\n');
    
    // Check what images these products currently have
    console.log('🔍 Checking current image status:\n');
    const productsToCheck = [
        'Carrier Refrigeration all glass door',
        'Carrier Refrigeration anti-reflective all glass door',
        'Baxi Solarflo (In-Roof)'
    ];
    
    productsToCheck.forEach(checkName => {
        const product = database.products.find(p => p.name === checkName);
        if (product) {
            console.log(`  - ${checkName}:`);
            console.log(`    ID: ${product.id}`);
            console.log(`    Current imageUrl: ${product.imageUrl || 'NONE'}\n`);
        } else {
            console.log(`  - ${checkName}: NOT FOUND\n`);
        }
    });
} else {
    // Create backup (EXACT pattern from working scripts)
    const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_carrier_baxi_fix_${Date.now()}.json`);
    console.log(`💾 Creating backup: ${path.basename(backupPath)}...`);
    fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
    console.log(`✅ Backup created\n`);
    
    // Save updated database (EXACT pattern from working scripts)
    try {
        console.log(`💾 Saving updated database...`);
        const jsonString = JSON.stringify(database, null, 2);
        fs.writeFileSync(FULL_DATABASE_PATH, jsonString);
        console.log(`✅ Database updated successfully!`);
        console.log(`   Updated ${updatedCount} product(s)`);
        console.log(`   Total products: ${database.products.length}`);
        console.log(`\n🔄 Please restart the server to clear the cache and see updated images`);
    } catch (error) {
        console.error(`❌ Error saving database: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        process.exit(1);
    }
}

