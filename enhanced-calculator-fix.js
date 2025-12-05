// Load hardcoded data from JSON files
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

// Override the initializeCalculator function to load hardcoded data
function initializeCalculator() {
    console.log('🚀 Loading hardcoded data instead of API calls...');
    
    // Load hardcoded products
    loadHardcodedProducts().then(products => {
        if (products && products.length > 0) {
            // Set the global allProducts variable
            allProducts = products;
            
            // Update the UI
            populateCategories();
            updateProductCount();
            
            console.log(`✅ Enhanced Calculator initialized with ${products.length} hardcoded products`);
        } else {
            console.log('❌ Failed to load hardcoded products, using sample data');
            loadEnhancedSampleData();
        }
        
        // Setup event listeners
        setupEventListeners();
    });
}

