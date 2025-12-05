/**
 * Write URLs to final-13-urls.json from environment variables or JSON input
 * NO LONG URLS IN CODE - accepts URLs from environment or file input
 */

const fs = require('fs');
const path = require('path');

// Option 1: Read URLs from environment variable (comma-separated)
// Option 2: Read from a separate JSON file
// Option 3: Read from stdin

const urlsSource = process.env.UPLOAD_URLS || null;
const urlsFile = process.argv[2] || 'urls-input.json';

let urls = [];

if (urlsSource) {
    // Option 1: From environment variable
    urls = urlsSource.split(',').map(u => u.trim()).filter(u => u);
    console.log(`📋 Read ${urls.length} URLs from environment variable\n`);
} else if (fs.existsSync(urlsFile)) {
    // Option 2: From file
    const input = JSON.parse(fs.readFileSync(urlsFile, 'utf8'));
    urls = Array.isArray(input) ? input : (input.urls || []);
    console.log(`📋 Read ${urls.length} URLs from ${urlsFile}\n`);
} else {
    console.error(`❌ No URLs source found. Provide via:`);
    console.error(`   Option 1: $env:UPLOAD_URLS="url1,url2,..."`);
    console.error(`   Option 2: Create ${urlsFile} with {"urls": [...]}`);
    process.exit(1);
}

if (urls.length === 0) {
    console.error(`❌ No URLs found\n`);
    process.exit(1);
}

// Write to final-13-urls.json
const outputPath = path.join(__dirname, 'final-13-urls.json');
fs.writeFileSync(outputPath, JSON.stringify({ urls }, null, 2), 'utf8');

console.log(`✅ Wrote ${urls.length} URLs to: final-13-urls.json\n`);









