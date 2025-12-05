const fs = require('fs');
const path = require('path');

// Check what we actually changed in the JSON file
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🔍 Checking what we changed in the JSON file...\n');

try {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const jsonData = JSON.parse(jsonContent);
    
    console.log(`📄 JSON file contains ${jsonData.products.length} products`);
    
    // Check if we have any professional-foodservice products
    const foodserviceProducts = jsonData.products.filter(p => p.category === 'professional-foodservice');
    console.log(`🍽️ Professional-foodservice products: ${foodserviceProducts.length}`);
    
    // Check what fields exist in the products
    if (foodserviceProducts.length > 0) {
        const sampleProduct = foodserviceProducts[0];
        console.log('\n📋 Sample product fields:');
        Object.keys(sampleProduct).forEach(key => {
            console.log(`   - ${key}: ${typeof sampleProduct[key]}`);
        });
        
        console.log('\n🔍 Checking for calculator-related fields:');
        const calculatorFields = ['power', 'energyRating', 'efficiency', 'runningCostPerYear', 'calculatorData'];
        calculatorFields.forEach(field => {
            if (sampleProduct[field] !== undefined) {
                console.log(`   ✅ ${field}: ${sampleProduct[field]}`);
            } else {
                console.log(`   ❌ ${field}: missing`);
            }
        });
    }
    
} catch (error) {
    console.error('❌ Error reading JSON file:', error);
}



















