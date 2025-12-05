/**
 * Extract all 13 URLs from API response data and write to final-13-urls.json
 * Run this after all 13 API responses are received
 */

const fs = require('fs');
const path = require('path');

console.log('Extracting all 13 URLs from API responses...\n');

// URLs extracted from successful CallWixSiteAPI responses
// In order: KitchenAid, LG, Light, Maytag, microwavemainhp, Motor.jpeg, Motor.jpg, Samsung, Savings, Smart Home, Smart Warm Home, Whirlpool, Appliances
const urls = [];

// We'll read from API response results or build from the successful responses
// For now, construct the array - URLs are in each response's uploadUrl field

// Read from a temporary file if URLs were saved there during API calls
const tempFile = path.join(__dirname, '.api-urls-temp.txt');
if (fs.existsSync(tempFile)) {
    console.log('Reading URLs from temporary file...');
    const content = fs.readFileSync(tempFile, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && trimmed.startsWith('https://upload.wixmp.com')) {
            urls.push(trimmed);
        }
    });
    fs.unlinkSync(tempFile); // Clean up
}

if (urls.length === 0) {
    console.log('No URLs found in temp file.');
    console.log('All 13 URLs are in the successful CallWixSiteAPI function results.');
    console.log('Each response contains an uploadUrl field.\n');
    console.log('Please extract them manually or re-run API calls to capture URLs.\n');
    process.exit(1);
}

console.log(`✅ Extracted ${urls.length} URLs\n`);

if (urls.length !== 13) {
    console.warn(`⚠️  Expected 13 URLs, got ${urls.length}`);
}

// Write to JSON
const jsonFile = path.join(__dirname, 'final-13-urls.json');
fs.writeFileSync(jsonFile, JSON.stringify({urls}, null, 2), 'utf8');
console.log(`✅ Wrote ${urls.length} URLs to ${jsonFile}\n`);

// Run update script
console.log('🔄 Running update-urls-direct.js...\n');
try {
    require('./update-urls-direct.js');
    console.log('✅ Complete! All URLs written and upload-final-batch.js updated.\n');
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}










