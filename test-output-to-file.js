/**
 * Test if script actually runs by writing to a file
 */

const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, 'script-test-output.txt');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

// Clear previous output
fs.writeFileSync(outputFile, '');
function log(msg) {
    const message = msg + '\n';
    fs.appendFileSync(outputFile, message);
    console.log(msg); // Also try console
}

log('🧪 Script started at: ' + new Date().toISOString());
log('📁 Working directory: ' + __dirname);
log('📄 JSON file path: ' + jsonPath);
log('');

// Test file access
try {
    const stats = fs.statSync(jsonPath);
    log('✅ JSON file exists');
    log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    log('');
} catch (error) {
    log('❌ JSON file not found: ' + error.message);
    process.exit(1);
}

// Test JSON parsing
try {
    log('📖 Loading JSON file...');
    const content = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(content);
    log(`✅ JSON loaded: ${data.products ? data.products.length : 'N/A'} products`);
    log('');
    
    // Find Carrier product
    const carrier = data.products.find(p => p.name === 'Carrier Refrigeration all glass door');
    if (carrier) {
        log('✅ Found Carrier product:');
        log(`   ID: ${carrier.id}`);
        log(`   Name: ${carrier.name}`);
        log(`   Current imageUrl: ${carrier.imageUrl}`);
        log('');
        
        // Try to update it
        const oldImage = carrier.imageUrl;
        carrier.imageUrl = 'TEST-UPDATE-' + Date.now();
        log(`🧪 Test update: Changed imageUrl to: ${carrier.imageUrl}`);
        
        // Try to stringify
        const jsonString = JSON.stringify(data, null, 2);
        log(`✅ Stringified: ${jsonString.length} characters`);
        
        // Write to test file (not the real file)
        const testJsonPath = jsonPath + '.test-update';
        fs.writeFileSync(testJsonPath, jsonString);
        log(`✅ Test write successful: ${path.basename(testJsonPath)}`);
        
        // Restore original
        carrier.imageUrl = oldImage;
        log(`✅ Restored original imageUrl`);
        
        // Clean up test file
        fs.unlinkSync(testJsonPath);
        log(`✅ Cleaned up test file`);
        
    } else {
        log('❌ Carrier product NOT FOUND');
    }
    
} catch (error) {
    log('❌ Error: ' + error.message);
    log('   Stack: ' + error.stack);
}

log('');
log('✅ Script completed at: ' + new Date().toISOString());
log('📝 Check script-test-output.txt for full output');

