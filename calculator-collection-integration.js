/**
 * CALCULATOR COLLECTION AGENCIES INTEGRATION
 * Simple integration script for calculators to use collection agencies system
 * Shows users how to get paid for their old appliances when buying new ones
 */

// Import the collection agencies system
const {
    getCollectionAgencies,
    calculateCollectionIncentiveTotal,
    formatCollectionAgenciesDisplay
} = require('./collection-agencies-system.js');

console.log('♻️ CALCULATOR COLLECTION AGENCIES INTEGRATION - Circular Economy System\n');

// ============================================================================
// COLLECTION AGENCIES INTEGRATION FUNCTIONS FOR CALCULATORS
// ============================================================================

/**
 * Get collection agencies information for a product
 * @param {Object} product - Product object
 * @param {string} region - Region code (default: 'uk.england')
 * @returns {Object} Collection agencies information
 */
function getProductCollectionInfo(product, region = 'uk.england') {
    if (!product || !product.category) {
        return {
            agencies: [],
            totalIncentive: 0,
            currency: 'GBP',
            count: 0,
            hasCollectionAgencies: false
        };
    }
    
    // Get agencies from hardcoded system
    const agencies = getCollectionAgencies(product, region);
    const totalIncentive = calculateCollectionIncentiveTotal(product, region);
    
    return {
        agencies: agencies,
        totalIncentive: totalIncentive,
        currency: agencies.length > 0 ? agencies[0].currency : 'GBP',
        count: agencies.length,
        hasCollectionAgencies: agencies.length > 0,
        region: region
    };
}

/**
 * Calculate total value when selling old product
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {Object} Collection value calculation
 */
function calculateCollectionValue(product, region = 'uk.england') {
    const collectionInfo = getProductCollectionInfo(product, region);
    
    return {
        productName: product.name,
        category: product.category,
        subcategory: product.subcategory,
        totalIncentive: collectionInfo.totalIncentive,
        currency: collectionInfo.currency,
        agenciesCount: collectionInfo.count,
        hasCollectionAgencies: collectionInfo.hasCollectionAgencies,
        agencies: collectionInfo.agencies,
        bestOffer: collectionInfo.agencies.length > 0 
            ? Math.max(...collectionInfo.agencies.map(a => a.incentiveAmount))
            : 0,
        averageOffer: collectionInfo.agencies.length > 0
            ? collectionInfo.totalIncentive / collectionInfo.agencies.length
            : 0
    };
}

/**
 * Display collection agencies information in calculator UI
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @param {string} containerId - HTML container ID
 */
function displayProductCollectionAgencies(product, region = 'uk.england', containerId = 'collection-container') {
    const collectionInfo = getProductCollectionInfo(product, region);
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
    }
    
    if (!collectionInfo.hasCollectionAgencies) {
        container.innerHTML = `
            <div class="no-collection-message">
                <h4>No Collection Agencies Available</h4>
                <p>No collection agencies currently available for this product in ${region}.</p>
                <p>Check back regularly as new collection programs are frequently introduced.</p>
            </div>
        `;
        return;
    }
    
    const agenciesHtml = formatCollectionAgenciesDisplay(collectionInfo.agencies, region);
    container.innerHTML = agenciesHtml;
}

/**
 * Update calculator results with collection agencies information
 * @param {Object} calculationResult - Calculator result object
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {Object} Updated calculation result with collection agencies
 */
function updateCalculationWithCollectionAgencies(calculationResult, product, region = 'uk.england') {
    const collectionInfo = getProductCollectionInfo(product, region);
    
    if (!collectionInfo.hasCollectionAgencies) {
        return {
            ...calculationResult,
            collectionAgencies: {
                available: false,
                message: 'No collection agencies available for this product'
            }
        };
    }
    
    const collectionValue = calculateCollectionValue(product, region);
    
    return {
        ...calculationResult,
        collectionAgencies: {
            available: true,
            totalIncentive: collectionInfo.totalIncentive,
            currency: collectionInfo.currency,
            count: collectionInfo.count,
            bestOffer: collectionValue.bestOffer,
            averageOffer: collectionValue.averageOffer,
            agencies: collectionInfo.agencies
        }
    };
}

/**
 * Get collection agencies summary for multiple products
 * @param {Array} products - Array of product objects
 * @param {string} region - Region code
 * @returns {Object} Summary of collection agencies across products
 */
function getCollectionAgenciesSummary(products, region = 'uk.england') {
    const summary = {
        totalProducts: products.length,
        productsWithCollectionAgencies: 0,
        totalIncentiveAmount: 0,
        averageIncentiveAmount: 0,
        maxIncentiveAmount: 0,
        minIncentiveAmount: Infinity,
        categories: {},
        agencyTypes: {},
        currency: 'GBP'
    };
    
    products.forEach(product => {
        const collectionInfo = getProductCollectionInfo(product, region);
        
        if (collectionInfo.hasCollectionAgencies) {
            summary.productsWithCollectionAgencies++;
            summary.totalIncentiveAmount += collectionInfo.totalIncentive;
            summary.maxIncentiveAmount = Math.max(summary.maxIncentiveAmount, collectionInfo.totalIncentive);
            summary.minIncentiveAmount = Math.min(summary.minIncentiveAmount, collectionInfo.totalIncentive);
            
            if (!summary.categories[product.category]) {
                summary.categories[product.category] = 0;
            }
            summary.categories[product.category]++;
            
            collectionInfo.agencies.forEach(agency => {
                if (!summary.agencyTypes[agency.agencyType]) {
                    summary.agencyTypes[agency.agencyType] = 0;
                }
                summary.agencyTypes[agency.agencyType]++;
            });
        }
    });
    
    summary.averageIncentiveAmount = summary.productsWithCollectionAgencies > 0 
        ? summary.totalIncentiveAmount / summary.productsWithCollectionAgencies 
        : 0;
    
    if (summary.minIncentiveAmount === Infinity) {
        summary.minIncentiveAmount = 0;
    }
    
    return summary;
}

/**
 * Filter products by collection agencies availability
 * @param {Array} products - Array of product objects
 * @param {string} region - Region code
 * @param {boolean} hasCollectionAgencies - Filter for products with/without collection agencies
 * @returns {Array} Filtered products
 */
function filterProductsByCollectionAgencies(products, region = 'uk.england', hasCollectionAgencies = true) {
    return products.filter(product => {
        const collectionInfo = getProductCollectionInfo(product, region);
        return hasCollectionAgencies ? collectionInfo.hasCollectionAgencies : !collectionInfo.hasCollectionAgencies;
    });
}

/**
 * Sort products by collection incentive amount
 * @param {Array} products - Array of product objects
 * @param {string} region - Region code
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted products
 */
function sortProductsByCollectionIncentive(products, region = 'uk.england', order = 'desc') {
    return products.sort((a, b) => {
        const collectionA = getProductCollectionInfo(a, region);
        const collectionB = getProductCollectionInfo(b, region);
        
        if (order === 'desc') {
            return collectionB.totalIncentive - collectionA.totalIncentive;
        } else {
            return collectionA.totalIncentive - collectionB.totalIncentive;
        }
    });
}

// ============================================================================
// CALCULATOR INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: Product Comparison Calculator Integration
 */
function integrateCollectionAgenciesWithProductComparison() {
    console.log('🔄 Integrating collection agencies with Product Comparison Calculator...');
    
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
    
    // Get collection agencies information
    const collectionInfo = getProductCollectionInfo(sampleProduct, 'uk.england');
    console.log('Collection Info:', collectionInfo);
    
    // Calculate collection value
    const collectionValue = calculateCollectionValue(sampleProduct, 'uk.england');
    console.log('Collection Value Calculation:', collectionValue);
    
    // Display collection agencies in UI
    displayProductCollectionAgencies(sampleProduct, 'uk.england', 'collection-container');
    
    return {
        product: sampleProduct,
        collectionInfo: collectionInfo,
        collectionValue: collectionValue
    };
}

/**
 * Example: Audit Calculator Integration
 */
function integrateCollectionAgenciesWithAuditCalculator() {
    console.log('🔄 Integrating collection agencies with Audit Calculator...');
    
    // Example audit result
    const auditResult = {
        totalCost: 5000,
        recommendations: [
            { product: 'Heat Pump', cost: 3000, category: 'Heating', subcategory: 'Heat Pumps' },
            { product: 'Solar Panels', cost: 2000, category: 'Renewable', subcategory: 'Solar Panels' }
        ]
    };
    
    // Update each recommendation with collection agencies
    const updatedRecommendations = auditResult.recommendations.map(rec => {
        const product = {
            category: rec.category,
            subcategory: rec.subcategory,
            name: rec.product
        };
        
        const collectionValue = calculateCollectionValue(product, 'uk.england');
        
        return {
            ...rec,
            collectionAgencies: getProductCollectionInfo(product, 'uk.england'),
            collectionValue: collectionValue.totalIncentive,
            bestOffer: collectionValue.bestOffer
        };
    });
    
    // Calculate total collection value
    const totalCollectionValue = updatedRecommendations.reduce((sum, rec) => sum + rec.collectionValue, 0);
    
    return {
        ...auditResult,
        recommendations: updatedRecommendations,
        totalCollectionValue: totalCollectionValue,
        collectionSummary: getCollectionAgenciesSummary(updatedRecommendations, 'uk.england')
    };
}

// ============================================================================
// EXPORT FOR USE IN CALCULATORS
// ============================================================================

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getProductCollectionInfo,
        calculateCollectionValue,
        displayProductCollectionAgencies,
        updateCalculationWithCollectionAgencies,
        getCollectionAgenciesSummary,
        filterProductsByCollectionAgencies,
        sortProductsByCollectionIncentive,
        integrateCollectionAgenciesWithProductComparison,
        integrateCollectionAgenciesWithAuditCalculator
    };
}

// Export for browser/ES6 modules
if (typeof window !== 'undefined') {
    window.getProductCollectionInfo = getProductCollectionInfo;
    window.calculateCollectionValue = calculateCollectionValue;
    window.displayProductCollectionAgencies = displayProductCollectionAgencies;
    window.updateCalculationWithCollectionAgencies = updateCalculationWithCollectionAgencies;
    window.getCollectionAgenciesSummary = getCollectionAgenciesSummary;
    window.filterProductsByCollectionAgencies = filterProductsByCollectionAgencies;
    window.sortProductsByCollectionIncentive = sortProductsByCollectionIncentive;
    window.integrateCollectionAgenciesWithProductComparison = integrateCollectionAgenciesWithProductComparison;
    window.integrateCollectionAgenciesWithAuditCalculator = integrateCollectionAgenciesWithAuditCalculator;
}

// ============================================================================
// SYSTEM INFORMATION
// ============================================================================

console.log('♻️ Calculator Collection Agencies Integration Loaded Successfully');
console.log('🔗 Available Functions:', Object.keys({
    getProductCollectionInfo,
    calculateCollectionValue,
    displayProductCollectionAgencies,
    updateCalculationWithCollectionAgencies,
    getCollectionAgenciesSummary,
    filterProductsByCollectionAgencies,
    sortProductsByCollectionIncentive,
    integrateCollectionAgenciesWithProductComparison,
    integrateCollectionAgenciesWithAuditCalculator
}));

console.log('\n📋 Integration Examples:');
console.log('   Product Comparison: integrateCollectionAgenciesWithProductComparison()');
console.log('   Audit Calculator: integrateCollectionAgenciesWithAuditCalculator()');
console.log('   Custom Integration: getProductCollectionInfo(product, region)');






