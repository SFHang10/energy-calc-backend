const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const outputFile = path.join(__dirname, 'carrier-fix-results.txt');

fs.writeFileSync(outputFile, '');
function log(message) {
    const msg = message + '\n';
    fs.appendFileSync(outputFile, msg);
    console.log(message);
}

log('🔄 TARGETED UPDATE: Only Carrier products, preserving all Motor.jpg for other products');
log('='.repeat(70));
log('');

// Load JSON
let jsonData;
try {
    log('📄 Loading JSON file...');
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    jsonData = JSON.parse(jsonContent);
    
    if (!jsonData.products || !Array.isArray(jsonData.products)) {
        log(`❌ ERROR: JSON structure invalid. Expected { products: [...] }`);
        process.exit(1);
    }
    
    log(`✅ Loaded ${jsonData.products.length} products\n`);
} catch (error) {
    log(`❌ Error loading JSON: ${error.message}`);
    process.exit(1);
}

// Create backup
const backupPath = jsonPath + '.backup_' + Date.now();
log('📦 Creating backup...');
fs.copyFileSync(jsonPath, backupPath);
log(`✅ Backup created: ${path.basename(backupPath)}\n`);

// Wix URLs
const allGlassDoorUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
const antiReflectiveUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';

let updatedAllGlass = 0;
let updatedAntiReflective = 0;
let skipped = 0;

log('🔍 Searching for Carrier products ONLY...\n');

// ONLY update Carrier products - very specific matching
jsonData.products.forEach(product => {
    // Exact match for "Carrier Refrigeration all glass door" with Motor.jpg
    if (product.name === 'Carrier Refrigeration all glass door' && 
        product.imageUrl === 'Product Placement/Motor.jpg') {
        log(`✅ UPDATING: ${product.name} (ID: ${product.id})`);
        log(`   Old: ${product.imageUrl}`);
        log(`   New: ${allGlassDoorUrl}\n`);
        product.imageUrl = allGlassDoorUrl;
        updatedAllGlass++;
    }
    // Exact match for "Carrier Refrigeration anti-reflective all glass door" with Motor.jpg
    else if (product.name === 'Carrier Refrigeration anti-reflective all glass door' && 
             product.imageUrl === 'Product Placement/Motor.jpg') {
        log(`✅ UPDATING: ${product.name} (ID: ${product.id})`);
        log(`   Old: ${product.imageUrl}`);
        log(`   New: ${antiReflectiveUrl}\n`);
        product.imageUrl = antiReflectiveUrl;
        updatedAntiReflective++;
    }
    // Count other Carrier products that don't need updating
    else if ((product.name === 'Carrier Refrigeration all glass door' || 
              product.name === 'Carrier Refrigeration anti-reflective all glass door') &&
             product.imageUrl !== 'Product Placement/Motor.jpg') {
        skipped++;
    }
});

const totalUpdated = updatedAllGlass + updatedAntiReflective;

log('\n📊 RESULTS:');
log(`   ✅ Updated "all glass door": ${updatedAllGlass}`);
log(`   ✅ Updated "anti-reflective": ${updatedAntiReflective}`);
log(`   ⏭️  Skipped (already correct): ${skipped}`);
log(`   🔒 All other Motor.jpg products preserved\n`);

if (totalUpdated > 0) {
    try {
        log('💾 Saving JSON file (preserving ALL other data)...');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        log('✅ File saved successfully!\n');
        
        // Verify
        const verify = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const v1 = verify.products.find(p => p.id === 'etl_14_65836');
        const v2 = verify.products.find(p => p.id === 'etl_14_65852');
        log('✅ VERIFICATION:');
        log(`   Product 1 (etl_14_65836): ${v1?.imageUrl}`);
        log(`   Product 2 (etl_14_65852): ${v2?.imageUrl}\n`);
        
        log('✨ Carrier images fixed! All Motor.jpg for other products preserved.');
        log(`📝 Full output: ${outputFile}`);
    } catch (error) {
        log(`❌ Error saving: ${error.message}`);
        log(`⚠️  Backup available: ${path.basename(backupPath)}`);
        process.exit(1);
    }
} else {
    log('⚠️  No Carrier products found with Motor.jpg to update');
    log(`📝 Full output: ${outputFile}`);
}

