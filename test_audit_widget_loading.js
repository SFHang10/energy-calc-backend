// Quick test to check what products are actually loaded in the Energy Audit Widget
console.log('🔍 TESTING ENERGY AUDIT WIDGET PRODUCT LOADING\n');

// Check if embedded products are loaded
console.log('📊 Checking embedded product availability...\n');

if (typeof EMBEDDED_CURRENT_PRODUCTS !== 'undefined') {
    console.log(`✅ EMBEDDED_CURRENT_PRODUCTS: ${EMBEDDED_CURRENT_PRODUCTS.length} products`);
    
    // Check fridge products
    const currentFridges = EMBEDDED_CURRENT_PRODUCTS.filter(p => p.type === 'fridge');
    console.log(`🧊 Current fridge products: ${currentFridges.length}`);
    if (currentFridges.length > 0) {
        console.log('First 3 current fridges:');
        currentFridges.slice(0, 3).forEach(p => {
            console.log(`  - ${p.name} (${p.brand}) - Power: ${p.power}W, Category: ${p.category}`);
        });
    }
} else {
    console.log('❌ EMBEDDED_CURRENT_PRODUCTS not loaded');
}

console.log('\n');

if (typeof EMBEDDED_COMMERCIAL_PRODUCTS !== 'undefined') {
    console.log(`✅ EMBEDDED_COMMERCIAL_PRODUCTS: ${EMBEDDED_COMMERCIAL_PRODUCTS.length} products`);
    
    // Check fridge products
    const commercialFridges = EMBEDDED_COMMERCIAL_PRODUCTS.filter(p => p.type === 'fridge');
    console.log(`🧊 Commercial fridge products: ${commercialFridges.length}`);
    if (commercialFridges.length > 0) {
        console.log('First 3 commercial fridges:');
        commercialFridges.slice(0, 3).forEach(p => {
            console.log(`  - ${p.name} (${p.brand}) - Power: ${p.power}W, Category: ${p.category}`);
        });
    }
} else {
    console.log('❌ EMBEDDED_COMMERCIAL_PRODUCTS not loaded');
}

console.log('\n');

if (typeof EMBEDDED_ETL_PRODUCTS !== 'undefined') {
    console.log(`✅ EMBEDDED_ETL_PRODUCTS: ${EMBEDDED_ETL_PRODUCTS.length} products`);
    
    // Check fridge products
    const etlFridges = EMBEDDED_ETL_PRODUCTS.filter(p => p.type === 'fridge');
    console.log(`🧊 ETL fridge products: ${etlFridges.length}`);
    if (etlFridges.length > 0) {
        console.log('First 3 ETL fridges:');
        etlFridges.slice(0, 3).forEach(p => {
            console.log(`  - ${p.name} (${p.brand}) - Power: ${p.power}W, Category: ${p.category}`);
        });
    }
} else {
    console.log('❌ EMBEDDED_ETL_PRODUCTS not loaded');
}

console.log('\n');

// Check allProducts array
if (typeof allProducts !== 'undefined') {
    console.log(`✅ allProducts array: ${allProducts.length} products`);
    
    // Check fridge products
    const allFridges = allProducts.filter(p => p.type === 'fridge');
    console.log(`🧊 All fridge products: ${allFridges.length}`);
    
    // Separate by category
    const currentFridges = allFridges.filter(p => p.category === 'current');
    const etlFridges = allFridges.filter(p => p.category !== 'current');
    
    console.log(`  - Current fridges: ${currentFridges.length}`);
    console.log(`  - ETL fridges: ${etlFridges.length}`);
    
    if (etlFridges.length > 0) {
        console.log('First 3 ETL fridges in allProducts:');
        etlFridges.slice(0, 3).forEach(p => {
            console.log(`  - ${p.name} (${p.brand}) - Power: ${p.power}W, Category: ${p.category}`);
        });
    }
} else {
    console.log('❌ allProducts array not available');
}

console.log('\n✅ Test complete!');


















