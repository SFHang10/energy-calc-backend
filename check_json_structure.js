const fs = require('fs');
const path = require('path');

console.log('🔍 Checking JSON file structure...');

try {
    const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log('📋 JSON structure:');
    console.log('Type:', typeof data);
    console.log('Keys:', Object.keys(data));
    
    if (data.products) {
        console.log(`\n📦 Products array length: ${data.products.length}`);
        
        // Get unique categories
        const categories = [...new Set(data.products.map(product => product.category))].sort();
        
        console.log(`\n📂 Available categories:`);
        categories.forEach((category, index) => {
            const count = data.products.filter(p => p.category === category).length;
            console.log(`${index + 1}. ${category} (${count} products)`);
        });
        
        // Check for restaurant/foodservice related categories
        const foodserviceCategories = categories.filter(cat => 
            cat.toLowerCase().includes('restaurant') || 
            cat.toLowerCase().includes('foodservice') ||
            cat.toLowerCase().includes('professional')
        );
        
        console.log(`\n🍽️ Foodservice-related categories:`);
        foodserviceCategories.forEach(cat => {
            const count = data.products.filter(p => p.category === cat).length;
            console.log(`- ${cat} (${count} products)`);
        });
        
        // Show some sample products from Restaurant Equipment
        const restaurantProducts = data.products.filter(p => p.category === 'Restaurant Equipment');
        console.log(`\n🍽️ Sample Restaurant Equipment products:`);
        restaurantProducts.slice(0, 5).forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} (${product.brand}) - Image: ${product.imageUrl ? 'YES' : 'NO'}`);
        });
        
    } else {
        console.log('❌ No products array found');
    }
    
} catch (error) {
    console.error('❌ Error reading JSON file:', error);
}



















