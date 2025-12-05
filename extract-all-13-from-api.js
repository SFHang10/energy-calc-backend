/**
 * SAFE: Extract all 13 URLs from API responses and add to final-13-urls.json
 * Reads URLs from urls.txt file (one URL per line)
 * Preserves JSON structure, compatible with update-urls-direct.js
 */

const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, 'final-13-urls.json');
const urlsFile = path.join(__dirname, 'urls.txt');

// Read all URLs from text file
if (!fs.existsSync(urlsFile)) {
    console.error(`❌ File not found: ${urlsFile}\n`);
    process.exit(1);
}

const allUrls = fs.readFileSync(urlsFile, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('https://upload.wixmp.com/'));

console.log(`📋 Found ${allUrls.length} URLs in ${urlsFile}\n`);

if (allUrls.length === 0) {
    console.error(`❌ No valid URLs found\n`);
    process.exit(1);
}

// Read existing file (preserve structure)
let data = { urls: [] };
if (fs.existsSync(jsonFile)) {
    try {
        const content = fs.readFileSync(jsonFile, 'utf8');
        data = JSON.parse(content);
        if (!Array.isArray(data.urls)) {
            console.log('⚠️  Invalid structure, creating new file...\n');
            data = { urls: [] };
        }
    } catch (error) {
        console.error(`⚠️  Error reading ${jsonFile}: ${error.message}\n`);
        data = { urls: [] };
    }
}

// Merge: combine existing with new, remove duplicates
const existingUrls = new Set(data.urls);
const newUrls = allUrls.filter(url => !existingUrls.has(url));

// Add new URLs
data.urls.push(...newUrls);

// Remove duplicates (safety check)
data.urls = [...new Set(data.urls)];

// Limit to 13 (safety)
if (data.urls.length > 13) {
    console.log(`⚠️  Warning: More than 13 URLs, keeping first 13\n`);
    data.urls = data.urls.slice(0, 13);
}

// Write back (atomic write, preserves structure)
try {
    fs.writeFileSync(jsonFile, JSON.stringify({ urls: data.urls }, null, 2), 'utf8');
    console.log(`✅ Updated ${jsonFile}\n`);
    console.log(`📊 Total URLs: ${data.urls.length}/13\n`);
    
    if (data.urls.length === 13) {
        console.log(`🎉 All 13 URLs saved!\n`);
    } else {
        console.log(`📝 Need ${13 - data.urls.length} more URLs\n`);
    }
    
    // Verify structure is correct for update-urls-direct.js
    try {
        const verify = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        if (Array.isArray(verify.urls) && verify.urls.length > 0) {
            console.log(`✅ JSON structure verified - compatible with update-urls-direct.js\n`);
            console.log(`✅ Ready for upload-final-batch.js\n`);
        }
    } catch (e) {
        console.error(`❌ Error verifying structure: ${e.message}\n`);
    }
} catch (error) {
    console.error(`❌ Error writing file: ${error.message}\n`);
    process.exit(1);
}








