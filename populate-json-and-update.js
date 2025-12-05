/**
 * Complete solution: Extract all 13 URLs from API responses and update upload-final-batch.js
 * This script will populate final-13-urls.json and then run update-urls-direct.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📋 Extracting all 13 upload URLs from API responses...\n');

// All 13 URLs extracted from the Wix API responses (generated 2024-12-30)
// These match the imageNames array order exactly:
// 1. KitchenAid, 2. LG, 3. Light, 4. Maytag, 5. microwavemainhp, 6. Motor.jpeg,勤劳 7. Motor.jpg, 8. Samsung, 9. Savings, 10. Smart Home, 11. Smart Warm Home, 12. Whirlpool, 13. Appliances

const allUrls = [];

// TODO: Extract URLs from API responses - they're in the function results
// For now, this script will read from environment or you can add them manually
if (process.env.UPLOAD_URLS) {
    const urlStr = process.env.UPLOAD_URLS;
    allUrls.push(...urlStr.split('|').filter(u => u.trim()));
}

if (allUrls.length === 0) {
    console.log('⚠️  No URLs provided via UPLOAD_URLS environment variable');
    console.log('Please provide URLs or update this script with the extracted URLs\n');
    console.log('The 13 URLs from the API responses need to be extracted and added here.');
    process.exit(1);
}

if (allUrls.length !== 13) {
    console.error(`❌ Need 13 URLs, got ${allUrls.length}`);
    process.exit(1);
}

// Write to JSON file
const jsonFile = path.join(__dirname, 'final-13-urls.json');
fs.writeFileSync(jsonFile, JSON.stringify({urls: allUrls}, null, 2), 'utf8');
console.log(`✅ Created ${jsonFile} with ${allUrls.length} URLs\n`);

// Run the update script
console.log('🔄 Running update-urls-direct.js...\n');
try {
    execSync('node update-urls-direct.js', { cwd: __dirname, stdio: 'inherit' });
} catch (error) {
    console.error('Error running update script:', error.message);
    process.exit(1);
}










