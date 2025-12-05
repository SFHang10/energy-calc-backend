const fs = require('fs');
const path = require('path');

console.log('\n🔄 FIXING CARRIER PRODUCT IMAGES');
console.log('='.repeat(70));
console.log('');

// Load database - EXACT same pattern as apply-placeholder-images.js
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
let data;
try {
    const content = fs.readFileSync(dbPath, 'utf8');
    data = JSON.parse(content);
    console.log(`✅ Loaded JSON file`);
    console.log(`   Keys: ${Object.keys(data).join(', ')}`);
    
    if (!data.products) {
        console.error('❌ ERROR: No "products" key found in JSON');
        console.error(`   Available keys: ${Object.keys(data).join(', ')}`);
        process.exit(1);
    }
    
    console.log(`✅ Found products array with ${data.products.length} products`);
    console.log('');
} catch (error) {
    console.error('❌ Error loading JSON:', error.message);
    process.exit(1);
}

// Create backup - EXACT same pattern
const timestamp = Date.now();
const backupPath = path.join(__dirname, `FULL-DATABASE-5554-BACKUP-${timestamp}.json`);
fs.copyFileSync(dbPath, backupPath);
console.log(`💾 Backup created: FULL-DATABASE-5554-BACKUP-${timestamp}.json`);
console.log('');

// Wix URLs provided by user
const allGlassDoorUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
const antiReflectiveUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';

let updatedAllGlass = 0;
let updatedAntiReflective = 0;

console.log('🔍 Updating Carrier products...\n');

// Update Carrier products - ONLY imageUrl field, preserve everything else
data.products.forEach(product => {
    if (product.name === 'Carrier Refrigeration all glass door' && 
        product.imageUrl === 'Product Placement/Motor.jpg') {
        console.log(`✅ UPDATING: ${product.name} (ID: ${product.id})`);
        console.log(`   Old: ${product.imageUrl}`);
        console.log(`   New: ${allGlassDoorUrl}`);
        product.imageUrl = allGlassDoorUrl;
        updatedAllGlass++;
    } else if (product.name === 'Carrier Refrigeration anti-reflective all glass door' && 
               product.imageUrl === 'Product Placement/Motor.jpg') {
        console.log(`✅ UPDATING: ${product.name} (ID: ${product.id})`);
        console.log(`   Old: ${product.imageUrl}`);
        console.log(`   New: ${antiReflectiveUrl}`);
        product.imageUrl = antiReflectiveUrl;
        updatedAntiReflective++;
    }
});

const totalUpdated = updatedAllGlass + updatedAntiReflective;

console.log('\n📊 RESULTS:');
console.log(`   Products updated: ${totalUpdated}`);
console.log(`   - "all glass door": ${updatedAllGlass}`);
console.log(`   - "anti-reflective": ${updatedAntiReflective}\n`);

// Save database - EXACT same pattern
try {
    console.log('💾 Writing file (this may take a moment for large files)...');
    const jsonString = JSON.stringify(data, null, 2);
    console.log(`   JSON string length: ${jsonString.length} characters`);
    fs.writeFileSync(dbPath, jsonString);
    console.log('✅ Database saved with updated Carrier images!');
    console.log(`💾 Backup: ${path.basename(backupPath)}\n`);
    
    // Verify the update worked
    const verify = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const v1 = verify.products.find(p => p.id === 'etl_14_65836');
    const v2 = verify.products.find(p => p.id === 'etl_14_65852');
    console.log('✅ VERIFICATION:');
    console.log(`   Product 1 (etl_14_65836): ${v1?.imageUrl}`);
    console.log(`   Product 2 (etl_14_65852): ${v2?.imageUrl}\n`);
    
    console.log('✨ Carrier images fixed! All products now have correct Wix URLs.\n');
} catch (error) {
    console.error('❌ ERROR saving file:', error.message);
    console.error('   Stack:', error.stack);
    console.error(`\n⚠️  Backup available at: ${path.basename(backupPath)}`);
    process.exit(1);
}

