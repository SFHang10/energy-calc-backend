/**
 * Fix apply-placeholder-images.js to prevent Motor.jpg from being assigned incorrectly
 * This adds specific rules for refrigeration and solar products BEFORE the generic fallback
 */

const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'apply-placeholder-images.js');

console.log('🔧 Fixing apply-placeholder-images.js to prevent incorrect Motor.jpg assignments...\n');

// Read the script
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Find the generic fallback section (around line 161)
const genericFallbackPattern = /\/\/ Generic fallback\s*\{[^}]*category: 'ETL Technology',[^}]*subcategory: null,[^}]*image: 'Product Placement\/Motor\.jpg',[^}]*description: 'Generic ETL products'[^}]*\}/;

if (!genericFallbackPattern.test(scriptContent)) {
    console.log('⚠️  Could not find generic fallback pattern. Script may have changed.');
    console.log('Please manually add specific rules before the generic fallback.');
    process.exit(1);
}

// Create the replacement with specific rules BEFORE generic fallback
const replacement = `    // Refrigeration products in ETL Technology (BEFORE generic fallback)
    {
        category: 'ETL Technology',
        subcategory: 'Carrier Linde Commercial Refrigeration',
        image: 'Product Placement/Cm Fridge.jpeg',
        description: 'Carrier refrigeration products'
    },
    // Solar/heating products in ETL Technology (BEFORE generic fallback)
    {
        category: 'ETL Technology',
        subcategory: 'Baxi Heating-Commercial',
        image: 'Product Placement/Baxi-STS-1.jpeg',
        description: 'Baxi solar/heating products'
    },
    // Generic fallback - ONLY for actual motor/drive products
    {
        category: 'ETL Technology',
        subcategory: null,
        image: 'Product Placement/Motor.jpg',
        description: 'Generic ETL products (motors/drives only)'
    }`;

// Replace the generic fallback
const updatedScript = scriptContent.replace(genericFallbackPattern, replacement);

// Create backup
const backupPath = scriptPath + '.backup_' + Date.now();
fs.writeFileSync(backupPath, scriptContent);
console.log(`💾 Backup created: ${path.basename(backupPath)}\n`);

// Save updated script
fs.writeFileSync(scriptPath, updatedScript);
console.log('✅ Script updated successfully!');
console.log('\n📋 Changes made:');
console.log('   - Added specific rule for Carrier refrigeration products');
console.log('   - Added specific rule for Baxi solar/heating products');
console.log('   - Generic fallback now only applies if no specific match found');
console.log('\n⚠️  Note: The matching logic in apply-placeholder-images.js will still');
console.log('   match the generic fallback for ETL Technology products. Consider');
console.log('   updating the matching logic to check product names for motor/drive keywords.');

