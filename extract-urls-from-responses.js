/**
 * Extract uploadUrl from API responses JSON file
 * Reads from api-responses.json and writes to final-13-urls.json
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'api-responses.json');
const outputFile = path.join(__dirname, 'final-13-urls.json');

if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}\n`);
    console.log(`💡 First, save the 13 API responses to: ${inputFile}\n`);
    console.log(`   Format: [{"uploadUrl": "..."}, {"uploadUrl": "..."}, ...]\n`);
    process.exit(1);
}

try {
    const responses = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const urls = responses
        .map(r => r.uploadUrl || r.response?.uploadUrl)
        .filter(Boolean);
    
    if (urls.length === 0) {
        console.error(`❌ No uploadUrl found in responses\n`);
        process.exit(1);
    }
    
    fs.writeFileSync(outputFile, JSON.stringify({ urls }, null, 2), 'utf8');
    console.log(`✅ Extracted ${urls.length} URLs from ${inputFile}\n`);
    console.log(`✅ Wrote to: ${outputFile}\n`);
    
    if (urls.length === 13) {
        console.log(`🎉 All 13 URLs saved!\n`);
    } else {
        console.log(`⚠️  Expected 13 URLs, got ${urls.length}\n`);
    }
} catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
}








