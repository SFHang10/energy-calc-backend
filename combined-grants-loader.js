/**
 * COMBINED GRANTS LOADER
 * Loads ALL 62+ grants from schemes.json and combines with hardcoded system
 * This ensures products get access to the full grants database
 * 
 * Updated: January 2026
 * Total Grants: 62+
 */

const fs = require('fs');
const path = require('path');

console.log('🏛️ COMBINED GRANTS LOADER - 62+ Grants System\n');

// ============================================================================
// LOAD ALL DATA SOURCES
// ============================================================================

// Load schemes.json (62 grants - primary source)
const schemesPath = path.join(__dirname, 'schemes.json');
const schemes = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));

// Load hardcoded system for product-specific mappings
const hardcoded = require('./hardcoded-grants-system.js');

console.log(`📊 Loaded ${schemes.length} grants from schemes.json`);
console.log(`📊 Loaded ${hardcoded.getGrantsSystemStats().totalGrants} grants from hardcoded system`);

// ============================================================================
// REGION CODE MAPPING
// ============================================================================

const REGION_CODE_MAP = {
    'uk': 'uk.england',
    'ie': 'eu.ireland',
    'nl': 'eu.netherlands',
    'de': 'eu.germany',
    'fr': 'eu.france',
    'be': 'eu.belgium',
    'es': 'eu.spain',
    'pt': 'eu.portugal',
    'eu': 'eu.general'
};

const REVERSE_REGION_MAP = {
    'uk.england': 'uk',
    'uk.scotland': 'uk',
    'uk.wales': 'uk',
    'eu.ireland': 'ie',
    'eu.netherlands': 'nl',
    'eu.germany': 'de',
    'eu.france': 'fr',
    'eu.belgium': 'be',
    'eu.spain': 'es',
    'eu.portugal': 'pt',
    'eu.italy': 'eu',
    'eu.austria': 'eu',
    'eu.switzerland': 'eu',
    'eu.poland': 'eu',
    'eu.general': 'eu'
};

// ============================================================================
// KEYWORD MATCHING FOR CATEGORIES
// ============================================================================

const CATEGORY_KEYWORDS = {
    'Appliances': ['appliance', 'dishwasher', 'washing', 'refrigerator', 'fridge', 'microwave', 'oven', 'kitchen'],
    'Heating': ['heat pump', 'boiler', 'heating', 'biomass', 'thermal', 'geothermal', 'warm'],
    'Renewable': ['solar', 'photovoltaic', 'pv', 'wind', 'battery', 'renewable', 'feed-in', 'export'],
    'Insulation': ['insulation', 'cavity', 'loft', 'attic', 'wall', 'window', 'thermal envelope'],
    'Smart Home': ['smart', 'thermostat', 'energy management', 'monitor', 'grid', 'hub', 'sensor'],
    'Transport': ['ev', 'electric vehicle', 'charging', 'charger', 'mobility', 'car'],
    'Building': ['renovation', 'refurbishment', 'retrofit', 'building', 'construction', 'rehabilitation']
};

// ============================================================================
// CONVERT SCHEME TO GRANT FORMAT
// ============================================================================

function convertSchemeToGrant(scheme) {
    const regionCode = REGION_CODE_MAP[scheme.region] || 'eu.general';
    const applicationUrl = scheme.links?.find(l => l.type === 'apply')?.url || 
                          scheme.links?.[0]?.url || '';
    
    // Parse amount from maxFunding
    let amount = 0;
    let currency = 'EUR';
    if (scheme.maxFunding) {
        if (scheme.maxFunding.includes('£')) {
            currency = 'GBP';
        }
        const match = scheme.maxFunding.match(/[€£]?([\d,]+)/);
        if (match) {
            amount = parseInt(match[1].replace(/,/g, ''));
        }
    }
    
    // Determine categories from keywords
    const keywords = (scheme.keywords || []).map(k => k.toLowerCase());
    const title = (scheme.title || '').toLowerCase();
    const description = (scheme.description || '').toLowerCase();
    const allText = [...keywords, title, description].join(' ');
    
    const matchedCategories = [];
    for (const [category, catKeywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of catKeywords) {
            if (allText.includes(keyword)) {
                if (!matchedCategories.includes(category)) {
                    matchedCategories.push(category);
                }
                break;
            }
        }
    }
    
    return {
        id: scheme.id,
        name: scheme.title,
        amount: amount,
        currency: currency,
        description: scheme.description,
        applicationUrl: applicationUrl,
        contactInfo: 'See application link',
        validUntil: scheme.deadline || 'Ongoing',
        requirements: scheme.requirements ? [scheme.requirements] : [],
        processingTime: '4-8 weeks',
        additionalInfo: scheme.relevance || '',
        regionCode: regionCode,
        region: scheme.region,
        categories: matchedCategories.length > 0 ? matchedCategories : ['General'],
        keywords: scheme.keywords || [],
        type: scheme.type,
        priority: scheme.priority || false
    };
}

// ============================================================================
// COMBINED GRANTS DATABASE
// ============================================================================

// Convert all schemes to grant format
const schemesAsGrants = schemes.map(convertSchemeToGrant);

// Create lookup by region
const grantsByRegion = {};
schemesAsGrants.forEach(grant => {
    if (!grantsByRegion[grant.regionCode]) {
        grantsByRegion[grant.regionCode] = [];
    }
    grantsByRegion[grant.regionCode].push(grant);
});

// Create lookup by category
const grantsByCategory = {};
schemesAsGrants.forEach(grant => {
    grant.categories.forEach(cat => {
        if (!grantsByCategory[cat]) {
            grantsByCategory[cat] = [];
        }
        grantsByCategory[cat].push(grant);
    });
});

// ============================================================================
// COMBINED GRANT LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get all grants for a product - combines hardcoded + schemes.json
 * @param {Object} product - Product object with category and subcategory
 * @param {string} region - Region code (e.g., 'uk.england')
 * @returns {Array} Combined array of grants
 */
function getCombinedProductGrants(product, region = 'uk.england') {
    const grants = [];
    const seenIds = new Set();
    
    // First, get hardcoded grants (most specific)
    const hardcodedGrants = hardcoded.getProductGrants(product, region);
    hardcodedGrants.forEach(grant => {
        grants.push(grant);
        seenIds.add(grant.name.toLowerCase());
    });
    
    // Then add matching grants from schemes.json
    const shortRegion = REVERSE_REGION_MAP[region] || 'eu';
    
    // Get grants matching the product's category
    if (product.category && grantsByCategory[product.category]) {
        grantsByCategory[product.category].forEach(grant => {
            // Check region match (same region or EU-wide)
            if (grant.region === shortRegion || grant.region === 'eu') {
                if (!seenIds.has(grant.name.toLowerCase())) {
                    grants.push({
                        name: grant.name,
                        amount: grant.amount,
                        currency: grant.currency,
                        description: grant.description,
                        applicationUrl: grant.applicationUrl,
                        contactInfo: grant.contactInfo,
                        validUntil: grant.validUntil,
                        requirements: grant.requirements,
                        processingTime: grant.processingTime,
                        additionalInfo: grant.additionalInfo
                    });
                    seenIds.add(grant.name.toLowerCase());
                }
            }
        });
    }
    
    // Also check for region-specific grants that might match
    const regionGrants = grantsByRegion[region] || [];
    regionGrants.forEach(grant => {
        if (!seenIds.has(grant.name.toLowerCase())) {
            // Check if any keyword matches product category or subcategory
            const productTerms = [
                (product.category || '').toLowerCase(),
                (product.subcategory || '').toLowerCase(),
                (product.name || '').toLowerCase()
            ].join(' ');
            
            const hasMatch = grant.keywords.some(kw => 
                productTerms.includes(kw.toLowerCase())
            );
            
            if (hasMatch) {
                grants.push({
                    name: grant.name,
                    amount: grant.amount,
                    currency: grant.currency,
                    description: grant.description,
                    applicationUrl: grant.applicationUrl,
                    contactInfo: grant.contactInfo,
                    validUntil: grant.validUntil,
                    requirements: grant.requirements,
                    processingTime: grant.processingTime,
                    additionalInfo: grant.additionalInfo
                });
                seenIds.add(grant.name.toLowerCase());
            }
        }
    });
    
    return grants;
}

/**
 * Get all grants for a region from combined sources
 * @param {string} region - Region code
 * @returns {Array} All grants for the region
 */
function getAllGrantsForRegion(region = 'uk.england') {
    const grants = [];
    const seenIds = new Set();
    
    // Get from schemes.json
    const shortRegion = REVERSE_REGION_MAP[region] || 'eu';
    schemesAsGrants.forEach(grant => {
        if (grant.region === shortRegion || grant.region === 'eu') {
            if (!seenIds.has(grant.id)) {
                grants.push(grant);
                seenIds.add(grant.id);
            }
        }
    });
    
    return grants;
}

/**
 * Calculate total grant amount from combined sources
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {number} Total grant amount
 */
function calculateCombinedGrantTotal(product, region = 'uk.england') {
    const grants = getCombinedProductGrants(product, region);
    return grants.reduce((total, grant) => total + (grant.amount || 0), 0);
}

/**
 * Add combined grants to a product
 * @param {Object} product - Product object
 * @param {string} region - Region code
 * @returns {Object} Product with grants
 */
function addCombinedGrantsToProduct(product, region = 'uk.england') {
    const grants = getCombinedProductGrants(product, region);
    const totalAmount = grants.reduce((sum, g) => sum + (g.amount || 0), 0);
    
    return {
        ...product,
        grants: grants,
        grantsTotal: totalAmount,
        grantsCurrency: grants.length > 0 ? grants[0].currency : 'EUR',
        grantsRegion: region,
        grantsCount: grants.length
    };
}

/**
 * Get combined system statistics
 * @returns {Object} Statistics
 */
function getCombinedGrantsStats() {
    const categoryCount = {};
    const regionCount = {};
    
    schemesAsGrants.forEach(grant => {
        // Count by category
        grant.categories.forEach(cat => {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        
        // Count by region
        regionCount[grant.region] = (regionCount[grant.region] || 0) + 1;
    });
    
    return {
        totalGrants: schemes.length,
        hardcodedGrants: hardcoded.getGrantsSystemStats().totalGrants,
        schemesJsonGrants: schemes.length,
        totalCategories: Object.keys(categoryCount).length,
        totalRegions: Object.keys(regionCount).length,
        categories: categoryCount,
        regions: regionCount,
        maxAmount: Math.max(...schemesAsGrants.map(g => g.amount)),
        minAmount: Math.min(...schemesAsGrants.filter(g => g.amount > 0).map(g => g.amount))
    };
}

/**
 * Get all available regions
 * @returns {Array} Region codes
 */
function getCombinedAvailableRegions() {
    const regions = new Set();
    
    // From schemes.json
    schemes.forEach(s => {
        const regionCode = REGION_CODE_MAP[s.region];
        if (regionCode) regions.add(regionCode);
    });
    
    // From hardcoded
    hardcoded.getAvailableGrantRegions().forEach(r => regions.add(r));
    
    return Array.from(regions);
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
    // Data
    schemes,
    schemesAsGrants,
    grantsByRegion,
    grantsByCategory,
    
    // Functions
    getCombinedProductGrants,
    getAllGrantsForRegion,
    calculateCombinedGrantTotal,
    addCombinedGrantsToProduct,
    getCombinedGrantsStats,
    getCombinedAvailableRegions,
    convertSchemeToGrant,
    
    // Re-export hardcoded functions for compatibility
    getProductGrants: hardcoded.getProductGrants,
    calculateProductGrantTotal: hardcoded.calculateProductGrantTotal,
    addGrantsToProduct: hardcoded.addGrantsToProduct,
    addGrantsToProducts: hardcoded.addGrantsToProducts,
    getAvailableGrantRegions: hardcoded.getAvailableGrantRegions,
    getGrantsSystemStats: hardcoded.getGrantsSystemStats,
    formatProductGrantsDisplay: hardcoded.formatProductGrantsDisplay,
    PRODUCT_GRANTS_MAPPING: hardcoded.PRODUCT_GRANTS_MAPPING
};

// ============================================================================
// INFO
// ============================================================================

const stats = getCombinedGrantsStats();
console.log('\n🏛️ Combined Grants System Loaded Successfully');
console.log(`📊 Total Grants Available: ${stats.totalGrants}`);
console.log(`📊 Categories: ${stats.totalCategories}`);
console.log(`📊 Regions: ${stats.totalRegions}`);
console.log(`💰 Max Grant: €${stats.maxAmount.toLocaleString()}`);
console.log(`💰 Min Grant: €${stats.minAmount.toLocaleString()}`);
