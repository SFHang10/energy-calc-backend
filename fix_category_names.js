const fs = require('fs');
const path = require('path');

console.log('🔄 Changing "professional-foodservice" back to "Restaurant Equipment" in JSON file...');

const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

try {
    // Read the JSON file
    console.log('📄 Reading JSON file...');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    if (!jsonData.products || !Array.isArray(jsonData.products)) {
        console.error('❌ Invalid JSON structure - no products array found');
        process.exit(1);
    }
    
    console.log(`📊 Found ${jsonData.products.length} products`);
    
    // Count products with "professional-foodservice" category
    const professionalFoodserviceProducts = jsonData.products.filter(p => p.category === 'professional-foodservice');
    console.log(`🔍 Found ${professionalFoodserviceProducts.length} products with "professional-foodservice" category`);
    
    // Change category from "professional-foodservice" to "Restaurant Equipment"
    let changedCount = 0;
    jsonData.products.forEach(product => {
        if (product.category === 'professional-foodservice') {
            product.category = 'Restaurant Equipment';
            changedCount++;
        }
    });
    
    console.log(`✅ Changed ${changedCount} products from "professional-foodservice" to "Restaurant Equipment"`);
    
    // Verify the change
    const restaurantEquipmentProducts = jsonData.products.filter(p => p.category === 'Restaurant Equipment');
    console.log(`📊 Now have ${restaurantEquipmentProducts.length} products with "Restaurant Equipment" category`);
    
    // Save the updated JSON file
    console.log('💾 Saving updated JSON file...');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    
    console.log('✅ JSON file updated successfully!');
    console.log('🔄 You may need to restart the server to see the changes');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}



















