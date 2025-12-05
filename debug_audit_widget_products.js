// Debug script to check what products are being loaded in the Energy Audit Widget
console.log('🔍 DEBUGGING ENERGY AUDIT WIDGET PRODUCT LOADING\n');

// Check what's in the embedded files
console.log('📊 Checking embedded product files...\n');

// Check EMBEDDED_CURRENT_PRODUCTS
if (typeof EMBEDDED_CURRENT_PRODUCTS !== 'undefined') {
    console.log(`✅ EMBEDDED_CURRENT_PRODUCTS loaded: ${EMBEDDED_CURRENT_PRODUCTS.length} products`);
    
    // Show first few current products
    console.log('🔍 First 3 current products:');
    EMBEDDED_CURRENT_PRODUCTS.slice(0, 3).forEach(p => {
        console.log(`  - ${p.name} (${p.brand}) - Category: ${p.category}, Type: ${p.type}`);
    });
    
    // Count by category
    const currentCategories = {};
    EMBEDDED_CURRENT_PRODUCTS.forEach(p => {
        currentCategories[p.category] = (currentCategories[p.category] || 0) + 1;
    });
    console.log('📂 Current products by category:', currentCategories);
} else {
    console.log('❌ EMBEDDED_CURRENT_PRODUCTS not loaded');
}

console.log('\n');

// Check EMBEDDED_COMMERCIAL_PRODUCTS
if (typeof EMBEDDED_COMMERCIAL_PRODUCTS !== 'undefined') {
    console.log(`✅ EMBEDDED_COMMERCIAL_PRODUCTS loaded: ${EMBEDDED_COMMERCIAL_PRODUCTS.length} products`);
    
    // Show first few commercial products
    console.log('🔍 First 3 commercial products:');
    EMBEDDED_COMMERCIAL_PRODUCTS.slice(0, 3).forEach(p => {
        console.log(`  - ${p.name} (${p.brand}) - Category: ${p.category}, Type: ${p.type}`);
    });
    
    // Count by category
    const commercialCategories = {};
    EMBEDDED_COMMERCIAL_PRODUCTS.forEach(p => {
        commercialCategories[p.category] = (commercialCategories[p.category] || 0) + 1;
    });
    console.log('📂 Commercial products by category:', commercialCategories);
} else {
    console.log('❌ EMBEDDED_COMMERCIAL_PRODUCTS not loaded');
}

console.log('\n');

// Check EMBEDDED_ETL_PRODUCTS
if (typeof EMBEDDED_ETL_PRODUCTS !== 'undefined') {
    console.log(`✅ EMBEDDED_ETL_PRODUCTS loaded: ${EMBEDDED_ETL_PRODUCTS.length} products`);
    
    // Show first few ETL products
    console.log('🔍 First 3 ETL products:');
    EMBEDDED_ETL_PRODUCTS.slice(0, 3).forEach(p => {
        console.log(`  - ${p.name} (${p.brand}) - Category: ${p.category}, Type: ${p.type}`);
    });
    
    // Count by category
    const etlCategories = {};
    EMBEDDED_ETL_PRODUCTS.forEach(p => {
        etlCategories[p.category] = (etlCategories[p.category] || 0) + 1;
    });
    console.log('📂 ETL products by category:', etlCategories);
    
    // Check for fridge products specifically
    const fridgeProducts = EMBEDDED_ETL_PRODUCTS.filter(p => p.type === 'fridge');
    console.log(`\n🧊 ETL Fridge products: ${fridgeProducts.length}`);
    if (fridgeProducts.length > 0) {
        console.log('First 3 ETL fridge products:');
        fridgeProducts.slice(0, 3).forEach(p => {
            console.log(`  - ${p.name} (${p.brand}) - Power: ${p.power}W, Category: ${p.category}`);
        });
    }
} else {
    console.log('❌ EMBEDDED_ETL_PRODUCTS not loaded');
}

console.log('\n');

// Check allProducts array (if it exists)
if (typeof allProducts !== 'undefined') {
    console.log(`✅ allProducts array: ${allProducts.length} products`);
    
    // Count by category
    const allCategories = {};
    allProducts.forEach(p => {
        allCategories[p.category] = (allCategories[p.category] || 0) + 1;
    });
    console.log('📂 All products by category:', allCategories);
    
    // Check for fridge products
    const allFridgeProducts = allProducts.filter(p => p.type === 'fridge');
    console.log(`\n🧊 All Fridge products: ${allFridgeProducts.length}`);
    
    // Separate current vs efficient fridge products
    const currentFridgeProducts = allFridgeProducts.filter(p => p.category === 'current');
    const efficientFridgeProducts = allFridgeProducts.filter(p => p.category !== 'current');
    
    console.log(`  - Current fridge products: ${currentFridgeProducts.length}`);
    console.log(`  - Efficient fridge products: ${efficientFridgeProducts.length}`);
    
    if (efficientFridgeProducts.length > 0) {
        console.log('First 3 efficient fridge products:');
        efficientFridgeProducts.slice(0, 3).forEach(p => {
            console.log(`  - ${p.name} (${p.brand}) - Power: ${p.power}W, Category: ${p.category}`);
        });
    }
} else {
    console.log('❌ allProducts array not available');
}

console.log('\n✅ Debug complete!');


















