const fs = require('fs');

console.log('🔍 Checking ALL products in professional-foodservice category...\n');

const data = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
const products = data.products || [];

// Check how the frontend filters products (from category-product-page.html)
const professionalFoodserviceProducts = products.filter(p => 
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

console.log(`📊 Professional Foodservice Category Summary:`);
console.log(`   Total products in category: ${professionalFoodserviceProducts.length}`);
console.log(`   Products with images: ${professionalFoodserviceProducts.filter(p => p.image_url && p.image_url !== '').length}`);
console.log(`   Products without images: ${professionalFoodserviceProducts.filter(p => !p.image_url || p.image_url === '').length}`);

console.log('\n🔍 First 10 products in the category:');
professionalFoodserviceProducts.slice(0, 10).forEach((product, index) => {
    const hasImage = product.image_url && product.image_url !== '';
    const status = hasImage ? '✅ HAS IMAGE' : '❌ NO IMAGE';
    console.log(`${index + 1}. ${product.name} (${product.brand}) - ${status}`);
});

console.log('\n💡 Note: We fixed the 11 products that had images in the database.');
console.log('   The remaining products still need images to be added.');



















