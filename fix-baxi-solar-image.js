const fs = require('fs');
const path = require('path');

console.log('🔄 Fixing Baxi Solarflo image...\n');

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
    
    // Use HeatPump.Jpeg temporarily (it exists and is a heating-related image)
    // This will show an image until the user adds the correct solar water heater image
    product.imageUrl = 'product-placement/HeatPump.Jpeg';
    
    console.log(`   New image: ${product.imageUrl}`);
    console.log('   ⚠️  Using HeatPump.Jpeg temporarily - replace with solar water heater image when ready');
    
    // Write back to file
    console.log('\n💾 Writing updated database...');
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
    
    console.log('✅ Successfully updated Baxi Solarflo image!');
    console.log('\n📋 To use the solar water heater image:');
    console.log('   1. Add the solar water heater image to product-placement/ folder');
    console.log('   2. Name it: "Baxi Solarflo.jpg"');
    console.log('   3. Update the database to use: "product-placement/Baxi Solarflo.jpg"');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}



