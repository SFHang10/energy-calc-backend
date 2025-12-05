const fs = require('fs');

console.log('🔍 Analyzing database structure for ETL vs Comparative products...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    console.log(`📊 Total products: ${data.products.length}`);
    
    // Check if products have ETL identification
    const hasETLField = data.products.some(p => p.hasOwnProperty('isETL') || p.hasOwnProperty('etlCertified') || p.hasOwnProperty('etlStatus'));
    console.log(`🔍 Has ETL identification field: ${hasETLField}`);
    
    // Check categories distribution
    const categories = {};
    data.products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    console.log('\n📂 Products by category:');
    Object.entries(categories).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} products`);
    });
    
    // Check if we can identify ETL products by category or other fields
    const etlTechnologyProducts = data.products.filter(p => p.category === 'ETL Technology');
    console.log(`\n🔧 ETL Technology products: ${etlTechnologyProducts.length}`);
    
    // Check for any ETL-related fields in product data
    const sampleProduct = data.products[0];
    console.log('\n📋 Sample product fields:');
    Object.keys(sampleProduct).forEach(key => {
        console.log(`  ${key}: ${typeof sampleProduct[key]}`);
    });
    
    // Check if products have source information
    const hasSourceField = data.products.some(p => p.hasOwnProperty('source') || p.hasOwnProperty('dataSource'));
    console.log(`\n🔍 Has source field: ${hasSourceField}`);
    
    console.log('\n💡 Recommendations:');
    console.log('  1. Add "isETL" field to distinguish ETL products');
    console.log('  2. Add "source" field (ETL, Comparative, etc.)');
    console.log('  3. Separate ETL products from comparative data');
    console.log('  4. Ensure all ETL refrigeration products are included');

} catch (error) {
    console.error('❌ Error:', error.message);
}





