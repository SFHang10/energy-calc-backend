const fs = require('fs');
const path = require('path');

console.log('🔍 Checking categories in JSON file...');

try {
    const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📋 Total products in JSON: ${data.length}`);
    
    // Get unique categories
    const categories = [...new Set(data.map(product => product.category))].sort();
    
    console.log(`\n📂 Available categories:`);
    categories.forEach((category, index) => {
        const count = data.filter(p => p.category === category).length;
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
        const count = data.filter(p => p.category === cat).length;
        console.log(`- ${cat} (${count} products)`);
    });
    
} catch (error) {
    console.error('❌ Error reading JSON file:', error);
}



















