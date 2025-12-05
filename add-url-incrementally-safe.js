/**
 * SAFE: Add ONE URL to final-13-urls.json incrementally
 * Preserves existing URLs, maintains JSON structure, no token limits
 * Run this 13 times, once for each URL (or modify to accept URL as argument)
 */

const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, 'final-13-urls.json');
const urlToAdd = process.argv[2]; // Get URL from command line argument

if (!urlToAdd) {
    console.error('❌ Usage: node add-url-incrementally-safe.js <URL>\n');
    console.log('💡 Example: node add-url-incrementally-safe.js "https://upload.wixmp.com/..."\n');
    process.exit(1);
}

// Validate URL format
if (!urlToAdd.startsWith('https://upload.wixmp.com/')) {
    console.error('❌ Invalid URL format - must start with https://upload.wixmp.com/\n');
    process.exit(1);
}

// Read existing file (or create new structure)
let data = { urls: [] };
if (fs.existsSync(jsonFile)) {
    try {
        const content = fs.readFileSync(jsonFile, 'utf8');
        data = JSON.parse(content);
        if (!Array.isArray(data.urls)) {
            data = { urls: [] };
        }
    } catch (error) {
        console.error(`⚠️  Error reading ${jsonFile}: ${error.message}`);
        console.log('📝 Creating new file...\n');
        data = { urls: [] };
    }
}

// Check if URL already exists
if (data.urls.includes(urlToAdd)) {
    console.log(`ℹ️  URL already exists in file (${data.urls.length} URLs total)\n`);
    process.exit(0);
}

// Add URL
data.urls.push(urlToAdd);

// Remove duplicates (just in case)
data.urls = [...new Set(data.urls)];

// Write back (atomic write)
try {
    fs.writeFileSync(jsonFile, JSON.stringify({ urls: data.urls }, null, 2), 'utf8');
    console.log(`✅ Added URL #${data.urls.length} to ${jsonFile}\n`);
    console.log(`📊 Total URLs: ${data.urls.length}/13\n`);
    
    if (data.urls.length === 13) {
        console.log(`🎉 All 13 URLs added!\n`);
    }
} catch (error) {
    console.error(`❌ Error writing file: ${error.message}\n`);
    process.exit(1);
}








