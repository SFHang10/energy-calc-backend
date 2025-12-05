const fs = require('fs');

console.log('🔍 Merging ETL datasets to find missing refrigeration products...');

try {
    // Load main database
    const mainData = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    console.log(`📊 Main database: ${mainData.products.length} products`);

    // Load ETL static file
    const etlStaticData = JSON.parse(fs.readFileSync('etl-products-static.json', 'utf8'));
    console.log(`📊 ETL static file: ${etlStaticData.products.length} products`);

    // Get ETL products from static file (source: "ETL")
    const etlProducts = etlStaticData.products.filter(p => p.source === 'ETL');
    console.log(`🔧 ETL products from static file: ${etlProducts.length}`);

    // Check refrigeration products in ETL static file
    const etlRefrigeration = etlProducts.filter(p => 
        p.name.toLowerCase().includes('refrigerat') ||
        p.name.toLowerCase().includes('freezer') ||
        p.name.toLowerCase().includes('fridge') ||
        p.name.toLowerCase().includes('cooling') ||
        p.name.toLowerCase().includes('chiller') ||
        p.subcategory.toLowerCase().includes('refrigerat') ||
        p.subcategory.toLowerCase().includes('cooling')
    );

    console.log(`🧊 ETL refrigeration products: ${etlRefrigeration.length}`);

    // Check what's in our main database ETL Technology category
    const mainETLProducts = mainData.products.filter(p => p.category === 'ETL Technology');
    console.log(`🔧 Main database ETL products: ${mainETLProducts.length}`);

    // Check if ETL static products are already in main database
    const etlProductIds = new Set(mainETLProducts.map(p => p.id));
    const newETLProducts = etlProducts.filter(p => !etlProductIds.has(p.id));
    
    console.log(`🆕 New ETL products not in main database: ${newETLProducts.length}`);

    // Check refrigeration in new ETL products
    const newRefrigeration = newETLProducts.filter(p => 
        p.name.toLowerCase().includes('refrigerat') ||
        p.name.toLowerCase().includes('freezer') ||
        p.name.toLowerCase().includes('fridge') ||
        p.name.toLowerCase().includes('cooling') ||
        p.name.toLowerCase().includes('chiller') ||
        p.subcategory.toLowerCase().includes('refrigerat') ||
        p.subcategory.toLowerCase().includes('cooling')
    );

    console.log(`🧊 New refrigeration products: ${newRefrigeration.length}`);

    // Show first few new refrigeration products
    console.log('\n🧊 First 5 new refrigeration products:');
    newRefrigeration.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name} (${p.subcategory})`);
    });

    console.log('\n💡 Analysis:');
    console.log(`  - ETL Website shows: 2,582 refrigeration products`);
    console.log(`  - Main database has: 159 refrigeration products`);
    console.log(`  - ETL static file has: ${etlRefrigeration.length} refrigeration products`);
    console.log(`  - New refrigeration products: ${newRefrigeration.length}`);
    console.log(`  - Still missing: ${2582 - 159 - newRefrigeration.length} refrigeration products`);

} catch (error) {
    console.error('❌ Error:', error.message);
}





