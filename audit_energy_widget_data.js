// Check what data the Energy Audit Widget is receiving
console.log('🔍 AUDITING ENERGY AUDIT WIDGET DATA SOURCES\n');

// Check allProducts array structure
if (typeof allProducts !== 'undefined') {
    console.log(`📊 allProducts array: ${allProducts.length} products`);
    
    // Check first few products for data structure
    console.log('\n🔍 Sample products from allProducts:');
    allProducts.slice(0, 3).forEach((product, index) => {
        console.log(`\nProduct ${index + 1}:`);
        console.log(`  - Name: ${product.name}`);
        console.log(`  - ID: ${product.id}`);
        console.log(`  - Power: ${product.power}`);
        console.log(`  - Category: ${product.category}`);
        console.log(`  - Brand: ${product.brand}`);
        console.log(`  - Energy Rating: ${product.energyRating}`);
        console.log(`  - Running Cost: ${product.runningCostPerYear}`);
        console.log(`  - Source: ${product.source}`);
        
        // Check for grants and schemes
        console.log(`  - Has Grants: ${product.grants ? 'Yes' : 'No'}`);
        console.log(`  - Has Collection Agencies: ${product.collectionAgencies ? 'Yes' : 'No'}`);
        console.log(`  - Has Calculator Data: ${product.calculatorData ? 'Yes' : 'No'}`);
        
        // Show all available fields
        console.log(`  - Available fields: ${Object.keys(product).join(', ')}`);
    });
    
    // Check data sources breakdown
    console.log('\n📈 Data Sources Breakdown:');
    const sourceCounts = {};
    allProducts.forEach(p => {
        const source = p.source || 'unknown';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    console.log(sourceCounts);
    
    // Check for grants and collections data
    console.log('\n🎯 Grants and Collections Analysis:');
    const productsWithGrants = allProducts.filter(p => p.grants);
    const productsWithCollections = allProducts.filter(p => p.collectionAgencies);
    const productsWithCalculatorData = allProducts.filter(p => p.calculatorData);
    
    console.log(`- Products with grants: ${productsWithGrants.length}`);
    console.log(`- Products with collection agencies: ${productsWithCollections.length}`);
    console.log(`- Products with calculator data: ${productsWithCalculatorData.length}`);
    
    if (productsWithGrants.length > 0) {
        console.log('\n🔍 Sample grants data:');
        console.log(productsWithGrants[0].grants);
    }
    
    if (productsWithCollections.length > 0) {
        console.log('\n🔍 Sample collection agencies data:');
        console.log(productsWithCollections[0].collectionAgencies);
    }
    
} else {
    console.log('❌ allProducts array not available');
}

// Check embedded data sources
console.log('\n📚 EMBEDDED DATA SOURCES:');

if (typeof EMBEDDED_CURRENT_PRODUCTS !== 'undefined') {
    console.log(`✅ EMBEDDED_CURRENT_PRODUCTS: ${EMBEDDED_CURRENT_PRODUCTS.length} products`);
    if (EMBEDDED_CURRENT_PRODUCTS.length > 0) {
        console.log('Sample current product fields:', Object.keys(EMBEDDED_CURRENT_PRODUCTS[0]));
    }
} else {
    console.log('❌ EMBEDDED_CURRENT_PRODUCTS not loaded');
}

if (typeof EMBEDDED_COMMERCIAL_PRODUCTS !== 'undefined') {
    console.log(`✅ EMBEDDED_COMMERCIAL_PRODUCTS: ${EMBEDDED_COMMERCIAL_PRODUCTS.length} products`);
    if (EMBEDDED_COMMERCIAL_PRODUCTS.length > 0) {
        console.log('Sample commercial product fields:', Object.keys(EMBEDDED_COMMERCIAL_PRODUCTS[0]));
    }
} else {
    console.log('❌ EMBEDDED_COMMERCIAL_PRODUCTS not loaded');
}

if (typeof EMBEDDED_ETL_PRODUCTS !== 'undefined') {
    console.log(`✅ EMBEDDED_ETL_PRODUCTS: ${EMBEDDED_ETL_PRODUCTS.length} products`);
    if (EMBEDDED_ETL_PRODUCTS.length > 0) {
        console.log('Sample ETL product fields:', Object.keys(EMBEDDED_ETL_PRODUCTS[0]));
        
        // Check ETL product power values
        const etlWithPower = EMBEDDED_ETL_PRODUCTS.filter(p => p.power && p.power !== 'Unknown' && !isNaN(p.power));
        const etlWithoutPower = EMBEDDED_ETL_PRODUCTS.filter(p => !p.power || p.power === 'Unknown' || isNaN(p.power));
        
        console.log(`- ETL products with valid power: ${etlWithPower.length}`);
        console.log(`- ETL products without valid power: ${etlWithoutPower.length}`);
        
        if (etlWithPower.length > 0) {
            console.log('Sample ETL product with power:', etlWithPower[0].name, etlWithPower[0].power);
        }
        if (etlWithoutPower.length > 0) {
            console.log('Sample ETL product without power:', etlWithoutPower[0].name, etlWithoutPower[0].power);
        }
    }
} else {
    console.log('❌ EMBEDDED_ETL_PRODUCTS not loaded');
}

console.log('\n✅ Data audit complete!');


















