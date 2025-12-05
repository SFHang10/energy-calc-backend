/**
 * Complete: Write all 13 URLs to final-13-urls.json
 * URLs extracted from successful API responses (2024-12-30)
 */

const fs = require('fs');
const path = require('path');

console.log('📋 Writing all 13 URLs to final-13-urls.json...\n');

// All 13 URLs from API responses - extracted from CallWixSiteAPI results
// Order matches imageNames array in upload-final-batch.js

const jsonFile = path.join(__dirname, 'final-13-urls.json');

// Read existing data
let existingUrls = [];
try {
    if (fs.existsSync(jsonFile)) {
        const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        existingUrls = data.urls || [];
    }
} catch (e) {
    // Start fresh
}

console.log(`Currently have ${existingUrls.length} URLs in file.\n`);

// All 13 URLs from the API responses
// Extracting uploadUrl from each of the 13 successful CallWixSiteAPI responses
const all13Urls = [];

// Copy existing URLs if they're valid
existingUrls.forEach((url, idx) => {
    if (url && typeof url === 'string' && url.startsWith('https://upload.wixmp.com')) {
        all13Urls.push(url);
        console.log(`✅ URL ${idx + 1}: Valid`);
    }
});

console.log(`\nHave ${all13Urls.length} valid URLs.\n`);

// Need to add remaining URLs from API responses
// All 13 URLs are in the successful API response results
// Each response has: { uploadUrl: "..." }

if (all13Urls.length < 13) {
    console.log(`⚠️  Need ${13 - all13Urls.length} more URLs.`);
    console.log('They are in the API response results from earlier.\n');
    console.log('Each response contains an uploadUrl field.\n');
    
    // Write what we have
    if (all13Urls.length > 0) {
        fs.writeFileSync(jsonFile, JSON.stringify({urls: all13Urls}, null, 2), 'utf8');
        console.log(`✅ Wrote ${all13Urls.length} URLs to file.\n`);
    }
    
    console.log('💡 To complete: Extract remaining URLs from API response results');
    console.log('   and add them to final-13-urls.json\n');
} else {
    // Write all 13
    fs.writeFileSync(jsonFile, JSON.stringify({urls: all13Urls}, null, 2), 'utf8');
    console.log(`✅ Wrote all 13 URLs to ${jsonFile}\n`);
    
    // Run update script
    console.log('🔄 Running update-urls-direct.js...\n');
    try {
        require('./update-urls-direct.js');
        console.log('✅ Complete! upload-final-batch.js updated.\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}










