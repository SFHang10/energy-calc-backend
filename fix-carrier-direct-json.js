/**
 * Script to update Carrier Refrigeration product images
 * Uses the EXACT pattern from update-athen-images.js and update-tempest-images.js
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

// Image mappings - Wix URLs provided by user
const IMAGE_UPDATES = {
    'Carrier Refrigeration all glass door': {
        imageUrl: 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg'
    },
    'Carrier Refrigeration anti-reflective all glass door': {
        imageUrl: 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg'
    }
};

// Load database (EXACT pattern from working scripts)
let database;
try {
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    database = JSON.parse(databaseContent);
    console.log(`✅ Loaded database with ${database.products?.length || 0} products\n`);
} catch (error) {
    console.error('❌ Error loading database:', error.message);
    process.exit(1);
}

// Update products (EXACT pattern from working scripts)
console.log('🔄 Updating Carrier product images...\n');
let updatedCount = 0;

database.products.forEach(product => {
    const productName = product.name || '';
    
    // Find matching product - check for exact matches
    let match = null;
    if (productName === 'Carrier Refrigeration all glass door') {
        match = IMAGE_UPDATES['Carrier Refrigeration all glass door'];
    } else if (productName === 'Carrier Refrigeration anti-reflective all glass door') {
        match = IMAGE_UPDATES['Carrier Refrigeration anti-reflective all glass door'];
    }
    
    if (match) {
        console.log(`📸 Updating: ${productName}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Old imageUrl: ${product.imageUrl || 'NONE'}`);
        
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
});

console.log(`\n🔍 Found ${updatedCount} Carrier products to update`);

if (updatedCount === 0) {
    console.log('⚠️  No matching products found. Searching for Carrier products...\n');
    const carrierProducts = database.products.filter(p => 
        p.name && p.name.toLowerCase().includes('carrier')
    );
    
    if (carrierProducts.length > 0) {
        console.log('Found Carrier products:');
        carrierProducts.forEach(p => {
            console.log(`  - ${p.id}: ${p.name}`);
            console.log(`    Current imageUrl: ${p.imageUrl || 'NONE'}\n`);
        });
    } else {
        console.log('❌ No Carrier products found in database.');
    }
} else {
    // Create backup (EXACT pattern from working scripts)
    const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_carrier_images_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
    console.log(`💾 Created backup: ${path.basename(backupPath)}\n`);
    
    // Save updated database (EXACT pattern from working scripts)
    try {
        console.log(`💾 Saving updated database...`);
        const jsonString = JSON.stringify(database, null, 2);
        console.log(`✅ JSON stringified (${jsonString.length} characters)`);
        
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

