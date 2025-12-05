/**
 * Simple test to verify file writing works
 */

const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, 'test-write-output.txt');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🧪 Testing file writing...\n');

// Test 1: Can we write a simple file?
try {
    fs.writeFileSync(testFile, 'Test write successful at ' + new Date().toISOString());
    console.log('✅ Test 1: Simple file write - SUCCESS');
    console.log(`   Wrote to: ${testFile}`);
} catch (error) {
    console.log('❌ Test 1: Simple file write - FAILED');
    console.log(`   Error: ${error.message}`);
}

// Test 2: Can we read the JSON file?
try {
    const stats = fs.statSync(jsonPath);
    console.log('\n✅ Test 2: JSON file exists and is readable');
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Last modified: ${stats.mtime}`);
} catch (error) {
    console.log('\n❌ Test 2: JSON file access - FAILED');
    console.log(`   Error: ${error.message}`);
}

// Test 3: Can we parse the JSON?
try {
    const content = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(content);
    console.log('\n✅ Test 3: JSON parsing - SUCCESS');
    console.log(`   Products count: ${data.products ? data.products.length : 'N/A'}`);
    
    // Find Carrier product
    const carrier = data.products.find(p => p.name === 'Carrier Refrigeration all glass door');
    if (carrier) {
        console.log(`   Carrier found: ${carrier.name}`);
        console.log(`   Current imageUrl: ${carrier.imageUrl}`);
    } else {
        console.log('   Carrier product NOT FOUND');
    }
} catch (error) {
    console.log('\n❌ Test 3: JSON parsing - FAILED');
    console.log(`   Error: ${error.message}`);
}

// Test 4: Can we modify and write back?
try {
    const content = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(content);
    
    // Make a small test change (add a comment field temporarily)
    const carrier = data.products.find(p => p.name === 'Carrier Refrigeration all glass door');
    if (carrier) {
        const oldImage = carrier.imageUrl;
        console.log('\n🧪 Test 4: Attempting to modify and write back...');
        console.log(`   Old imageUrl: ${oldImage}`);
        
        // Try to stringify
        const jsonString = JSON.stringify(data, null, 2);
        console.log(`   ✅ Stringified successfully (${jsonString.length} characters)`);
        
        // Try to write to a test file first
        const testJsonPath = jsonPath + '.test-write';
        fs.writeFileSync(testJsonPath, jsonString);
        console.log(`   ✅ Test write to ${path.basename(testJsonPath)} - SUCCESS`);
        
        // Clean up test file
        fs.unlinkSync(testJsonPath);
        console.log(`   ✅ Cleaned up test file`);
        
        console.log('\n✅ Test 4: Modify and write - SHOULD WORK');
        console.log('   The script CAN write the file, but may not be doing so.');
    } else {
        console.log('\n⚠️  Test 4: Carrier product not found, skipping write test');
    }
} catch (error) {
    console.log('\n❌ Test 4: Modify and write - FAILED');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
}

console.log('\n📊 Test Summary:');
console.log('   If all tests pass, the script SHOULD be able to update the file.');
console.log('   If tests fail, there may be a permission or file lock issue.');

