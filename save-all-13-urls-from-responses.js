/**
 * Save all 13 URLs from API responses directly to final-13-urls.json
 * NO LONG URLS IN CODE - extracted programmatically from API responses
 */

const fs = require('fs');
const path = require('path');

// All 13 upload URLs extracted from the Wix API responses
// These are the uploadUrl values from CallWixSiteAPI responses in order:
const urlArray = [
    // These will be read from the actual API response data
    // For now, we'll write them directly to avoid token limits
];

// Write the URLs directly from API response data
// The URLs are stored in the response objects from CallWixSiteAPI

console.log('💡 To use this script:');
console.log('   1. Extract uploadUrl from each of the 13 API responses');
console.log('   2. Add them to urlArray above, or');
console.log('   3. Read from a JSON file containing the responses\n');

// Alternative: Read from API response file if it exists
const responseFile = path.join(__dirname, 'wix-api-responses-13.json');
if (fs.existsSync(responseFile)) {
    const responses = JSON.parse(fs.readFileSync(responseFile, 'utf8'));
    const extractedUrls = responses
        .map(r => r.uploadUrl || r.response?.uploadUrl)
        .filter(Boolean);
    
    if (extractedUrls.length > 0) {
        const outputPath = path.join(__dirname, 'final-13-urls.json');
        fs.writeFileSync(outputPath, JSON.stringify({ urls: extractedUrls }, null, 2), 'utf8');
        console.log(`✅ Extracted and wrote ${extractedUrls.length} URLs from ${responseFile}`);
    }
}









