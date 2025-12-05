const fs = require('fs');

console.log('🔍 Checking ETL Technology category for refrigeration products...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));

    const etlProducts = data.products.filter(p => p.category === 'ETL Technology');
    console.log(`ETL Technology products: ${etlProducts.length}`);

    const etlSubcategories = [...new Set(etlProducts.map(p => p.subcategory))];
    console.log(`ETL subcategories: ${etlSubcategories.length}`);

    console.log('\nFirst 20 ETL subcategories:');
    etlSubcategories.slice(0, 20).forEach(subcat => {
        const count = etlProducts.filter(p => p.subcategory === subcat).length;
        console.log(`  ${subcat}: ${count} products`);
    });

    // Check for refrigeration-related subcategories
    const refrigerationSubcats = etlSubcategories.filter(subcat => 
        subcat.toLowerCase().includes('refrigerat') ||
        subcat.toLowerCase().includes('cooling') ||
        subcat.toLowerCase().includes('chiller') ||
        subcat.toLowerCase().includes('condenser') ||
        subcat.toLowerCase().includes('freezer') ||
        subcat.toLowerCase().includes('fridge')
    );

    console.log('\nRefrigeration-related subcategories:');
    refrigerationSubcats.forEach(subcat => {
        const count = etlProducts.filter(p => p.subcategory === subcat).length;
        console.log(`  ${subcat}: ${count} products`);
    });

    console.log('\n💡 Issue Analysis:');
    console.log(`  - ETL website shows: 2,582 refrigeration products`);
    console.log(`  - Our database has: ${refrigerationSubcats.reduce((sum, subcat) => sum + etlProducts.filter(p => p.subcategory === subcat).length, 0)} refrigeration products`);
    console.log('  - We are missing a huge number of ETL refrigeration products!');

} catch (error) {
    console.error('❌ Error:', error.message);
}





