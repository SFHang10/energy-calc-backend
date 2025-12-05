/**
 * CALCULATOR GRANTS INTEGRATION
 * Simple integration script for calculators to use hardcoded product grants
 * No API calls needed - everything is hardcoded for instant access
 */

// Import the hardcoded grants system
const {
    getProductGrants,
    calculateProductGrantTotal,
    formatProductGrantsDisplay
} = require('./hardcoded-grants-system.js');

console.log('🏛️ CALCULATOR GRANTS INTEGRATION - Hardcoded System\n');

// ============================================================================
// GRANTS INTEGRATION FUNCTIONS FOR CALCULATORS
// ============================================================================

/**
 * Get grants for a product in a specific region
 * @param {Object} product - Product object
 * @param {string} region - Region code (default: 'uk.england')
 * @returns {Object} Grants information
 */
function getProductGrantsInfo(product, region = 'uk.england') {
    if (!product || !product.category) {
        return {
            grants: [],
            totalAmount: 0,
            currency: 'EUR',
            count: 0,
            hasGrants: false
        };
    }
    
    // Get grants from hardcoded system
    const grants = getProductGrants(product, region);
    const totalAmount = calculateProductGrantTotal(product, region);
    
    return {
        grants: grants,
        totalAmount: totalAmount,
        currency: grants.length > 0 ? grants[0].currency : 'EUR',
        count: grants.length,
        hasGrants: grants.length > 0,
        region: region
    };
}

/**
 * Calculate net cost after grants
 * @param {number} originalCost - Original product cost
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {Object} Cost calculation with grants
 */
function calculateNetCostWithGrants(originalCost, product, region = 'uk.england') {
    const grantsInfo = getProductGrantsInfo(product, region);
    
    return {
        originalCost: originalCost,
        grantsTotal: grantsInfo.totalAmount,
        netCost: Math.max(0, originalCost - grantsInfo.totalAmount),
        savings: grantsInfo.totalAmount,
        savingsPercentage: originalCost > 0 ? (grantsInfo.totalAmount / originalCost) * 100 : 0,
        currency: grantsInfo.currency,
        grantsCount: grantsInfo.count,
        hasGrants: grantsInfo.hasGrants
    };
}

/**
 * Display grants information in calculator UI
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @param {string} containerId - HTML container ID
 */
function displayProductGrants(product, region = 'uk.england', containerId = 'grants-container') {
    const grantsInfo = getProductGrantsInfo(product, region);
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
    }
    
    if (!grantsInfo.hasGrants) {
        container.innerHTML = `
            <div class="no-grants-message">
                <h4>No Grants Available</h4>
                <p>No grants currently available for this product in ${region}.</p>
                <p>Check back regularly as new schemes are frequently introduced.</p>
            </div>
        `;
        return;
    }
    
    const grantsHtml = formatProductGrantsDisplay(grantsInfo.grants, region);
    container.innerHTML = grantsHtml;
}

/**
 * Update calculator results with grants information
 * @param {Object} calculationResult - Calculator result object
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {Object} Updated calculation result with grants
 */
function updateCalculationWithGrants(calculationResult, product, region = 'uk.england') {
    const grantsInfo = getProductGrantsInfo(product, region);
    
    if (!grantsInfo.hasGrants) {
        return {
            ...calculationResult,
            grants: {
                available: false,
                message: 'No grants available for this product'
            }
        };
    }
    
    const netCost = calculateNetCostWithGrants(calculationResult.totalCost || 0, product, region);
    
    return {
        ...calculationResult,
        grants: {
            available: true,
            totalAmount: grantsInfo.totalAmount,
            currency: grantsInfo.currency,
            count: grantsInfo.count,
            netCost: netCost.netCost,
            savings: netCost.savings,
            savingsPercentage: netCost.savingsPercentage,
            grants: grantsInfo.grants
        }
    };
}

/**
 * Get grants summary for multiple products
 * @param {Array} products - Array of product objects
 * @param {string} region - Region code
 * @returns {Object} Summary of grants across products
 */
function getGrantsSummary(products, region = 'uk.england') {
    const summary = {
        totalProducts: products.length,
        productsWithGrants: 0,
        totalGrantAmount: 0,
        averageGrantAmount: 0,
        maxGrantAmount: 0,
        minGrantAmount: Infinity,
        categories: {},
        currency: 'EUR'
    };
    
    products.forEach(product => {
        const grantsInfo = getProductGrantsInfo(product, region);
        
        if (grantsInfo.hasGrants) {
            summary.productsWithGrants++;
            summary.totalGrantAmount += grantsInfo.totalAmount;
            summary.maxGrantAmount = Math.max(summary.maxGrantAmount, grantsInfo.totalAmount);
            summary.minGrantAmount = Math.min(summary.minGrantAmount, grantsInfo.totalAmount);
            
            if (!summary.categories[product.category]) {
                summary.categories[product.category] = 0;
            }
            summary.categories[product.category]++;
        }
    });
    
    summary.averageGrantAmount = summary.productsWithGrants > 0 
        ? summary.totalGrantAmount / summary.productsWithGrants 
        : 0;
    
    if (summary.minGrantAmount === Infinity) {
        summary.minGrantAmount = 0;
    }
    
    return summary;
}

/**
 * Filter products by grants availability
 * @param {Array} products - Array of product objects
 * @param {string} region - Region code
 * @param {boolean} hasGrants - Filter for products with/without grants
 * @returns {Array} Filtered products
 */
function filterProductsByGrants(products, region = 'uk.england', hasGrants = true) {
    return products.filter(product => {
        const grantsInfo = getProductGrantsInfo(product, region);
        return hasGrants ? grantsInfo.hasGrants : !grantsInfo.hasGrants;
    });
}

/**
 * Sort products by grant amount
 * @param {Array} products - Array of product objects
 * @param {string} region - Region code
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted products
 */
function sortProductsByGrants(products, region = 'uk.england', order = 'desc') {
    return products.sort((a, b) => {
        const grantsA = getProductGrantsInfo(a, region);
        const grantsB = getProductGrantsInfo(b, region);
        
        if (order === 'desc') {
            return grantsB.totalAmount - grantsA.totalAmount;
        } else {
            return grantsA.totalAmount - grantsB.totalAmount;
        }
    });
}

// ============================================================================
// CALCULATOR INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: Product Comparison Calculator Integration
 */
function integrateGrantsWithProductComparison() {
    console.log('🔄 Integrating grants with Product Comparison Calculator...');
    
    // Example product data
    const sampleProduct = {
        id: 'bosch_dishwasher_001',
        name: 'Bosch Professional Dishwasher',
        category: 'Appliances',
        subcategory: 'Dishwasher',
        price: 800,
        energyRating: 'A+',
        efficiency: 95
    };
    
    // Get grants information
    const grantsInfo = getProductGrantsInfo(sampleProduct, 'uk.england');
    console.log('Grants Info:', grantsInfo);
    
    // Calculate net cost
    const netCost = calculateNetCostWithGrants(sampleProduct.price, sampleProduct, 'uk.england');
    console.log('Net Cost Calculation:', netCost);
    
    // Display grants in UI
    displayProductGrants(sampleProduct, 'uk.england', 'grants-container');
    
    return {
        product: sampleProduct,
        grantsInfo: grantsInfo,
        netCost: netCost
    };
}

/**
 * Example: Audit Calculator Integration
 */
function integrateGrantsWithAuditCalculator() {
    console.log('🔄 Integrating grants with Audit Calculator...');
    
    // Example audit result
    const auditResult = {
        totalCost: 5000,
        recommendations: [
            { product: 'Heat Pump', cost: 3000, category: 'Heating', subcategory: 'Heat Pumps' },
            { product: 'Solar Panels', cost: 2000, category: 'Renewable', subcategory: 'Solar Panels' }
        ]
    };
    
    // Update each recommendation with grants
    const updatedRecommendations = auditResult.recommendations.map(rec => {
        const product = {
            category: rec.category,
            subcategory: rec.subcategory,
            name: rec.product
        };
        
        const netCost = calculateNetCostWithGrants(rec.cost, product, 'uk.england');
        
        return {
            ...rec,
            grants: getProductGrantsInfo(product, 'uk.england'),
            netCost: netCost.netCost,
            savings: netCost.savings
        };
    });
    
    // Calculate total savings
    const totalSavings = updatedRecommendations.reduce((sum, rec) => sum + rec.savings, 0);
    const totalNetCost = auditResult.totalCost - totalSavings;
    
    return {
        ...auditResult,
        recommendations: updatedRecommendations,
        totalSavings: totalSavings,
        totalNetCost: totalNetCost,
        grantsSummary: getGrantsSummary(updatedRecommendations, 'uk.england')
    };
}

// ============================================================================
// EXPORT FOR USE IN CALCULATORS
// ============================================================================

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getProductGrantsInfo,
        calculateNetCostWithGrants,
        displayProductGrants,
        updateCalculationWithGrants,
        getGrantsSummary,
        filterProductsByGrants,
        sortProductsByGrants,
        integrateGrantsWithProductComparison,
        integrateGrantsWithAuditCalculator
    };
}

// Export for browser/ES6 modules
if (typeof window !== 'undefined') {
    window.getProductGrantsInfo = getProductGrantsInfo;
    window.calculateNetCostWithGrants = calculateNetCostWithGrants;
    window.displayProductGrants = displayProductGrants;
    window.updateCalculationWithGrants = updateCalculationWithGrants;
    window.getGrantsSummary = getGrantsSummary;
    window.filterProductsByGrants = filterProductsByGrants;
    window.sortProductsByGrants = sortProductsByGrants;
    window.integrateGrantsWithProductComparison = integrateGrantsWithProductComparison;
    window.integrateGrantsWithAuditCalculator = integrateGrantsWithAuditCalculator;
}

// ============================================================================
// SYSTEM INFORMATION
// ============================================================================

console.log('🏛️ Calculator Grants Integration Loaded Successfully');
console.log('🔗 Available Functions:', Object.keys({
    getProductGrantsInfo,
    calculateNetCostWithGrants,
    displayProductGrants,
    updateCalculationWithGrants,
    getGrantsSummary,
    filterProductsByGrants,
    sortProductsByGrants,
    integrateGrantsWithProductComparison,
    integrateGrantsWithAuditCalculator
}));

console.log('\n📋 Integration Examples:');
console.log('   Product Comparison: integrateGrantsWithProductComparison()');
console.log('   Audit Calculator: integrateGrantsWithAuditCalculator()');
console.log('   Custom Integration: getProductGrantsInfo(product, region)');
