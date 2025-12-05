const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🔄 Updating ONLY 2 Carrier products...\n');

// Load JSON
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`✅ Loaded ${jsonData.products.length} products\n`);

// Find and update by ID
const product1 = jsonData.products.find(p => p.id === 'etl_14_65836');
const product2 = jsonData.products.find(p => p.id === 'etl_14_65852');

if (product1) {
    console.log(`✅ Found: ${product1.name}`);
    console.log(`   Old: ${product1.imageUrl}`);
    product1.imageUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
    console.log(`   New: ${product1.imageUrl}\n`);
} else {
    console.log('❌ Product 1 not found\n');
}

if (product2) {
    console.log(`✅ Found: ${product2.name}`);
    console.log(`   Old: ${product2.imageUrl}`);
    product2.imageUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';
    console.log(`   New: ${product2.imageUrl}\n`);
} else {
    console.log('❌ Product 2 not found\n');
}

// Save with error handling
try {
    console.log('💾 Saving file...');
    const backupPath = jsonPath + '.backup_' + Date.now();
    fs.copyFileSync(jsonPath, backupPath);
    console.log(`📦 Backup created: ${path.basename(backupPath)}\n`);
    
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log('✅ JSON file saved successfully\n');
    
    // Verify
    const verify = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const v1 = verify.products.find(p => p.id === 'etl_14_65836');
    const v2 = verify.products.find(p => p.id === 'etl_14_65852');
    console.log(`✅ Verification:`);
    console.log(`   Product 1 imageUrl: ${v1?.imageUrl}`);
    console.log(`   Product 2 imageUrl: ${v2?.imageUrl}\n`);
} catch (error) {
    console.error('❌ Error saving:', error.message);
    console.error(error.stack);
    process.exit(1);
}

