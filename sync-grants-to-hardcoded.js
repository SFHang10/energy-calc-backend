/**
 * SYNC GRANTS TO HARDCODED SYSTEM
 * Merges all grants from schemes.json into the hardcoded grants system
 * Ensures products get access to all 62+ grants
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 SYNCING GRANTS TO HARDCODED SYSTEM\n');

// Load schemes.json (62 grants)
const schemesPath = path.join(__dirname, 'schemes.json');
const schemes = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));

console.log(`📊 Loaded ${schemes.length} grants from schemes.json`);

// Load hardcoded grants system
const hardcodedPath = path.join(__dirname, 'hardcoded-grants-system.js');
const hardcoded = require('./hardcoded-grants-system.js');

console.log(`📊 Hardcoded system has ${hardcoded.getGrantsSystemStats().totalGrants} grants`);

// ============================================================================
// KEYWORD TO CATEGORY MAPPING
// ============================================================================

const KEYWORD_CATEGORY_MAP = {
    // Appliances
    'dishwasher': { category: 'Appliances', subcategory: 'Dishwasher' },
    'washing machine': { category: 'Appliances', subcategory: 'Washing Machine' },
    'refrigerator': { category: 'Appliances', subcategory: 'Refrigerator' },
    'fridge': { category: 'Appliances', subcategory: 'Refrigerator' },
    'microwave': { category: 'Appliances', subcategory: 'Microwave' },
    'oven': { category: 'Appliances', subcategory: 'Oven' },
    'appliance': { category: 'Appliances', subcategory: 'General' },
    
    // Heating
    'heat pump': { category: 'Heating', subcategory: 'Heat Pumps' },
    'boiler': { category: 'Heating', subcategory: 'Boilers' },
    'heating': { category: 'Heating', subcategory: 'General' },
    'biomass': { category: 'Heating', subcategory: 'Biomass Boilers' },
    'thermal': { category: 'Heating', subcategory: 'General' },
    'geothermal': { category: 'Heating', subcategory: 'Heat Pumps' },
    
    // Renewable
    'solar': { category: 'Renewable', subcategory: 'Solar Panels' },
    'photovoltaic': { category: 'Renewable', subcategory: 'Solar Panels' },
    'pv': { category: 'Renewable', subcategory: 'Solar Panels' },
    'wind': { category: 'Renewable', subcategory: 'Wind Turbines' },
    'battery': { category: 'Renewable', subcategory: 'Battery Storage' },
    'renewable': { category: 'Renewable', subcategory: 'General' },
    
    // Insulation
    'insulation': { category: 'Insulation', subcategory: 'General' },
    'cavity wall': { category: 'Insulation', subcategory: 'Cavity Wall Insulation' },
    'loft': { category: 'Insulation', subcategory: 'Loft Insulation' },
    'attic': { category: 'Insulation', subcategory: 'Loft Insulation' },
    'solid wall': { category: 'Insulation', subcategory: 'Solid Wall Insulation' },
    'external wall': { category: 'Insulation', subcategory: 'Solid Wall Insulation' },
    'window': { category: 'Insulation', subcategory: 'Windows' },
    
    // Smart Home
    'smart': { category: 'Smart Home', subcategory: 'General' },
    'thermostat': { category: 'Smart Home', subcategory: 'Thermostats' },
    'energy management': { category: 'Smart Home', subcategory: 'Energy Monitors' },
    'smart home': { category: 'Smart Home', subcategory: 'General' },
    'smart grid': { category: 'Smart Home', subcategory: 'Energy Monitors' },
    
    // EV/Transport
    'ev': { category: 'Transport', subcategory: 'Electric Vehicles' },
    'electric vehicle': { category: 'Transport', subcategory: 'Electric Vehicles' },
    'charging': { category: 'Transport', subcategory: 'EV Charging' },
    'charger': { category: 'Transport', subcategory: 'EV Charging' },
    
    // Building/Renovation
    'renovation': { category: 'Building', subcategory: 'Renovation' },
    'refurbishment': { category: 'Building', subcategory: 'Renovation' },
    'retrofit': { category: 'Building', subcategory: 'Renovation' },
    'building': { category: 'Building', subcategory: 'General' }
};

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

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function categorizeGrant(scheme) {
    const keywords = (scheme.keywords || []).map(k => k.toLowerCase());
    const title = (scheme.title || '').toLowerCase();
    const description = (scheme.description || '').toLowerCase();
    const allText = [...keywords, title, description].join(' ');
    
    // Find matching categories
    const matches = [];
    
    for (const [keyword, mapping] of Object.entries(KEYWORD_CATEGORY_MAP)) {
        if (allText.includes(keyword)) {
            matches.push(mapping);
        }
    }
    
    // Return unique matches or default to General
    if (matches.length === 0) {
        return [{ category: 'General', subcategory: 'General' }];
    }
    
    // Deduplicate
    const seen = new Set();
    return matches.filter(m => {
        const key = `${m.category}:${m.subcategory}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function convertSchemeToGrant(scheme) {
    const regionCode = REGION_CODE_MAP[scheme.region] || 'eu.general';
    const applicationUrl = scheme.links?.find(l => l.type === 'apply')?.url || 
                          scheme.links?.[0]?.url || '';
    
    // Parse amount from maxFunding
    let amount = 0;
    if (scheme.maxFunding) {
        const match = scheme.maxFunding.match(/[€£]?([\d,]+)/);
        if (match) {
            amount = parseInt(match[1].replace(/,/g, ''));
        }
    }
    
    return {
        id: scheme.id,
        name: scheme.title,
        amount: amount,
        currency: scheme.maxFunding?.includes('£') ? 'GBP' : 'EUR',
        description: scheme.description,
        applicationUrl: applicationUrl,
        contactInfo: 'See application link',
        validUntil: scheme.deadline || 'Ongoing',
        requirements: scheme.requirements ? [scheme.requirements] : [],
        processingTime: '4-8 weeks',
        additionalInfo: scheme.relevance || '',
        regionCode: regionCode,
        originalRegion: scheme.region,
        categories: categorizeGrant(scheme),
        keywords: scheme.keywords || [],
        type: scheme.type
    };
}

// ============================================================================
// GENERATE REPORT
// ============================================================================

console.log('\n📋 ANALYZING SCHEMES.JSON GRANTS:\n');

const categorizedGrants = {};
const regionCounts = {};
const typeCounts = {};

schemes.forEach(scheme => {
    const grant = convertSchemeToGrant(scheme);
    const categories = grant.categories;
    
    // Track by category
    categories.forEach(cat => {
        const key = `${cat.category} > ${cat.subcategory}`;
        if (!categorizedGrants[key]) {
            categorizedGrants[key] = [];
        }
        categorizedGrants[key].push(grant);
    });
    
    // Track by region
    const region = grant.originalRegion;
    regionCounts[region] = (regionCounts[region] || 0) + 1;
    
    // Track by type
    typeCounts[scheme.type] = (typeCounts[scheme.type] || 0) + 1;
});

console.log('📊 GRANTS BY CATEGORY:');
Object.entries(categorizedGrants)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([category, grants]) => {
        console.log(`   ${category}: ${grants.length} grants`);
    });

console.log('\n📊 GRANTS BY REGION:');
Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, count]) => {
        console.log(`   ${region}: ${count} grants`);
    });

console.log('\n📊 GRANTS BY TYPE:');
Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
        console.log(`   ${type}: ${count} grants`);
    });

// ============================================================================
// FIND MISSING GRANTS
// ============================================================================

console.log('\n🔍 IDENTIFYING MISSING GRANTS:\n');

const hardcodedGrantNames = new Set();
const hardcodedMapping = hardcoded.PRODUCT_GRANTS_MAPPING;

// Extract all grant names from hardcoded system
for (const category of Object.values(hardcodedMapping)) {
    for (const subcategory of Object.values(category)) {
        for (const regionGrants of Object.values(subcategory)) {
            for (const grant of regionGrants) {
                hardcodedGrantNames.add(grant.name.toLowerCase());
            }
        }
    }
}

const missingGrants = schemes.filter(scheme => {
    const name = scheme.title.toLowerCase();
    // Check if any similar grant exists
    for (const existing of hardcodedGrantNames) {
        if (name.includes(existing.split(' ')[0]) || existing.includes(name.split(' ')[0])) {
            return false;
        }
    }
    return true;
});

console.log(`Found ${missingGrants.length} grants in schemes.json not in hardcoded system:`);
missingGrants.forEach(scheme => {
    console.log(`   - ${scheme.title} (${scheme.region}) - ${scheme.type}`);
});

// ============================================================================
// GENERATE UPDATE SUGGESTIONS
// ============================================================================

console.log('\n📝 SUGGESTED ADDITIONS TO HARDCODED SYSTEM:\n');

const suggestions = {};

missingGrants.forEach(scheme => {
    const grant = convertSchemeToGrant(scheme);
    
    grant.categories.forEach(cat => {
        const catKey = cat.category;
        const subKey = cat.subcategory;
        const region = grant.regionCode;
        
        if (!suggestions[catKey]) suggestions[catKey] = {};
        if (!suggestions[catKey][subKey]) suggestions[catKey][subKey] = {};
        if (!suggestions[catKey][subKey][region]) suggestions[catKey][subKey][region] = [];
        
        suggestions[catKey][subKey][region].push({
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
    });
});

// Output suggestions as JSON for easy copy
const suggestionsJson = JSON.stringify(suggestions, null, 2);
fs.writeFileSync('grants-to-add.json', suggestionsJson);
console.log('💾 Saved suggestions to grants-to-add.json');

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n📊 SUMMARY:');
console.log(`   ✅ Schemes.json total: ${schemes.length} grants`);
console.log(`   ✅ Hardcoded system total: ${hardcoded.getGrantsSystemStats().totalGrants} grants`);
console.log(`   ⚠️ Missing from hardcoded: ${missingGrants.length} grants`);
console.log(`   📍 Regions in schemes.json: ${Object.keys(regionCounts).length}`);
console.log(`   📁 Categories matched: ${Object.keys(categorizedGrants).length}`);

console.log('\n✅ Analysis complete! Review grants-to-add.json for update suggestions.');
