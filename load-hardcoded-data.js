// Simple solution: Load hardcoded data from JSON files
// This bypasses the massive embedded file issue

// Function to load products from JSON files
async function loadHardcodedProducts() {
    try {
        console.log('🔄 Loading hardcoded products from JSON files...');
        
        // Try to load the full database JSON
        const response = await fetch('./FULL-DATABASE-5554.json');
        if (response.ok) {
            const data = await response.json();
            const products = data.products || data;
            
            if (products && products.length > 0) {
                console.log(`✅ Loaded ${products.length} products from FULL-DATABASE-5554.json`);
                return products;
            }
        }
        
        // Fallback: Try products with grants
        const grantsResponse = await fetch('./products-with-grants-and-collection.json');
        if (grantsResponse.ok) {
            const grantsData = await grantsResponse.json();
            const grantsProducts = grantsData.products || grantsData;
            
            if (grantsProducts && grantsProducts.length > 0) {
                console.log(`✅ Loaded ${grantsProducts.length} products from products-with-grants-and-collection.json`);
                return grantsProducts;
            }
        }
        
        throw new Error('No JSON files could be loaded');
        
    } catch (error) {
        console.log('⚠️ Failed to load JSON files:', error.message);
        return null;
    }
}

// Function to populate the Enhanced Calculator with hardcoded data
async function initializeEnhancedCalculatorWithHardcodedData() {
    console.log('🚀 Initializing Enhanced Calculator with hardcoded data...');
    
    // Load hardcoded products
    const products = await loadHardcodedProducts();
    
    if (products && products.length > 0) {
        // Set the global allProducts variable
        window.allProducts = products;
        
        // Update the UI
        populateCategories();
        updateProductCount();
        
        console.log(`✅ Enhanced Calculator initialized with ${products.length} hardcoded products`);
        return true;
    } else {
        console.log('❌ Failed to load hardcoded products');
        return false;
    }
}

// Auto-initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Enhanced Calculator: Loading hardcoded data...');
    initializeEnhancedCalculatorWithHardcodedData();
});

