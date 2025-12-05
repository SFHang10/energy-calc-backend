/**
 * Fix Carrier Refrigeration Product Images
 * 
 * Updates Carrier products to use Wix Media URL instead of Motor.jpg
 * 
 * Wix URL found via MCP API:
 * https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg
 * 
 * This script:
 * 1. Finds all Carrier products with Motor.jpg
 * 2. Updates them to use Wix Cm Fridge URL
 * 3. Creates backup before changes
 * 4. Saves updated JSON file
 * 
 * Usage: node --max-old-space-size=8192 fix-carrier-images-wix-final.js
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const OUTPUT_FILE = path.join(__dirname, 'carrier-fix-final-output.txt');

// Wix URL for commercial fridge placeholder (found via Wix MCP API)
const WIX_CM_FRIDGE_URL = 'https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg';

let output = [];
let logCount = 0;

function log(msg) {
    const msgStr = String(msg);
    console.log(msgStr);
    output.push(msgStr);
    logCount++;
    
    // Save periodically to avoid losing output
    if (logCount % 50 === 0) {
        try {
            fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
        } catch (e) {
            // Ignore write errors during processing
        }
    }
}

log('='.repeat(70));
log('CARRIER IMAGE FIX - USING WIX URLS');
log('='.repeat(70));
log('');
log(`Wix URL: ${WIX_CM_FRIDGE_URL}`);
log('');

try {
    log('Step 1: Loading JSON file...');
    const startLoad = Date.now();
    const data = JSON.parse(fs.readFileSync(FULL_DATABASE_PATH, 'utf8'));
    const loadTime = ((Date.now() - startLoad) / 1000).toFixed(2);
    log(`✅ Loaded ${data.products.length} products in ${loadTime}s`);
    
    log('\nStep 2: Finding Carrier products with Motor.jpg...');
    const carriers = data.products.filter(p => {
        if (!p.brand || !p.brand.toLowerCase().includes('carrier')) return false;
        if (!p.imageUrl) return false;
        const img = p.imageUrl.toLowerCase();
        return (
            img.includes('motor.jpg') || 
            img.includes('motor.jpeg') ||
            img.includes('product placement/motor')
        );
    });
    
    log(`✅ Found ${carriers.length} Carrier products with Motor.jpg`);
    
    if (carriers.length === 0) {
        log('\n✅ No Carrier products need fixing!');
        fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
        process.exit(0);
    }
    
    log('\nStep 3: Products to fix:');
    carriers.slice(0, 10).forEach((p, i) => {
        log(`   ${i + 1}. ${p.name}`);
        log(`      ID: ${p.id}`);
        log(`      Current: ${p.imageUrl}`);
        log(`      Will be: ${WIX_CM_FRIDGE_URL}`);
    });
    if (carriers.length > 10) {
        log(`   ... and ${carriers.length - 10} more`);
    }
    
    log('\nStep 4: Updating products...');
    let fixed = 0;
    carriers.forEach((product, idx) => {
        product.imageUrl = WIX_CM_FRIDGE_URL;
        product.imageSource = 'wix-url-fixed';
        product.imageFixedDate = new Date().toISOString();
        fixed++;
        
        if (idx < 5) {
            log(`   ✅ Fixed: ${product.name}`);
        }
    });
    
    log(`\n✅ Updated ${fixed} Carrier products`);
    
    log('\nStep 5: Creating backup...');
    const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_before_carrier_fix_${Date.now()}.json`);
    log(`   Backup path: ${path.basename(backupPath)}`);
    fs.copyFileSync(FULL_DATABASE_PATH, backupPath);
    log(`✅ Backup created`);
    
    log('\nStep 6: Saving updated JSON (this may take 1-2 minutes for large file)...');
    const startSave = Date.now();
    fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(data, null, 2), 'utf8');
    const saveTime = ((Date.now() - startSave) / 1000).toFixed(2);
    log(`✅ Saved in ${saveTime}s`);
    
    log('\nStep 7: Verifying fix...');
    const verify = data.products.filter(p => {
        if (!p.brand || !p.brand.toLowerCase().includes('carrier')) return false;
        if (!p.imageUrl) return false;
        return p.imageUrl.toLowerCase().includes('motor');
    });
    
    if (verify.length === 0) {
        log('✅ SUCCESS: No Carrier products have Motor.jpg anymore!');
    } else {
        log(`⚠️  WARNING: ${verify.length} Carrier products still have Motor.jpg`);
        verify.slice(0, 5).forEach(p => {
            log(`   - ${p.name}: ${p.imageUrl}`);
        });
    }
    
    // Count how many now have Wix URL
    const withWix = data.products.filter(p => {
        if (!p.brand || !p.brand.toLowerCase().includes('carrier')) return false;
        return p.imageUrl && p.imageUrl.includes('static.wixstatic.com');
    });
    
    log(`\n✅ Carrier products with Wix URL: ${withWix.length}`);
    
    log('\n' + '='.repeat(70));
    log('FIX COMPLETE!');
    log('='.repeat(70));
    log(`\nSummary:`);
    log(`   Fixed: ${fixed} Carrier products`);
    log(`   New image URL: ${WIX_CM_FRIDGE_URL}`);
    log(`   Backup: ${path.basename(backupPath)}`);
    log(`\nNext steps:`);
    log(`   1. Verify the fix worked`);
    log(`   2. Commit to GitHub: git add FULL-DATABASE-5554.json`);
    log(`   3. Commit: git commit -m "Fix Carrier images - use Wix Cm Fridge URL"`);
    log(`   4. Push: git push`);
    log(`   5. Render will auto-deploy`);
    
} catch (error) {
    log(`\n❌ ERROR: ${error.message}`);
    log(`Stack: ${error.stack}`);
    process.exit(1);
} finally {
    // Always save results
    fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
    log(`\n💾 Results saved to: ${path.basename(OUTPUT_FILE)}`);
}

