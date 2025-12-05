const fs = require('fs');

console.log('🔍 Analyzing database categories...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    const categories = {};
    data.products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    console.log('📊 Category breakdown:');
    Object.entries(categories).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} products`);
    });
    
    // Find the largest category for our chunk
    const largestCategory = Object.entries(categories).reduce((a, b) => a[1] > b[1] ? a : b);
    console.log(`\n🎯 Largest category: ${largestCategory[0]} with ${largestCategory[1]} products`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





