const fs = require('fs');

console.log('🔍 Analyzing ETL Products Static File...');

try {
    const etlData = JSON.parse(fs.readFileSync('etl-products-static.json', 'utf8'));

    console.log(`📊 Total products: ${etlData.totalProducts}`);

    // Check for refrigeration products
    const refrigerationProducts = etlData.products.filter(p => 
        p.name.toLowerCase().includes('refrigerat') ||
        p.name.toLowerCase().includes('freezer') ||
        p.name.toLowerCase().includes('fridge') ||
        p.name.toLowerCase().includes('cooling') ||
        p.name.toLowerCase().includes('chiller') ||
        p.subcategory.toLowerCase().includes('refrigerat') ||
        p.subcategory.toLowerCase().includes('cooling')
    );

    console.log(`🧊 Refrigeration products: ${refrigerationProducts.length}`);

    // Check categories
    const categories = {};
    etlData.products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });

    console.log('\n📂 Categories:');
    Object.entries(categories).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} products`);
    });

    // Check sources
    const sources = {};
    etlData.products.forEach(p => {
        sources[p.source] = (sources[p.source] || 0) + 1;
    });

    console.log('\n🔍 Sources:');
    Object.entries(sources).forEach(([source, count]) => {
        console.log(`  ${source}: ${count} products`);
    });

    // Show first few refrigeration products
    console.log('\n🧊 First 5 refrigeration products:');
    refrigerationProducts.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name} (${p.subcategory}) [${p.source}]`);
    });

    // Check if this has more refrigeration products than our main database
    console.log('\n💡 Comparison:');
    console.log(`  ETL Static File: ${refrigerationProducts.length} refrigeration products`);
    console.log(`  Main Database: 159 refrigeration products`);
    console.log(`  Difference: ${refrigerationProducts.length - 159} more refrigeration products`);

} catch (error) {
    console.error('❌ Error:', error.message);
}





