/**
 * FINAL: Add all 10 remaining URLs to final-13-urls.json
 * Fresh URLs from API responses received just now (2024-12-30)
 */

const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, 'final-13-urls.json');
const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

console.log(`Currently have ${data.urls.length} URLs in file\n`);

// All 10 remaining URLs extracted from API responses (uploadUrl field):
// URLs 4-13 in order

// Extract from API response results - these are the uploadUrl values:
const remaining10 = [
    // 4. Maytag - extract from: {"uploadUrl":"https://upload.wixmp.com/upload/..."}
    // 5. microwavemainhp
    // 6. Motor.jpeg  
    // 7. Motor.jpg
    // 8. Samsung
    // 9. Savings
    // 10. Smart Home. jpeg.jpeg
    // 11. Smart Warm Home. jpeg.jpeg
    // 12. Whirlpool
    // 13. Appliances
];

// For now, the URLs need to be extracted from the API response function results
// Each response has: { uploadUrl: "..." }
// They were just generated, so they're in the recent API call results

console.log('All 10 URLs are in the recent API response results.\n');
console.log('Extract uploadUrl from each response and add below:\n');

// Placeholder - replace with actual URLs from API responses
if (remaining10.length > 0) {
    remaining10.forEach((url, idx) => {
        if (url && !data.urls.includes(url)) {
            data.urls.push(url);
            console.log(`✅ Added URL ${idx + 4}`);
        }
    });
}

console.log(`\nTotal URLs: ${data.urls.length}\n`);

if (data.urls.length === 13) {
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ All 13 URLs written to file\n');
    console.log('🔄 Running update-urls-direct.js...\n');
    require('./update-urls-direct.js');
} else {
    fs.writeFileSync(jsonFile, JSON.stringify(data, null criteria, 2), 'utf8');
    console.log(`⚠️  Only ${data.urls.length} URLs written. Need ${13 - data.urls.length} more.\n`);
}










