const fs = require('fs');
const path = require('path');

console.log('\n🔄 UPDATING HVAC PRODUCT IMAGES');
console.log('='.repeat(70));
console.log('');

// Database paths
const fullDatabasePath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const hvacImagePath = 'Product Placement/HVAC Main.jpeg';

// Load FULL-DATABASE
console.log('📂 Loading FULL-DATABASE-5554.json...');
const data = JSON.parse(fs.readFileSync(fullDatabasePath, 'utf8'));
console.log(`✅ Loaded ${data.products.length} products\n`);

// Create backup
const timestamp = Date.now();
const backupPath = path.join(__dirname, `FULL-DATABASE-5554-HVAC-BACKUP-${timestamp}.json`);
fs.copyFileSync(fullDatabasePath, backupPath);
console.log(`💾 Backup created: FULL-DATABASE-5554-HVAC-BACKUP-${timestamp}.json\n`);

// Find HVAC products that need image update
console.log('🔍 Finding HVAC products...\n');

let updated = 0;
const hvacProducts = [];

data.products.forEach(product => {
    const name = product.name ? product.name.toLowerCase() : '';
    const brand = product.brand ? product.brand.toLowerCase() : '';
    const category = product.category ? product.category.toLowerCase() : '';
    const subcategory = product.subcategory ? product.subcategory.toLowerCase() : '';
    
    // Check if this is an HVAC product
    const isHVAC = name.includes('hvac') || 
                   name.includes('hvac drive') || 
                   name.includes('vlt') || 
                   name.includes('refrigeration drive') || 
                   name.includes('frenic') ||
                   name.includes('optidrive') || 
                   name.includes('chilled beam') ||
                   name.includes('perfect irus') ||
                   name.includes('btwin') ||
                   brand.includes('reznor') ||
                   brand.includes('nortek') ||
                   brand.includes('danfoss') && name.includes('vlt') ||
                   brand.includes('fuji electric') || 
                   brand.includes('invertek') ||
                   category.includes('hvac') ||
                   subcategory.includes('hvac');
    
    if (isHVAC) {
        hvacProducts.push(product);
        
        // Check if it has motor image or needs HVAC image
        const currentImage = product.imageUrl || '';
        const needsUpdate = !currentImage || 
                           currentImage.includes('Motor.jpg') || 
                           currentImage.includes('Motor.jpeg') ||
                           currentImage.includes('motor');
        
        if (needsUpdate) {
            product.imageUrl = hvacImagePath;
            product.imageSource = 'hvac-assigned';
            product.imageUpdated = new Date().toISOString();
            updated++;
        }
    }
});

console.log(`📊 Found ${hvacProducts.length} HVAC products`);
console.log(`✅ Updated ${updated} HVAC products with HVAC Main.jpeg\n`);

if (updated > 0) {
    // Save database
    fs.writeFileSync(fullDatabasePath, JSON.stringify(data, null, 2));
    console.log(`✅ Database saved with HVAC images!`);
    console.log(`💾 Backup: ${path.basename(backupPath)}\n`);
    
    // Show sample updated products
    console.log('📋 Sample Updated Products:');
    hvacProducts.slice(0, 10).forEach((p, i) => {
        if (p.imageUrl === hvacImagePath) {
            console.log(`   ${i + 1}. ${p.name}`);
            console.log(`      Brand: ${p.brand || 'N/A'}`);
            console.log(`      Image: ${p.imageUrl}`);
        }
    });
    
    console.log('\n✅ HVAC products now using: Product Placement/HVAC Main.jpeg\n');
} else {
    console.log('ℹ️  No HVAC products needed updating\n');
}







