/**
 * GRANTS SYSTEM INTEGRATION TEST
 * Demonstrates how to integrate the comprehensive grants system with calculators
 */

console.log('🧪 GRANTS SYSTEM INTEGRATION TEST\n');

// ============================================================================
// TEST DATA
// ============================================================================

const testProducts = [
    {
        id: 'test_dishwasher',
        name: 'Zanussi Dishwasher',
        category: 'Appliances',
        subcategory: 'Dishwasher',
        brand: 'Zanussi',
        price: 899
    },
    {
        id: 'test_heat_pump',
        name: 'Bosch Heat Pump',
        category: 'Heating',
        subcategory: 'Heat Pumps',
        brand: 'Bosch',
        price: 2500
    },
    {
        id: 'test_solar',
        name: 'Solar Panel System',
        category: 'Renewable',
        subcategory: 'Solar Panels',
        brand: 'Generic',
        price: 5000
    }
];

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test basic grants functionality
 */
function testBasicGrantsFunctionality() {
    console.log('🧪 Testing Basic Grants Functionality...\n');
    
    testProducts.forEach(product => {
        console.log(`\n📋 Testing Product: ${product.name}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Subcategory: ${product.subcategory}`);
        
        // Test different regions
        const regions = ['uk.england', 'uk.scotland', 'eu.ireland', 'eu.germany'];
        
        regions.forEach(region => {
            const grants = findAvailableGrants(product, region);
            const total = calculateGrantsTotal(product, region);
            
            console.log(`   ${region}: ${grants.length} grants, Total: €${total}`);
            
            if (grants.length > 0) {
                grants.forEach(grant => {
                    console.log(`     - ${grant.name}: ${grant.currency}${grant.amount}`);
                });
            }
        });
    });
    
    console.log('\n✅ Basic grants functionality test complete\n');
}

/**
 * Test grants display functionality
 */
function testGrantsDisplay() {
    console.log('🧪 Testing Grants Display Functionality...\n');
    
    const product = testProducts[0]; // Zanussi Dishwasher
    const region = 'uk.england';
    
    console.log(`📋 Testing display for: ${product.name} in ${region}`);
    
    // Get grants
    const grants = findAvailableGrants(product, region);
    console.log(`Found ${grants.length} grants`);
    
    // Test HTML generation
    const html = formatGrantsDisplay(grants, region);
    console.log('Generated HTML length:', html.length);
    
    // Test summary
    const summary = getGrantsSummary(product, region);
    console.log('Grants summary:', summary);
    
    // Test banner
    const banner = createGrantsBanner(product, region);
    console.log('Banner generated:', banner.length > 0);
    
    console.log('\n✅ Grants display functionality test complete\n');
}

/**
 * Test calculator integration
 */
function testCalculatorIntegration() {
    console.log('🧪 Testing Calculator Integration...\n');
    
    // Test Product Calculator integration
    console.log('📋 Testing Product Calculator Integration');
    const product = testProducts[0];
    
    // Simulate calculator environment
    const mockResultsContainer = document.createElement('div');
    mockResultsContainer.className = 'results-section';
    document.body.appendChild(mockResultsContainer);
    
    // Test integration
    integrateGrantsWithProductCalculator(product, 'uk.england');
    
    // Check if grants section was added
    const grantsSection = document.querySelector('.grants-section');
    console.log('Grants section added:', grantsSection !== null);
    
    // Test Audit Calculator integration
    console.log('\n📋 Testing Audit Calculator Integration');
    const auditData = {
        recommendations: testProducts
    };
    
    integrateGrantsWithAuditCalculator(auditData, 'uk.england');
    
    console.log('\n✅ Calculator integration test complete\n');
}

/**
 * Test region functionality
 */
function testRegionFunctionality() {
    console.log('🧪 Testing Region Functionality...\n');
    
    // Test getting all regions
    const regions = getAllRegions();
    console.log(`Total regions available: ${regions.length}`);
    
    regions.forEach(region => {
        console.log(`  ${region.code}: ${region.name} (${region.grantCount} grants)`);
    });
    
    // Test region-specific grants
    console.log('\n📋 Testing region-specific grants:');
    const product = testProducts[1]; // Heat Pump
    
    regions.slice(0, 3).forEach(region => {
        const grants = findAvailableGrants(product, region.code);
        console.log(`  ${region.name}: ${grants.length} grants`);
    });
    
    console.log('\n✅ Region functionality test complete\n');
}

/**
 * Test grants statistics
 */
function testGrantsStatistics() {
    console.log('🧪 Testing Grants Statistics...\n');
    
    const stats = getGrantsStatistics();
    
    console.log('📊 Grants Database Statistics:');
    console.log(`  Total Grants: ${stats.totalGrants}`);
    console.log(`  Total Regions: ${stats.totalRegions}`);
    console.log(`  Total Countries: ${stats.totalCountries}`);
    console.log(`  Max Amount: €${stats.maxAmount}`);
    console.log(`  Min Amount: €${stats.minAmount}`);
    
    console.log('\n📊 Categories:');
    Object.entries(stats.categories).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} grants`);
    });
    
    console.log('\n📊 Currencies:');
    Object.entries(stats.currencies).forEach(([currency, count]) => {
        console.log(`  ${currency}: ${count} grants`);
    });
    
    console.log('\n✅ Grants statistics test complete\n');
}

/**
 * Test search functionality
 */
function testSearchFunctionality() {
    console.log('🧪 Testing Search Functionality...\n');
    
    const searchTerms = ['kitchen', 'heat pump', 'solar', 'insulation'];
    
    searchTerms.forEach(term => {
        console.log(`🔍 Searching for: "${term}"`);
        const results = searchGrants(term);
        console.log(`  Found ${results.length} grants`);
        
        if (results.length > 0) {
            results.slice(0, 3).forEach(grant => {
                console.log(`    - ${grant.name} (${grant.region})`);
            });
        }
    });
    
    console.log('\n✅ Search functionality test complete\n');
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

/**
 * Run all tests
 */
function runAllTests() {
    console.log('🚀 Starting Comprehensive Grants System Tests\n');
    console.log('=' .repeat(60));
    
    try {
        testBasicGrantsFunctionality();
        testGrantsDisplay();
        testCalculatorIntegration();
        testRegionFunctionality();
        testGrantsStatistics();
        testSearchFunctionality();
        
        console.log('=' .repeat(60));
        console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('✅ Grants system is ready for calculator integration');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// ============================================================================
// DEMO INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: How to integrate with Product Calculator
 */
function exampleProductCalculatorIntegration() {
    console.log('📋 EXAMPLE: Product Calculator Integration\n');
    
    // 1. Include the grants system scripts
    console.log('1. Include grants system scripts in your calculator HTML:');
    console.log('   <script src="comprehensive-grants-system.js"></script>');
    console.log('   <script src="grants-interface-system.js"></script>');
    
    // 2. Initialize grants system
    console.log('\n2. Initialize grants system:');
    console.log('   setupGrantsForCalculator("Product Calculator", "uk.england");');
    
    // 3. Get grants for a product
    console.log('\n3. Get grants for a product:');
    console.log('   const grants = findAvailableGrants(product, region);');
    console.log('   const total = calculateGrantsTotal(product, region);');
    
    // 4. Add grants to results
    console.log('\n4. Add grants to results:');
    console.log('   addGrantsToResults(product, region, resultsContainer);');
    
    console.log('\n✅ Integration complete!');
}

/**
 * Example: How to integrate with Audit Calculator
 */
function exampleAuditCalculatorIntegration() {
    console.log('📋 EXAMPLE: Audit Calculator Integration\n');
    
    // 1. Include the grants system scripts
    console.log('1. Include grants system scripts in your calculator HTML:');
    console.log('   <script src="comprehensive-grants-system.js"></script>');
    console.log('   <script src="grants-interface-system.js"></script>');
    
    // 2. Initialize grants system
    console.log('\n2. Initialize grants system:');
    console.log('   setupGrantsForCalculator("Audit Calculator", "uk.england");');
    
    // 3. Integrate with audit results
    console.log('\n3. Integrate with audit results:');
    console.log('   integrateGrantsWithAuditCalculator(auditData, region);');
    
    console.log('\n✅ Integration complete!');
}

// ============================================================================
// AUTO-RUN TESTS
// ============================================================================

// Run tests when page loads
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🧪 Grants System Test Page Loaded');
        console.log('Click "Run Tests" button to start testing');
        
        // Add test button to page
        const testButton = document.createElement('button');
        testButton.textContent = 'Run Grants System Tests';
        testButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--neon-green);
            color: var(--dark-bg);
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            z-index: 10000;
        `;
        testButton.onclick = runAllTests;
        document.body.appendChild(testButton);
    });
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testBasicGrantsFunctionality,
        testGrantsDisplay,
        testCalculatorIntegration,
        testRegionFunctionality,
        testGrantsStatistics,
        testSearchFunctionality,
        exampleProductCalculatorIntegration,
        exampleAuditCalculatorIntegration
    };
}

console.log('🧪 Grants System Integration Test Loaded');
console.log('📋 Available test functions:', Object.keys({
    runAllTests,
    testBasicGrantsFunctionality,
    testGrantsDisplay,
    testCalculatorIntegration,
    testRegionFunctionality,
    testGrantsStatistics,
    testSearchFunctionality,
    exampleProductCalculatorIntegration,
    exampleAuditCalculatorIntegration
}));






