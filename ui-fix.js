// Force UI update after data loads
setTimeout(() => {
    console.log('🔄 Force updating UI...');
    
    // Check if data is loaded
    if (window.ENHANCED_PRODUCTS_DATABASE && window.ENHANCED_PRODUCTS_DATABASE.products) {
        console.log('✅ Data found, updating UI...');
        
        // Set the products
        allProducts = window.ENHANCED_PRODUCTS_DATABASE.products;
        
        // Force UI update
        if (typeof populateCategories === 'function') {
            populateCategories();
        }
        if (typeof populateProductSelects === 'function') {
            populateProductSelects();
        }
        if (typeof updateProductCount === 'function') {
            updateProductCount();
        }
        
        console.log('✅ UI updated with', allProducts.length, 'products');
    } else {
        console.log('❌ No data found');
    }
}, 2000);

