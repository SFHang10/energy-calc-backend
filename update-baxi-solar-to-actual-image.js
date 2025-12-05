const fs = require('fs');
const path = require('path');

console.log('🔄 Updating Baxi Solarflo to use actual solar water heater image...\n');

const dbPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

try {
    // Read the JSON file
    console.log('📖 Reading database file...');
    const data = fs.readFileSync(dbPath, 'utf8');
    const database = JSON.parse(data);
    
    // Find the Baxi Solarflo product
    const productIndex = database.products.findIndex(p => p.id === 'etl_15_46852');
    
    if (productIndex === -1) {
        console.error('❌ Product not found: etl_15_46852');
        process.exit(1);
    }
    
    const product = database.products[productIndex];
    console.log(`✅ Found product: ${product.name}`);
    console.log(`   Current image: ${product.imageUrl}`);
    
    // Update to use the actual solar water heater image
    product.imageUrl = 'product-placement/Baxi-STS-1.jpeg';
    
    console.log(`   New image: ${product.imageUrl}`);
    console.log('   ✅ Using Baxi-STS-1.jpeg (solar water heater image)');
    
    // Write back to file
    console.log('\n💾 Writing updated database...');
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
    
    console.log('✅ Successfully updated Baxi Solarflo image!');
    console.log('\n📋 The product will now show the solar water heater image after deployment.');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}



