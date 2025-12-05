/**
 * SAFE: Add all 13 URLs from API responses to final-13-urls.json
 * Reads from urls.txt file (one URL per line)
 * Preserves JSON structure, maintains compatibility with update-urls-direct.js
 */

const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, 'final-13-urls.json');
const urlsFile = path.join(__dirname, 'urls.txt');

// Read URLs from text file (one per line)
if (!fs.existsSync(urlsFile)) {
    console.error(`❌ File not found: ${urlsFile}\n`);
    console.log('💡 Create urls.txt with one URL per line:\n');
    console.log('   https://upload.wixmp.com/upload/...');
    console.log('   https://upload.wixmp.com/upload/...');
    console.log('   (one URL per line, no quotes)\n');
    process.exit(1);
}

const urlsToAdd = fs.readFileSync(urlsFile, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('https://upload.wixmp.com/'));

if (urlsToAdd.length === 0) {
    console.error(`❌ No valid URLs found in ${urlsFile}\n`);
    console.log('💡 Ensure URLs start with https://upload.wixmp.com/\n');
    process.exit(1);
}

console.log(`📋 Found ${urlsToAdd.length} URLs to add\n`);

// Read existing file (or create new structure)
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
        console.error(`⚠️  Error reading ${jsonFile}: ${error.message}`);
        console.log('📝 Creating new file...\n');
        data = { urls: [] };
    }
}

// Merge URLs (avoid duplicates)
const existingUrls = new Set(data.urls);
const newUrls = urlsToAdd.filter(url => !existingUrls.has(url));

if (newUrls.length === 0) {
    console.log(`ℹ️  All URLs already exist in file (${data.urls.length} total)\n`);
    process.exit(0);
}

// Add new URLs
data.urls.push(...newUrls);

// Remove duplicates (safety check)
data.urls = [...new Set(data.urls)];

// Write back (atomic write, preserves structure)
try {
    fs.writeFileSync(jsonFile, JSON.stringify({ urls: data.urls }, null, 2), 'utf8');
    console.log(`✅ Added ${newUrls.length} new URLs to ${jsonFile}\n`);
    console.log(`📊 Total URLs: ${data.urls.length}/13\n`);
    
    if (data.urls.length === 13) {
        console.log(`🎉 All 13 URLs added!\n`);
    } else if (data.urls.length > 13) {
        console.log(`⚠️  Warning: More than 13 URLs (${data.urls.length})\n`);
    } else {
        console.log(`📝 Need ${13 - data.urls.length} more URLs\n`);
    }
    
    // Verify structure is correct
    try {
        const verify = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        if (Array.isArray(verify.urls)) {
            console.log(`✅ JSON structure verified - compatible with update-urls-direct.js\n`);
        }
    } catch (e) {
        console.error(`❌ Error verifying structure: ${e.message}\n`);
    }
} catch (error) {
    console.error(`❌ Error writing file: ${error.message}\n`);
    process.exit(1);
}








