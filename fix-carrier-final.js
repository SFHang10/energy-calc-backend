const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const OUTPUT_FILE = path.join(__dirname, 'carrier-fix-final-results.txt');
const WIX_CM_FRIDGE_URL = 'https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg';

let output = [];

function log(msg) {
    const msgStr = String(msg);
    console.log(msgStr);
    output.push(msgStr);
}

log('='.repeat(70));
log('FIXING CARRIER PRODUCTS WITH WIX URLS');
log('='.repeat(70));
log('');

try {
    log('Step 1: Loading JSON file...');
    const data = JSON.parse(fs.readFileSync(FULL_DATABASE_PATH, 'utf8'));
    log(`✅ Loaded ${data.products.length} products`);
    
    log('\nStep 2: Finding Carrier products with Motor.jpg...');
    const carriers = data.products.filter(p => {
        if (!p.brand || !p.brand.toLowerCase().includes('carrier')) return false;
        if (!p.imageUrl) return false;
        return (
            p.imageUrl.includes('Motor.jpg') || 
            p.imageUrl.includes('Motor.jpeg') ||
            p.imageUrl.includes('Product Placement/Motor')
        );
    });
    
    log(`✅ Found ${carriers.length} Carrier products with Motor.jpg`);
    
    if (carriers.length === 0) {
        log('\n✅ No Carrier products need fixing!');
        fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
        process.exit(0);
    }
    
    log('\nStep 3: Products to fix:');
    carriers.slice(0, 5).forEach((p, i) => {
        log(`   ${i + 1}. ${p.name}`);
        log(`      Current: ${p.imageUrl}`);
        log(`      Will be: ${WIX_CM_FRIDGE_URL}`);
    });
    if (carriers.length > 5) {
        log(`   ... and ${carriers.length - 5} more`);
    }
    
    log('\nStep 4: Updating products...');
    let fixed = 0;
    carriers.forEach(product => {
        product.imageUrl = WIX_CM_FRIDGE_URL;
        product.imageSource = 'wix-url-fixed';
        product.imageFixedDate = new Date().toISOString();
        fixed++;
    });
    
    log(`✅ Updated ${fixed} products`);
    
    log('\nStep 5: Creating backup...');
    const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_${Date.now()}.json`);
    fs.copyFileSync(FULL_DATABASE_PATH, backupPath);
    log(`✅ Backup created: ${path.basename(backupPath)}`);
    
    log('\nStep 6: Saving updated JSON (this may take 1-2 minutes)...');
    const startTime = Date.now();
    fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(data, null, 2), 'utf8');
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`✅ Saved in ${elapsed}s`);
    
    log('\nStep 7: Verifying fix...');
    const verify = data.products.filter(p => 
        p.brand && p.brand.toLowerCase().includes('carrier') &&
        p.imageUrl && p.imageUrl.includes('Motor')
    );
    
    if (verify.length === 0) {
        log('✅ SUCCESS: No Carrier products have Motor.jpg anymore!');
    } else {
        log(`⚠️  WARNING: ${verify.length} Carrier products still have Motor.jpg`);
    }
    
    log('\n' + '='.repeat(70));
    log('FIX COMPLETE!');
    log('='.repeat(70));
    log(`\nFixed: ${fixed} Carrier products`);
    log(`New image URL: ${WIX_CM_FRIDGE_URL}`);
    log(`\nNext step: Commit and push to GitHub for Render deployment`);
    
} catch (error) {
    log(`\n❌ ERROR: ${error.message}`);
    log(`Stack: ${error.stack}`);
}

// Always save results
fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
log(`\n💾 Results saved to: ${path.basename(OUTPUT_FILE)}`);

