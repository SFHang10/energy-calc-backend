const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
const outputFile = path.join(__dirname, 'json-structure-test.txt');

let output = [];

function log(msg) {
    output.push(msg);
    console.log(msg);
}

try {
    log('Testing JSON structure...');
    const content = fs.readFileSync(jsonPath, 'utf8');
    log(`File size: ${content.length} characters`);
    
    const data = JSON.parse(content);
    log(`✅ JSON parsed successfully`);
    log(`Keys in root: ${Object.keys(data).join(', ')}`);
    
    if (data.products) {
        log(`✅ Found products array with ${data.products.length} products`);
        
        // Find Carrier products
        const carriers = data.products.filter(p => 
            p.name && p.name.includes('Carrier') && 
            p.imageUrl && p.imageUrl.includes('Motor')
        );
        log(`Found ${carriers.length} Carrier products with Motor.jpg`);
        
        if (carriers.length > 0) {
            log(`\nFirst Carrier product:`);
            log(`  ID: ${carriers[0].id}`);
            log(`  Name: ${carriers[0].name}`);
            log(`  Current imageUrl: ${carriers[0].imageUrl}`);
        }
    } else {
        log(`❌ NO products key found!`);
        log(`Available keys: ${Object.keys(data).join(', ')}`);
    }
    
} catch (error) {
    log(`❌ Error: ${error.message}`);
    log(`Stack: ${error.stack}`);
}

// Write to file
fs.writeFileSync(outputFile, output.join('\n'));
log(`\n✅ Results written to: json-structure-test.txt`);

