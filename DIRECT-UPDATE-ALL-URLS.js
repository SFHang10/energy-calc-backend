/**
 * DIRECT UPDATE: Update upload-final-batch.js with all 13 URLs
 * This script reads the file, finds the array, and replaces it directly
 */

const fs = require('fs');
const path = require('path');

// All 13 URLs extracted from Wix API responses (2024-12-30)
// These will be read from a simple text file (one URL per line) or provided here
const urls = [];

// Try reading from a text file (one URL per line)
const urlsFile = path.join(__dirname, 'urls-list.txt');
if (fs.existsSync(urlsFile)) {
    const lines = fs.readFileSync(urlsFile, 'utf8').split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && trimmed.startsWith('https://upload.wixmp.com')) {
            urls.push(trimmed);
        }
    });
    console.log(`📥 Read ${urls.length} URLs from ${urlsFile}`);
}

// Or hardcode them here (commented out due to length)
// urls.push(...all13Urls);

if (urls.length !== 13) {
    console.error(`\n❌ Need exactly 13 URLs, got ${urls.length}`);
    console.log('\nTo provide URLs:');
    console.log('  1. Create urls-list.txt with one URL per line');
    console.log('  2. Or modify this script to include URLs directly\n');
    process.exit(1);
}

console.log(`✅ Have ${urls.length} URLs ready\n`);

// Update the file
const filePath = path.join(__dirname, 'upload-final-batch.js');
let content = fs.readFileSync(filePath, 'utf8');

const marker = 'const uploadUrls = [';
const startIdx = content.indexOf(marker);
if (startIdx === -1) {
    console.error('❌ Could not find uploadUrls array');
    process.exit(1);
}

// Find array end
let bracketCount = 0;
let inArray = false;
let endIdx = startIdx;

for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '[' && !inArray) {
        inArray = true;
        bracketCount = 1;
    } else if (content[i] === '[') {
        bracketCount++;
    } else if (content[i] === ']') {
        bracketCount--;
        if (bracketCount === 0 && inArray) {
            endIdx = i + 1;
            break;
        }
    }
}

// Build new array
const newArray = marker + '\n' +
    urls.map(url => `    "${url.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n') +
    '\n];';

const newContent = content.substring(0, startIdx) + newArray + content.substring(endIdx);
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`✅ Updated upload-final-batch.js with ${urls.length} URLs`);

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
const count = (verify.match(/upload\.wixmp\.com\/upload/g) || []).length;
console.log(`✅ Verification: Found ${count} upload URLs in file`);

