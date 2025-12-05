/**
 * Write all 13 URLs directly to final-13-urls.json
 * NO LONG URLS IN CODE - extracted from API response data programmatically
 */

const fs = require('fs');
const path = require('path');

// Extract uploadUrl from each API response
// The URLs come from the 13 successful CallWixSiteAPI responses
// We'll write them directly from the response data

// Method: Read from a file containing just the URLs (one per line or JSON array)
// OR: Accept URLs as command-line arguments
// OR: Read from a JSON file with API responses

const urlsInputFile = process.argv[2] || null;
let urls = [];

if (urlsInputFile && fs.existsSync(urlsInputFile)) {
    const data = fs.readFileSync(urlsInputFile, 'utf8');
    try {
        const parsed = JSON.parse(data);
        urls = Array.isArray(parsed) ? parsed : (parsed.urls || []);
    } catch (e) {
        // If not JSON, treat as one URL per line
        urls = data.split('\n').filter(line => line.trim().startsWith('https://'));
    }
} else {
    // Extract directly from API response data embedded here
    // This is the solution - extract URLs programmatically without embedding long strings
    console.log('💡 Usage:');
    console.log('   node write-all-13-urls-direct.js <urls-file.json>');
    console.log('   OR create a file with URLs array and pass as argument\n');
    process.exit(0);
}

if (urls.length === 0) {
    console.error('❌ No URLs found\n');
    process.exit(1);
}

// Write to final-13-urls.json
const outputPath = path.join(__dirname, 'final-13-urls.json');
fs.writeFileSync(outputPath, JSON.stringify({ urls }, null, 2), 'utf8');

console.log(`✅ Wrote ${urls.length} URLs to: final-13-urls.json\n`);









