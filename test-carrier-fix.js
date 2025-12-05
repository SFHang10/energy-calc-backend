const fs = require('fs');
const path = require('path');

console.log('Starting test...');
console.log('Current directory:', __dirname);

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('Checking if file exists...');
if (!fs.existsSync(FULL_DATABASE_PATH)) {
    console.error('File not found:', FULL_DATABASE_PATH);
    process.exit(1);
}

console.log('File exists, getting size...');
const stats = fs.statSync(FULL_DATABASE_PATH);
console.log('File size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

console.log('Loading JSON (this may take a moment)...');
const startTime = Date.now();
let database;
try {
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    console.log('File read, parsing JSON...');
    database = JSON.parse(databaseContent);
    console.log(`✅ Loaded ${database.products?.length || 0} products in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

console.log('Searching for Carrier products with Motor.jpg...');
const carrierProductsToFix = database.products.filter(p => 
    p.brand && p.brand.includes('Carrier') &&
    p.imageUrl && (
        p.imageUrl.includes('Motor.jpg') || 
        p.imageUrl.includes('Motor.jpeg') ||
        p.imageUrl === 'Product Placement/Motor.jpg'
    )
);

console.log(`\n📦 Found ${carrierProductsToFix.length} Carrier products with Motor.jpg`);

if (carrierProductsToFix.length > 0) {
    console.log('\n🔍 First 5 products to fix:');
    carrierProductsToFix.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.id}: ${p.name}`);
        console.log(`      Current: ${p.imageUrl}`);
    });
}

console.log('\n✅ Test complete!');

