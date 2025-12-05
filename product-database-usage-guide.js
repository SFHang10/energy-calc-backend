/**
 * PRODUCT DATABASE USAGE GUIDE
 * How to use the central product database with your calculators
 */

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

// 1. Include the database in your HTML file
// <script src="product-database.js"></script>

// 2. Get all products
const allProducts = getAllProducts();
console.log('Total products:', allProducts.length);

// 3. Get products by category
const dishwashers = getProductsByCategory('commercial_dishwashers');
console.log('Dishwashers:', dishwashers.length);

// 4. Get a specific product
const boschDishwasher = getProductById('bosch_professional_dishwasher_smi88ts06e');
console.log('Bosch Dishwasher:', boschDishwasher.name);

// 5. Search products
const searchResults = searchProducts('bosch');
console.log('Search results:', searchResults.length);

// 6. Get products formatted for calculators
const calculatorProducts = getProductsForCalculator('audit');
console.log('Calculator products:', calculatorProducts.length);

// ============================================================================
// INTEGRATION WITH EXISTING CALCULATORS
// ============================================================================

// For Audit Calculator - Replace getFallbackProducts function
function getFallbackProducts(type) {
    const allProducts = getAllProducts();
    return allProducts.filter(product => 
        product.calculatorData.type === type
    ).map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        power: product.power,
        energyRating: product.energyRating,
        runningCostPerYear: product.runningCostPerYear,
        icon: product.calculatorData.icon
    }));
}

// For Product Calculator - Replace API calls
function loadProductsFromDatabase() {
    const products = getProductsForCalculator('product');
    return products;
}

// For Marketplace - Use full product data
function loadProductFromDatabase(productId) {
    return getProductById(productId);
}

// ============================================================================
// ADVANCED USAGE
// ============================================================================

// Get products by energy rating
const aPlusProducts = getProductsByEnergyRating('A++');
console.log('A++ products:', aPlusProducts.length);

// Get products by price range
const affordableProducts = getProductsByPriceRange(100, 500);
console.log('Affordable products:', affordableProducts.length);

// Get products by brand
const boschProducts = getProductsByBrand('bosch');
console.log('Bosch products:', boschProducts.length);

// Get database statistics
const stats = getProductStatistics();
console.log('Database stats:', stats);

// ============================================================================
// CALCULATOR-SPECIFIC INTEGRATION
// ============================================================================

// Audit Calculator Integration
function integrateWithAuditCalculator() {
    // Replace the existing getFallbackProducts function
    window.getFallbackProducts = function(type) {
        return getProductsForCalculator('audit').filter(product => 
            product.calculatorData.type === type
        );
    };
}

// Product Calculator Integration
function integrateWithProductCalculator() {
    // Replace API calls with database calls
    window.loadProductsFromDatabase = function() {
        return getProductsForCalculator('product');
    };
}

// Marketplace Integration
function integrateWithMarketplace() {
    // Use full product data for marketplace
    window.loadProductFromDatabase = function(productId) {
        return getProductById(productId);
    };
}

// ============================================================================
// SAFE INTEGRATION STRATEGY
// ============================================================================

// 1. Test with a copy of your calculator first
// 2. Replace one function at a time
// 3. Test thoroughly before making changes to the main calculator
// 4. Keep backups of working versions

// Example safe integration:
function safeIntegrationTest() {
    console.log('🧪 Testing database integration...');
    
    // Test basic functions
    const products = getAllProducts();
    console.log('✅ Database loaded:', products.length, 'products');
    
    // Test category filtering
    const categories = getProductCategories();
    console.log('✅ Categories available:', categories);
    
    // Test product lookup
    const testProduct = getProductById('bosch_professional_dishwasher_smi88ts06e');
    console.log('✅ Product lookup:', testProduct ? 'Success' : 'Failed');
    
    // Test calculator formatting
    const calcProducts = getProductsForCalculator();
    console.log('✅ Calculator formatting:', calcProducts.length, 'products');
    
    console.log('🎉 Database integration test complete!');
}

// Run the test
safeIntegrationTest();






