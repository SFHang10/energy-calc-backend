/**
 * GRANTS INTERFACE SYSTEM
 * Simple interface for calculators to integrate with the comprehensive grants system
 * 
 * This provides easy-to-use functions that calculators can call to get grants information
 * without needing to understand the complex grants database structure.
 */

console.log('🔗 GRANTS INTERFACE SYSTEM - Calculator Integration\n');

// ============================================================================
// SIMPLE CALCULATOR INTERFACE FUNCTIONS
// ============================================================================

/**
 * Simple function to get grants for a product - main interface for calculators
 * @param {Object} product - Product object with category and subcategory
 * @param {string} region - Region code (optional, defaults to 'uk.england')
 * @returns {Object} Grants information for the product
 */
function findAvailableGrants(product, region = 'uk.england') {
    console.log(`🔍 Finding grants for product: ${product.name} in region: ${region}`);
    
    if (!product || !product.category) {
        console.log('❌ Invalid product object provided');
        return [];
    }
    
    // Use the comprehensive grants system
    const grantsData = getGrantsForCalculator(product, region);
    
    console.log(`✅ Found ${grantsData.count} grants totaling ${grantsData.currency}${grantsData.totalAmount}`);
    
    return grantsData.grants;
}

/**
 * Calculate total grant amount for a product - simple interface
 * @param {Object} product - Product object
 * @param {string} region - Region code (optional)
 * @returns {number} Total grant amount
 */
function calculateGrantsTotal(product, region = 'uk.england') {
    if (!product || !product.category) {
        return 0;
    }
    
    return calculateTotalGrantAmount(product.category, product.subcategory, region);
}

/**
 * Get grants display HTML - simple interface for calculators
 * @param {Array} grants - Array of grants
 * @param {string} region - Region code
 * @returns {string} HTML formatted grants display
 */
function formatGrantsDisplay(grants, region) {
    return formatGrantsDisplay(grants, region);
}

/**
 * Initialize grants system for a calculator - simple setup
 * @param {string} calculatorName - Name of the calculator
 * @param {string} defaultRegion - Default region (optional)
 */
function setupGrantsForCalculator(calculatorName, defaultRegion = 'uk.england') {
    console.log(`🏛️ Setting up grants system for ${calculatorName}`);
    
    // Initialize the grants system
    initializeGrantsSystem(calculatorName, defaultRegion);
    
    // Add region selector if not exists
    addRegionSelector();
    
    console.log(`✅ Grants system ready for ${calculatorName}`);
}

/**
 * Add region selector dropdown to the page
 */
function addRegionSelector() {
    // Check if region selector already exists
    if (document.getElementById('region-select')) {
        return;
    }
    
    const regions = getAllRegions();
    
    // Create region selector
    const selectorHtml = `
        <div class="region-selector" style="margin: 10px 0;">
            <label for="region-select" style="color: var(--gray); font-size: 0.9em;">Region:</label>
            <select id="region-select" onchange="updateGrantsRegion()" style="
                background: rgba(30, 41, 59, 0.6);
                color: var(--white);
                border: 1px solid rgba(34, 197, 94, 0.3);
                border-radius: 6px;
                padding: 8px 12px;
                margin-left: 10px;
                font-size: 0.9em;
            ">
                ${regions.map(region => 
                    `<option value="${region.code}">${region.name}</option>`
                ).join('')}
            </select>
        </div>
    `;
    
    // Find a good place to insert the selector
    const grantsSection = document.querySelector('.grants-section');
    if (grantsSection) {
        grantsSection.insertAdjacentHTML('afterbegin', selectorHtml);
    } else {
        // Insert at the top of the page
        document.body.insertAdjacentHTML('afterbegin', selectorHtml);
    }
}

/**
 * Update grants when region changes
 */
function updateGrantsRegion() {
    const regionSelect = document.getElementById('region-select');
    if (regionSelect) {
        window.currentGrantsRegion = regionSelect.value;
        console.log(`🌍 Region updated to: ${window.currentGrantsRegion}`);
        
        // Trigger grants update if there's a current product
        if (window.currentProduct) {
            updateGrantsDisplay(window.currentProduct, window.currentGrantsRegion);
        }
    }
}

/**
 * Get grants summary for display in calculator results
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {Object} Summary of grants information
 */
function getGrantsSummary(product, region = 'uk.england') {
    const grantsData = getGrantsForCalculator(product, region);
    
    return {
        totalAmount: grantsData.totalAmount,
        currency: grantsData.currency,
        count: grantsData.count,
        hasGrants: grantsData.count > 0,
        grants: grantsData.grants.map(grant => ({
            name: grant.name,
            amount: grant.amount,
            currency: grant.currency,
            description: grant.description,
            applicationUrl: grant.applicationUrl
        }))
    };
}

/**
 * Create grants banner for calculator results
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {string} HTML for grants banner
 */
function createGrantsBanner(product, region = 'uk.england') {
    const summary = getGrantsSummary(product, region);
    
    if (!summary.hasGrants) {
        return '';
    }
    
    return `
        <div class="grants-banner" style="
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            text-align: center;
        ">
            <h4 style="color: var(--neon-green); margin: 0 0 10px 0;">
                <i class="fas fa-gift"></i> Available Grants: ${summary.currency}${summary.totalAmount.toLocaleString()}
            </h4>
            <p style="color: var(--gray); margin: 0; font-size: 0.9em;">
                ${summary.count} grant${summary.count !== 1 ? 's' : ''} available for this product
            </p>
        </div>
    `;
}

/**
 * Add grants to calculator results section
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @param {HTMLElement} resultsContainer - Container to add grants to
 */
function addGrantsToResults(product, region = 'uk.england', resultsContainer = null) {
    const container = resultsContainer || document.querySelector('.results-section') || document.body;
    
    // Create grants section
    const grantsSection = document.createElement('div');
    grantsSection.className = 'grants-section';
    
    // Get grants data
    const grantsData = getGrantsForCalculator(product, region);
    
    // Create grants HTML
    const grantsHtml = formatGrantsDisplay(grantsData.grants, region);
    
    grantsSection.innerHTML = `
        <h3><i class="fas fa-gift"></i> Available Government Grants & Incentives</h3>
        <div class="grants-content">
            <div class="grants-for-current">
                <h4>Grants for Current Product (${product.name})</h4>
                ${grantsHtml}
            </div>
        </div>
    `;
    
    // Add to container
    container.appendChild(grantsSection);
    
    // Add CSS if not already added
    if (!document.querySelector('#grants-css')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'grants-css';
        styleSheet.textContent = getGrantsCSS();
        document.head.appendChild(styleSheet);
    }
    
    console.log(`✅ Added grants section with ${grantsData.count} grants`);
}

// ============================================================================
// CALCULATOR-SPECIFIC INTEGRATION FUNCTIONS
// ============================================================================

/**
 * Integration function for Product Calculator
 * @param {Object} product - Product object
 * @param {string} region - Region code
 */
function integrateGrantsWithProductCalculator(product, region = 'uk.england') {
    console.log('🔄 Integrating grants with Product Calculator');
    
    // Set current product for region updates
    window.currentProduct = product;
    
    // Add grants to results
    addGrantsToResults(product, region);
    
    // Add grants banner
    const banner = createGrantsBanner(product, region);
    if (banner) {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.insertAdjacentHTML('afterbegin', banner);
        }
    }
    
    console.log('✅ Product Calculator grants integration complete');
}

/**
 * Integration function for Audit Calculator
 * @param {Object} auditData - Audit data object
 * @param {string} region - Region code
 */
function integrateGrantsWithAuditCalculator(auditData, region = 'uk.england') {
    console.log('🔄 Integrating grants with Audit Calculator');
    
    // Extract products from audit data
    const products = auditData.recommendations || auditData.products || [];
    
    if (products.length === 0) {
        console.log('No products found in audit data');
        return;
    }
    
    // Create comprehensive grants section
    const grantsSection = document.createElement('div');
    grantsSection.className = 'grants-section';
    
    let grantsHtml = `
        <h3><i class="fas fa-gift"></i> Available Government Grants & Incentives</h3>
        <div class="grants-content">
    `;
    
    // Add grants for each recommended product
    products.forEach(product => {
        const grantsData = getGrantsForCalculator(product, region);
        if (grantsData.count > 0) {
            grantsHtml += `
                <div class="grants-for-product">
                    <h4>Grants for ${product.name}</h4>
                    ${formatGrantsDisplay(grantsData.grants, region)}
                </div>
            `;
        }
    });
    
    grantsHtml += `</div>`;
    grantsSection.innerHTML = grantsHtml;
    
    // Add to audit results
    const auditResults = document.querySelector('.audit-results') || document.querySelector('.results-section') || document.body;
    auditResults.appendChild(grantsSection);
    
    // Add CSS
    if (!document.querySelector('#grants-css')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'grants-css';
        styleSheet.textContent = getGrantsCSS();
        document.head.appendChild(styleSheet);
    }
    
    console.log('✅ Audit Calculator grants integration complete');
}

// ============================================================================
// EXPORT FOR USE IN OTHER FILES
// ============================================================================

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        findAvailableGrants,
        calculateGrantsTotal,
        formatGrantsDisplay,
        setupGrantsForCalculator,
        addRegionSelector,
        updateGrantsRegion,
        getGrantsSummary,
        createGrantsBanner,
        addGrantsToResults,
        integrateGrantsWithProductCalculator,
        integrateGrantsWithAuditCalculator
    };
}

// Export for browser/ES6 modules
if (typeof window !== 'undefined') {
    window.findAvailableGrants = findAvailableGrants;
    window.calculateGrantsTotal = calculateGrantsTotal;
    window.formatGrantsDisplay = formatGrantsDisplay;
    window.setupGrantsForCalculator = setupGrantsForCalculator;
    window.addRegionSelector = addRegionSelector;
    window.updateGrantsRegion = updateGrantsRegion;
    window.getGrantsSummary = getGrantsSummary;
    window.createGrantsBanner = createGrantsBanner;
    window.addGrantsToResults = addGrantsToResults;
    window.integrateGrantsWithProductCalculator = integrateGrantsWithProductCalculator;
    window.integrateGrantsWithAuditCalculator = integrateGrantsWithAuditCalculator;
}

// ============================================================================
// SYSTEM INFORMATION
// ============================================================================

console.log('🔗 Grants Interface System Loaded Successfully');
console.log('📋 Available Interface Functions:', Object.keys({
    findAvailableGrants,
    calculateGrantsTotal,
    formatGrantsDisplay,
    setupGrantsForCalculator,
    addRegionSelector,
    updateGrantsRegion,
    getGrantsSummary,
    createGrantsBanner,
    addGrantsToResults,
    integrateGrantsWithProductCalculator,
    integrateGrantsWithAuditCalculator
}));
console.log('🎯 Ready for calculator integration!');






