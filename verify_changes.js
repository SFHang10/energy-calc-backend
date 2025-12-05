const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying what products were changed...');

try {
    const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📋 Total products: ${data.products.length}`);
    
    // Check professional-foodservice products
    const professionalProducts = data.products.filter(p => p.category === 'professional-foodservice');
    console.log(`\n🍽️ Professional-foodservice products (${professionalProducts.length}):`);
    
    professionalProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.brand}) - Image: ${product.imageUrl ? 'YES' : 'NO'}`);
    });
    
    // Check if there are any remaining "Restaurant Equipment" products
    const restaurantProducts = data.products.filter(p => p.category === 'Restaurant Equipment');
    console.log(`\n🏪 Remaining "Restaurant Equipment" products: ${restaurantProducts.length}`);
    
    if (restaurantProducts.length > 0) {
        restaurantProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} (${product.brand})`);
        });
    }
    
    // Count all categories
    const categoryCounts = {};
    data.products.forEach(product => {
        categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    });
    
    console.log(`\n📊 All categories:`);
    Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} products`);
    });
    
} catch (error) {
    console.error('❌ Error:', error);
}



















