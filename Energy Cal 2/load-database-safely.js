// SAFE DATABASE LOADER
// This script safely loads the product database backup into the calculator
// without losing any existing functionality

(function() {
    'use strict';
    
    console.log('🔄 Loading product database backup...');
    
    // Check if the backup database exists
    if (typeof PRODUCT_DATABASE_BACKUP === 'undefined') {
        console.error('❌ PRODUCT_DATABASE_BACKUP not found. Please include the backup file first.');
        return;
    }
    
    // Safely load the database
    try {
        const database = PRODUCT_DATABASE_BACKUP.exportToCalculator();
        
        // Update the global allProducts array safely
        if (typeof window !== 'undefined' && window.allProducts) {
            // Merge with existing products, avoiding duplicates
            const existingIds = new Set(window.allProducts.map(p => p.id));
            const newProducts = database.products.filter(p => !existingIds.has(p.id));
            
            window.allProducts = [...window.allProducts, ...newProducts];
            console.log(`✅ Successfully loaded ${newProducts.length} new products. Total: ${window.allProducts.length}`);
        } else {
            // Create new array if none exists
            window.allProducts = [...database.products];
            console.log(`✅ Created new product array with ${database.products.length} products`);
        }
        
        // Update categories if they don't exist
        if (!window.categories || window.categories.length < database.categories.length) {
            window.categories = [...database.categories];
            console.log('✅ Updated categories array');
        }
        
        // Update category descriptions
        if (!window.categoryDescriptions) {
            window.categoryDescriptions = { ...database.categoryDescriptions };
        }
        
        // Update subcategory mappings
        if (!window.subcategoryMappings) {
            window.subcategoryMappings = { ...database.subcategoryMappings };
        }
        
        console.log('🎉 Database backup loaded successfully!');
        console.log(`📊 Total products: ${window.allProducts.length}`);
        console.log(`🏷️  Categories: ${window.categories.join(', ')}`);
        
    } catch (error) {
        console.error('❌ Error loading database backup:', error);
        console.log('🔄 Attempting fallback...');
        
        // Fallback: try to load just the basic products
        try {
            const basicProducts = PRODUCT_DATABASE_BACKUP.sampleProducts.slice(0, 20);
            if (typeof window !== 'undefined') {
                window.allProducts = basicProducts;
                console.log(`✅ Fallback: Loaded ${basicProducts.length} basic products`);
            }
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
        }
    }
})();


