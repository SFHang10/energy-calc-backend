const fs = require('fs');
const path = require('path');

console.log('🔄 Fixing category mismatch in JSON file...');

try {
    const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📋 Original data: ${data.products.length} products`);
    
    // Count products by category before change
    const originalCategories = {};
    data.products.forEach(product => {
        originalCategories[product.category] = (originalCategories[product.category] || 0) + 1;
    });
    
    console.log('\n📂 Original categories:');
    Object.entries(originalCategories).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} products`);
    });
    
    // Change "Restaurant Equipment" to "professional-foodservice"
    let changedCount = 0;
    data.products.forEach(product => {
        if (product.category === 'Restaurant Equipment') {
            product.category = 'professional-foodservice';
            changedCount++;
        }
    });
    
    console.log(`\n✅ Changed ${changedCount} products from "Restaurant Equipment" to "professional-foodservice"`);
    
    // Count products by category after change
    const newCategories = {};
    data.products.forEach(product => {
        newCategories[product.category] = (newCategories[product.category] || 0) + 1;
    });
    
    console.log('\n📂 Updated categories:');
    Object.entries(newCategories).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} products`);
    });
    
    // Save the updated JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log('\n💾 Updated JSON file saved successfully!');
    
    console.log('\n🌐 Test the preview page:');
    console.log('   http://localhost:4000/category-product-page.html?category=professional-foodservice');
    
} catch (error) {
    console.error('❌ Error updating JSON file:', error);
}



















