const path = require('path');
const fs = require('fs');

// SAFE update: Only update Carrier product image URLs - ENHANCE, NEVER DELETE
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const outputFile = path.join(__dirname, 'carrier-fix-results.txt');

// Clear output file
fs.writeFileSync(outputFile, '');
function log(message) {
    const msg = message + '\n';
    fs.appendFileSync(outputFile, msg);
    console.log(message);
}

log('🔄 SAFE UPDATE: Updating Carrier product images only...');
log('⚠️  RULE: ONLY update imageUrl field - ALL other data preserved');
log('✅ ENHANCEMENT ONLY - Nothing deleted\n');

// Load JSON file
let jsonData;
try {
    log('📄 Loading JSON file...');
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    jsonData = JSON.parse(jsonContent);
    
    // Verify structure
    if (!jsonData.products || !Array.isArray(jsonData.products)) {
        log(`❌ ERROR: JSON structure invalid. Expected { products: [...] }`);
        log(`   Found keys: ${Object.keys(jsonData).join(', ')}`);
        process.exit(1);
    }
    
    log(`✅ Loaded JSON file with ${jsonData.products.length} products`);
    log(`   Structure verified: products array exists\n`);
} catch (error) {
    log(`❌ Error loading JSON file: ${error.message}`);
    log(`   Stack: ${error.stack}`);
    process.exit(1);
}

// Image URLs to use (from user-provided Wix URLs)
const allGlassDoorUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
const antiReflectiveUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';

let updatedAllGlass = 0;
let updatedAntiReflective = 0;
let skipped = 0;

log('🔍 Searching for Carrier products with Motor.jpg...\n');

// Update Carrier products - ONLY the imageUrl field
jsonData.products.forEach(product => {
    // Only update if it's a Carrier product with Motor.jpg
    if (product.name === 'Carrier Refrigeration all glass door' && 
        product.imageUrl === 'Product Placement/Motor.jpg') {
        log(`✅ UPDATING: ${product.name} (ID: ${product.id})`);
        log(`   Old imageUrl: ${product.imageUrl}`);
        log(`   New imageUrl: ${allGlassDoorUrl}`);
        // ONLY update imageUrl - preserve everything else
        product.imageUrl = allGlassDoorUrl;
        updatedAllGlass++;
    } else if (product.name === 'Carrier Refrigeration anti-reflective all glass door' && 
               product.imageUrl === 'Product Placement/Motor.jpg') {
        log(`✅ UPDATING: ${product.name} (ID: ${product.id})`);
        log(`   Old imageUrl: ${product.imageUrl}`);
        log(`   New imageUrl: ${antiReflectiveUrl}`);
        // ONLY update imageUrl - preserve everything else
        product.imageUrl = antiReflectiveUrl;
        updatedAntiReflective++;
    } else if ((product.name === 'Carrier Refrigeration all glass door' || 
                product.name === 'Carrier Refrigeration anti-reflective all glass door') &&
               product.imageUrl !== 'Product Placement/Motor.jpg') {
        skipped++;
    }
});

const totalUpdated = updatedAllGlass + updatedAntiReflective;

if (totalUpdated > 0) {
    // Create backup BEFORE making changes
    const backupPath = jsonPath + '.backup_' + Date.now();
    log(`\n📦 Creating backup...`);
    fs.writeFileSync(backupPath, fs.readFileSync(jsonPath, 'utf8'));
    log(`✅ Backup created: ${path.basename(backupPath)}\n`);
    
    // Save updated JSON file - preserving ALL data, only imageUrl changed
    try {
        log('💾 Writing updated JSON file (preserving all data)...');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        log(`\n📊 SAFE UPDATE complete:`);
        log(`- ✅ Updated "all glass door": ${updatedAllGlass} products`);
        log(`- ✅ Updated "anti-reflective": ${updatedAntiReflective} products`);
        log(`- ⏭️  Skipped (already correct): ${skipped} products`);
        log(`- 📄 JSON file saved successfully`);
        log(`- 🔒 ALL other data preserved (no deletions)`);
        log(`\n📝 Full output saved to: carrier-fix-results.txt`);
    } catch (error) {
        log(`❌ Error saving JSON file: ${error.message}`);
        log(`⚠️  Backup available at: ${path.basename(backupPath)}`);
    }
} else {
    log('\n⚠️  No Carrier products found with Motor.jpg to update');
    const allGlassCount = jsonData.products.filter(p => p.name === 'Carrier Refrigeration all glass door').length;
    const antiReflectiveCount = jsonData.products.filter(p => p.name === 'Carrier Refrigeration anti-reflective all glass door').length;
    log(`   Found ${allGlassCount} "all glass door" products`);
    log(`   Found ${antiReflectiveCount} "anti-reflective" products`);
    log(`\n📝 Full output saved to: carrier-fix-results.txt`);
}

