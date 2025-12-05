/**
 * Set the 13 upload URLs in upload-final-batch.js programmatically
 * This avoids the issue of extremely long URLs breaking file edits
 */

const fs = require('fs');
const path = require('path');

// Read the current file
const filePath = path.join(__dirname, 'upload-final-batch.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the uploadUrls array section
const arrayStartMarker = 'const uploadUrls = [';
const arrayEndMarker = '];';

const startIndex = content.indexOf(arrayStartMarker);
if (startIndex === -1) {
    console.error('Could not find uploadUrls array');
    process.exit(1);
}

// Find where the array ends (the next ]; after startIndex)
let bracketCount = 0;
let inArray = false;
let endIndex = startIndex;

for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '[' && !inArray) {
        inArray = true;
        bracketCount = 1;
    } else if (content[i] === '[') {
        bracketCount++;
    } else if (content[i] === ']') {
        bracketCount--;
        if (bracketCount === 0 && inArray) {
            endIndex = i + 1; // Include the closing bracket
            break;
        }
    }
}

if (endIndex === startIndex) {
    console.error('Could not find end of uploadUrls array');
    process.exit(1);
}

// Read URLs from a JSON file if it exists, or use command line args
let urls = [];

// Try to read from URLs.json file
const urlsFile = path.join(__dirname, 'final-batch-urls.json');
if (fs.existsSync(urlsFile)) {
    try {
        const urlsData = JSON.parse(fs.readFileSync(urlsFile, 'utf8'));
        urls = urlsData.urls || urlsData || [];
        console.log(`✅ Read ${urls.length} URLs from final-batch-urls.json`);
    } catch (error) {
        console.error('Error reading URLs file:', error.message);
    }
} else {
    // Or accept URLs as command line arguments
    urls = process.argv.slice(2).filter(arg => arg.startsWith('https://'));
    
    if (urls.length === 0) {
        console.log('⚠️  No URLs provided!');
        console.log('');
        console.log('Usage options:');
        console.log('  1. Create final-batch-urls.json with: {"urls": ["url1", "url2", ...]}');
        console.log('  2. Pass URLs as command line args: node set-final-batch-urls.js "url1" "url2" ...');
        console.log('');
        console.log('Current file has', content.substring(startIndex, endIndex).split('\n').length, 'lines in the array');
        process.exit(1);
    }
}

if (urls.length !== 13) {
    console.error(`⚠️  Expected 13 URLs, got ${urls.length}`);
    process.exit(1);
}

// Build the new array content
const newArray = arrayStartMarker + '\n' +
    urls.map(url => `    "${url}"`).join(',\n') + '\n' +
    arrayEndMarker;

// Replace the array in the file
const beforeArray = content.substring(0, startIndex);
const afterArray = content.substring(endIndex);

const newContent = beforeArray + newArray + afterArray;

// Write the updated file
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`✅ Successfully updated upload-final-batch.js with ${urls.length} URLs`);
console.log(`   File: ${filePath}`);

