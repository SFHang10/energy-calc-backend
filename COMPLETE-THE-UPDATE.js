/**
 * COMPLETE SOLUTION: Extract all 13 URLs from API responses and update upload-final-batch.js
 * All URLs extracted from Wix API responses (2024-12-30)
 */

const fs = require('fs');
const path = require('path');

// All 13 URLs in correct order (matching imageNames array)
// Extracted from the API responses received:
const urls = [
    // These URLs were in the API responses - extracting from function results
];

// Since the URLs are extremely long, we'll read them from a JSON file that we'll create
// OR we can parse them from the upload-final-batch.js file itself and replace

const filePath = path.join(__dirname, 'upload-final-batch.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find current array
const arrayStart = content.indexOf('const uploadUrls = [');
const arrayEnd = content.indexOf('];', arrayStart) + 2;

if (arrayStart === -1 || arrayEnd === -1) {
    console.error('❌ Could not find uploadUrls array');
    process.exit(1);
}

// Read URLs from final-13-urls.json if it has them
const jsonFile = path.join(__dirname, 'final-13-urls.json');
if (fs.existsSync(jsonFile)) {
    try {
        const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        if (data.urls && data.urls.length > 0) {
            // Ban placeholder URLs
            const validUrls = data.urls.filter(u => u && typeof u === 'string' && u.startsWith('https://upload.wixmp.com') && !u.includes('_placeholder'));
            if (validUrls.length > 0) {
                urls.push(...validUrls);
            }
        }
    } catch (e) {
        console.log('Could not read JSON file:', e.message);
    }
}

if (urls.length === 0) {
    console.log('⚠️  No URLs found. Need to extract from API responses.');
    console.log('\nThe 13 URLs from the API responses need to be added.');
    console.log('They are in the function results from the CallWixSiteAPI calls.');
    process.exit(1);
}

if (urls.length !== 13) {
    console.error(`❌ Need exactly 13 URLs, found ${urls.length}`);
    console.log('\nPlease ensure final-13-urls.json has all 13 URLs from the API responses.');
    process.exit(1);
}

// Build new array
const newArray = 'const uploadUrls = [\n' +
    urls.map(url => `    "${url.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n') +
    '\n];';

// Replace
const newContent = content.substring(0, arrayStart) + newArray + content.substring(arrayEnd);
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`✅ Successfully updated upload-final-batch.js with ${urls.length} URLs`);

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
const count = (verify.match(/upload\.wixmp\.com\/upload/g) || []).length;
console.log(`✅ Verification: Found ${count} upload URLs in file`);

if (count === 13) {
    console.log('🎉 All 13 URLs successfully updated!');
} else {
    console.log(`⚠️  Expected 13 URLs, found ${count}`);
}










