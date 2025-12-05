const fs = require('fs');
const path = require('path');

console.log('\n🔄 UPDATING CFW501 AND CFW701 TO EDITED_EDITED IMAGES');
console.log('='.repeat(70));
console.log('');

// Database path
const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const cfw501ImagePath = 'Product Placement/CFW501 Series Frequency Inverters - HVAC Drive_edited_edited.jpg';
const cfw701ImagePath = 'Product Placement/cfw701_edited_edited.jpg';

// Load database
console.log('📂 Loading FULL-DATABASE-5554.json...');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
console.log(`✅ Loaded ${data.products.length} products\n`);

// Create backup
const timestamp = Date.now();
const backupPath = path.join(__dirname, `FULL-DATABASE-5554-CFW-EDITED2-BACKUP-${timestamp}.json`);
fs.copyFileSync(dbPath, backupPath);
console.log(`💾 Backup created: FULL-DATABASE-5554-CFW-EDITED2-BACKUP-${timestamp}.json\n`);

// Find and update CFW501 products
console.log('🔍 Finding CFW501 products...\n');
let cfw501Updated = 0;
const cfw501Products = [];

data.products.forEach(product => {
    const name = product.name ? product.name.toLowerCase() : '';
    
    if (name.includes('cfw501') || name.includes('cfw 501')) {
        cfw501Products.push(product);
        
        if (product.imageUrl !== cfw501ImagePath) {
            product.imageUrl = cfw501ImagePath;
            product.imageSource = 'cfw501-edited-edited';
            product.imageUpdated = new Date().toISOString();
            cfw501Updated++;
            console.log(`   ✅ ${product.name}`);
            console.log(`      Image: ${cfw501ImagePath}`);
        }
    }
});

console.log(`\n📊 Found ${cfw501Products.length} CFW501 products`);
console.log(`✅ Updated ${cfw501Updated} CFW501 products to edited_edited image\n`);

// Find and update CFW701 products
console.log('🔍 Finding CFW701 products...\n');
let cfw701Updated = 0;
const cfw701Products = [];

data.products.forEach(product => {
    const name = product.name ? product.name.toLowerCase() : '';
    
    if (name.includes('cfw701') || name.includes('cfw 701')) {
        cfw701Products.push(product);
        
        if (product.imageUrl !== cfw701ImagePath) {
            product.imageUrl = cfw701ImagePath;
            product.imageSource = 'cfw701-edited-edited';
            product.imageUpdated = new Date().toISOString();
            cfw701Updated++;
            console.log(`   ✅ ${product.name}`);
            console.log(`      Image: ${cfw701ImagePath}`);
        }
    }
});

console.log(`\n📊 Found ${cfw701Products.length} CFW701 products`);
console.log(`✅ Updated ${cfw701Updated} CFW701 products to edited_edited image\n`);

// Save database
if (cfw501Updated > 0 || cfw701Updated > 0) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log(`✅ Database saved with CFW edited_edited images!`);
    console.log(`💾 Backup: ${path.basename(backupPath)}\n`);
    
    console.log('📋 Summary:');
    console.log(`   CFW501 products updated: ${cfw501Updated}`);
    console.log(`   CFW701 products updated: ${cfw701Updated}`);
    console.log(`   Total updated: ${cfw501Updated + cfw701Updated}\n`);
    
    // Verify updates
    console.log('🔍 Verifying updates...\n');
    const verify501 = data.products.find(p => p.name && p.name.toLowerCase().includes('cfw501'));
    const verify701 = data.products.find(p => p.name && p.name.toLowerCase().includes('cfw701'));
    
    if (verify501) {
        console.log(`   ✅ CFW501: ${verify501.name}`);
        console.log(`      Image: ${verify501.imageUrl}`);
    }
    
    if (verify701) {
        console.log(`   ✅ CFW701: ${verify701.name}`);
        console.log(`      Image: ${verify701.imageUrl}`);
    }
    
    console.log('\n✅ All CFW products now have edited_edited images!\n');
} else {
    console.log('ℹ️  No CFW products needed updating (already correct)\n');
}







