// EXPAND DATABASE SAFELY - MASTER SCRIPT
// This script safely adds all expansion batches to the database

console.log('🔄 Starting safe database expansion...');

// Load all expansion batches
function loadExpansionBatches() {
    console.log('📦 Loading expansion batches...');
    
    // Check if database exists
    if (typeof PRODUCT_DATABASE_BACKUP === 'undefined') {
        console.error('❌ Database not found - cannot expand');
        return false;
    }
    
    const originalCount = PRODUCT_DATABASE_BACKUP.getProductCount();
    console.log('📊 Original product count:', originalCount);
    
    // Add washing machines
    if (typeof ADDITIONAL_WASHING_MACHINES !== 'undefined') {
        PRODUCT_DATABASE_BACKUP.sampleProducts.push(...ADDITIONAL_WASHING_MACHINES);
        console.log('✅ Added washing machines');
    }
    
    // Add dishwashers
    if (typeof ADDITIONAL_DISHWASHERS !== 'undefined') {
        PRODUCT_DATABASE_BACKUP.sampleProducts.push(...ADDITIONAL_DISHWASHERS);
        console.log('✅ Added dishwashers');
    }
    
    // Add refrigerators
    if (typeof ADDITIONAL_REFRIGERATORS !== 'undefined') {
        PRODUCT_DATABASE_BACKUP.sampleProducts.push(...ADDITIONAL_REFRIGERATORS);
        console.log('✅ Added refrigerators');
    }
    
    // Add lighting products
    if (typeof ADDITIONAL_LIGHTING_PRODUCTS !== 'undefined') {
        PRODUCT_DATABASE_BACKUP.sampleProducts.push(...ADDITIONAL_LIGHTING_PRODUCTS);
        console.log('✅ Added lighting products');
    }
    
    // Add heating products
    if (typeof ADDITIONAL_HEATING_PRODUCTS !== 'undefined') {
        PRODUCT_DATABASE_BACKUP.sampleProducts.push(...ADDITIONAL_HEATING_PRODUCTS);
        console.log('✅ Added heating products');
    }
    
    const newCount = PRODUCT_DATABASE_BACKUP.getProductCount();
    const added = newCount - originalCount;
    
    console.log('🎉 Database expansion complete!');
    console.log('📊 Products added:', added);
    console.log('📊 Total products now:', newCount);
    
    return true;
}

// Safe expansion function
function expandDatabase() {
    try {
        return loadExpansionBatches();
    } catch (error) {
        console.error('❌ Error during expansion:', error);
        return false;
    }
}

// Export for safe use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { expandDatabase };
} else {
    window.expandDatabase = expandDatabase;
}
