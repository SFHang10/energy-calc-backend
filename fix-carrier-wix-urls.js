/**
 * Fix Carrier Refrigeration product images with Wix URLs
 * 
 * This script updates Carrier products to use Wix image URLs instead of local paths
 * 
 * Usage: node fix-carrier-wix-urls.js
 * 
 * IMPORTANT: You need to provide the Wix URLs for Carrier images:
 * 1. "Carrier Refrigeration all glass door" - Wix URL
 * 2. "Carrier Refrigeration anti-reflective all glass door" - Wix URL
 * 3. Other Carrier products - Use Wix URL for "Cm Fridge.jpeg" placeholder
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const OUTPUT_FILE = path.join(__dirname, 'carrier-wix-fix-results.txt');

let output = [];

function log(msg) {
    console.log(msg);
    output.push(msg);
}

// ============================================================================
// WIX IMAGE URLS - Found via Wix MCP API
// ============================================================================
// These URLs were retrieved from Wix Media Manager using the MCP API

const WIX_CARRIER_IMAGE_URLS = {
    // Carrier Refrigeration all glass door
    // Note: Specific Carrier images not found in Wix, using Cm Fridge as fallback
    'Carrier Refrigeration all glass door': 'https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg',
    
    // Carrier Refrigeration anti-reflective all glass door
    // Note: Specific Carrier images not found in Wix, using Cm Fridge as fallback
    'Carrier Refrigeration anti-reflective all glass door': 'https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg',
    
    // Fallback for other Carrier products (Cm Fridge.jpeg from Wix)
    'default': 'https://static.wixstatic.com/media/c123de_7df4d529ff374fec94f4ac4e04773dc4~mv2.jpeg'
};

log('🔧 FIXING CARRIER REFRIGERATION PRODUCT IMAGES WITH WIX URLs');
log('='.repeat(70));
log('');

try {
    log('Loading JSON file...');
    const data = JSON.parse(fs.readFileSync(FULL_DATABASE_PATH, 'utf8'));
    log(`✅ Loaded ${data.products.length} products`);
    
    // Find Carrier products with Motor.jpg or local paths
    const carriers = data.products.filter(p => {
        if (!p.brand || !p.brand.toLowerCase().includes('carrier')) {
            return false;
        }
        if (!p.imageUrl) {
            return false;
        }
        // Check if it needs fixing
        return (
            p.imageUrl.includes('Motor.jpg') || 
            p.imageUrl.includes('Motor.jpeg') ||
            p.imageUrl.includes('Product Placement/') ||
            !p.imageUrl.startsWith('http')
        );
    });
    
    log(`\n📦 Found ${carriers.length} Carrier products to fix\n`);
    
    if (carriers.length === 0) {
        log('✅ No Carrier products need fixing!');
        fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
        process.exit(0);
    }
    
    // Show what we'll fix
    log('🔍 Products to fix:');
    carriers.slice(0, 10).forEach((p, i) => {
        let correctUrl = WIX_CARRIER_IMAGE_URLS[p.name] || WIX_CARRIER_IMAGE_URLS['default'];
        log(`   ${i + 1}. ${p.name}`);
        log(`      Current: ${p.imageUrl}`);
        log(`      Will be: ${correctUrl}`);
    });
    
    if (carriers.length > 10) {
        log(`   ... and ${carriers.length - 10} more`);
    }
    
    // Fix them
    log('\n🔧 Fixing products...');
    let fixed = 0;
    const fixedDetails = [];
    
    carriers.forEach(product => {
        const oldUrl = product.imageUrl;
        const correctUrl = WIX_CARRIER_IMAGE_URLS[product.name] || WIX_CARRIER_IMAGE_URLS['default'];
        
        if (oldUrl === correctUrl) {
            return; // Already correct
        }
        
        product.imageUrl = correctUrl;
        
        // Update images array
        let images = [];
        if (product.images) {
            try {
                images = typeof product.images === 'string' 
                    ? JSON.parse(product.images) 
                    : product.images;
            } catch (e) {
                images = [];
            }
        }
        
        // Remove old local/Motor images
        images = images.filter(img => 
            !img.includes('Motor') && 
            !img.includes('Product Placement/') &&
            img.startsWith('http')
        );
        
        // Add correct Wix URL if not already present
        if (!images.includes(correctUrl)) {
            images.unshift(correctUrl);
        }
        
        product.images = JSON.stringify(images);
        product.imageSource = 'wix-url';
        product.imageFixedDate = new Date().toISOString();
        
        fixedDetails.push({
            name: product.name,
            old: oldUrl,
            new: correctUrl
        });
        
        fixed++;
    });
    
    log(`✅ Fixed ${fixed} products\n`);
    
    // Create backup
    const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_before_wix_fix_${Date.now()}.json`);
    log(`💾 Creating backup...`);
    fs.copyFileSync(FULL_DATABASE_PATH, backupPath);
    log(`✅ Backup created: ${path.basename(backupPath)}\n`);
    
    // Save updated database
    log('💾 Saving updated database (this may take 1-2 minutes)...');
    const startTime = Date.now();
    fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(data, null, 2), 'utf8');
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`✅ Database saved in ${elapsed}s`);
    log(`   Total products: ${data.products.length}`);
    log(`   Fixed: ${fixed} Carrier products\n`);
    
    // Show what was fixed
    log('📋 Fixed products:');
    fixedDetails.forEach((detail, i) => {
        log(`   ${i + 1}. ${detail.name}`);
        log(`      Old: ${detail.old}`);
        log(`      New: ${detail.new}`);
    });
    log('');
    
    // Verify
    const verify = data.products.filter(p => 
        p.brand && p.brand.toLowerCase().includes('carrier') &&
        p.imageUrl && (
            p.imageUrl.includes('Motor') ||
            p.imageUrl.includes('Product Placement/')
        )
    );
    
    if (verify.length === 0) {
        log('✅ Verification: No Carrier products have Motor.jpg or local paths anymore!');
    } else {
        log(`⚠️  Warning: ${verify.length} Carrier products still have issues`);
    }
    
    log('\n🎉 Fix complete!');
    
} catch (error) {
    log(`❌ Error: ${error.message}`);
    log(`Stack: ${error.stack}`);
}

// Save results
fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
log(`\n💾 Results saved to: ${path.basename(OUTPUT_FILE)}`);

