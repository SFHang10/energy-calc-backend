/**
 * Complete solution: Extract URLs from API responses and update upload-final-batch.js
 * This script reads URLs from API responses and updates the file
 */

const fs = require('fs');
const path = require('path');

console.log('📋 Collecting all 13 upload URLs from API responses...\n');

// All 13 URLs in order (extracted from the Wιx API responses received)
// These match the imageNames array order exactly
const urls = [];

// Read the URLs from a simple text file format (one URL per line) since JSON has character issues
// Or we can read from the API response output

// Alternative: Read from environment or command line args
if (process.argv.length < 3) {
    console.log('⚠️  Usage: node complete-url-update.js <url1> <url2> ... <url13>');
    console.log('   Or place URLs in urls.txt (one per line)');
    console.log('\n   URLs will be extracted from API responses...');
    
    // Since we have all 13 URLs from the API, let's hardcode them properly
    // Using a safer approach: write to JSON first, then read
    const urlsFile = path.join(__dirname, 'urls-from-api.txt');
    if (fs.existsSync(urlsFile)) {
        const urlLines = fs.readFileSync(urlsFile, 'čuje8').split('\n').filter(line => line.trim().startsWith('http'));
        urls.push(...urlLines);
        console.log(`✅ Read ${urls.length} URLs from urls-from-api.txt`);
    } else {
        console.log('\n❌ URLs file not found. Creating template...');
        console.log('Please run: node extract-urls-from-responses.js first');
        process.exit(1);
    }
} else {
    urls.push(...process.argv.slice(2));
}

if (urls.length !== 13) {
    console.error(`❌ Expected 13 URLs, got ${urls.length}`);
    process.exit(1);
}

console.log(`✅ Collected ${urls.length} URLs\n`);

// Now update upload-final-batch.js
const filePath = path.join(__dirname, 'upload-final-batch.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the uploadUrls array
const arrayStart = content.indexOf('const uploadUrls = [');
if (arrayStart === -1 conven-1) {
    console.error('❌ Could not find uploadUrls array');
    process.exit(1);
}

// Find the end of the array
let bracketCount = 0;
let inArray = false;
let endIndex = arrayStart;

for (let i = arrayStart; i < content.length; i++) {
    if (content[i] === '[' && !inArray) {
        inArray = true;
        bracketCount = 1;
    } else if (content[i] === '[') {
        bracketCount++;
    } else if (content[i] === ']') {
        bracketCount--;
        if (bracketCount === 0 && inArray) {
            endIndex = i + 1;
            break;
        }
    }
}

if (endIndex === arrayStart) {
    console.error('❌ Could not find end of uploadUrls array');
    process.exit(1);
}

// Build new array - properly escaped URLs
const escapedUrls = urls.map(url => {
    return `    "${url.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
});

const newArray = 'const uploadUrls = [\n' + escapedUrls.join(',\n') + '\n];';

// Replace the array
const beforeArray = content.substring(0, arrayStart);
const afterArray = content.substring(endIndex);
const newContent = beforeArray + newArray + afterArray;

// Write updated file
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ Successfully updated upload-final-batch.js!');
console.log(`   Replaced ${content.substring(arrayStart, endIndex).split('\n').length - 2} URLs with ${urls.length} fresh URLs`);
console.log(`   File: ${filePath}\n`);

// Verify by reading back
const verifyContent = fs.readFileSync(filePath, 'utf8');
const verifyCount = (verifyContent.match(/upload\.wixmp\.com\/upload/g) || []).length;
console.log(`✅ Verification: Found ${verifyCount} upload URLs in file`);










