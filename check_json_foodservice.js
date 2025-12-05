const fs = require('fs');

console.log('🔍 Checking professional foodservice products in JSON file...\n');

const data = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
const products = data.products || [];

const foodserviceProducts = products.filter(p => 
    (p.name && (
        p.name.toLowerCase().includes('oven') || 
        p.name.toLowerCase().includes('steam') || 
        p.name.toLowerCase().includes('dishwasher') || 
        p.name.toLowerCase().includes('combination') || 
        p.name.toLowerCase().includes('convection') || 
        p.name.toLowerCase().includes('undercounter') || 
        p.name.toLowerCase().includes('hood-type') || 
        p.name.toLowerCase().includes('foodservice')
    )) ||
    (p.brand && (
        p.brand.toLowerCase().includes('electrolux') || 
        p.brand.toLowerCase().includes('lainox') || 
        p.brand.toLowerCase().includes('eloma') || 
        p.brand.toLowerCase().includes('lincat')
    ))
);

console.log(`Found ${foodserviceProducts.length} professional foodservice products in JSON:`);
console.log('================================================================================');

foodserviceProducts.forEach((product, index) => {
    const hasImage = product.image_url && product.image_url !== '';
    const status = hasImage ? '✅ HAS IMAGE' : '❌ NO IMAGE';
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   Brand: ${product.brand}`);
    console.log(`   Status: ${status}`);
    console.log(`   Image URL: ${product.image_url || 'NULL/EMPTY'}`);
    console.log('');
});



















