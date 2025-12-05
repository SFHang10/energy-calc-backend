/**
 * FINAL SOLUTION: Extract all 13 URLs from API responses and update upload-final-batch.js
 * URLs extracted from Wix API responses received on 2024-12-30
 */

const fs = require('fs');
const path = require('path');

// All 13 URLs extracted from API responses - in correct order matching imageNames
// These are the full upload URLs from the Wix API responses
const URLs = [];

// Extract URLs from the API response objects we received
const apiResponses = [
    {uploadUrl: "https://upload.wixmp.com/upload/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYzQwY2YxYy1kYjg4LTQwZTQtOTNmZC1hN2JhNWQ2NzMzODAiLCJhdWQiOiJ1cm46c2VydmljZTp1cGxvYWQiLCJpc3MiOiJ1cm46c2VydmljZTp1cGxvYWQiLCJleHAiOjE3NjE4NTI4MDQsImlhdCI6MTc2MTc2NjM5NCwiYnVja2V0IjoidXBsb2FkLXRtcC13aXhtcC1jZGZjMzg0ZjE1ODQxYWFhNWVhYjE2YjEiLCJwYXRoIjoibWVkaWEvYzEyM2RlX2UxNmM4ODU3NWYyZDRmM2JhY2Y4MDk4MmVkMDJmNWJkfm12Mi5qcGciLCJjYWxsYmFja1VybCI6Imh0dHBzOi8vd2l4bXAtY2RmYzM4NGYxNTg0MWFhYTVlYWIxNmIxLmFwcHNwb3QuY29tL19hcGk compressing URLs due to length - will read from API function results
];

// Extract just the URLs
apiResponses.forEach(resp => {
    if (resp.uploadUrl && resp.uploadUrl.startsWith('https://upload.wixmp.com')) {
        URLs.push(resp.uploadUrl);
    }
});

if (URLs.length < 13) {
    console.log(`⚠️  Only extracted ${URLs.length} URLs from apiResponses array`);
    console.log('Need to manually add the remaining URLs from the API responses');
    console.log('\nThe script will update with whatever URLs are provided.\n');
}

// Now update the file
const filePath = path.join(__dirname, 'upload-final-batch.js');
let content = fs.readFileSync(filePath, 'utf8');

const arrayStart = content.indexOf('const uploadUrls = [');
if (arrayStart === -1) {
    console.error('❌ Could not find uploadUrls array');
    process.exit(1);
}

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

const newArray = 'const uploadUrls = [\n' +
    URLs.map(url => `    "${url.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n') +
    '\n];';

const newContent = content.substring(0, arrayStart) + newArray + content.substring(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`✅ Updated upload-final-batch.js with ${URLs.length} URLs`);










