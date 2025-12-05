const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Product Grants vs Portal Grants\n');

// Read the product data
const productData = JSON.parse(fs.readFileSync('products-with-grants-and-collection.json', 'utf8'));

// Extract all unique grants from products
const productGrants = new Set();
const grantsMap = new Map();

productData.products.forEach(product => {
    if (product.grants && product.grants.length > 0) {
        product.grants.forEach(grant => {
            const key = `${grant.name}-${grant.applicationUrl}`;
            if (!grantsMap.has(key)) {
                grantsMap.set(key, grant);
                productGrants.add(grant.name);
            }
        });
    }
});

console.log(`📦 Total unique grants on product pages: ${grantsMap.size}\n`);

// List all grants used in products
console.log('📍 Grants used on product pages:');
grantsMap.forEach((grant, key) => {
    console.log(`  • ${grant.name}`);
    console.log(`    Amount: ${grant.currency}${grant.amount}`);
    console.log(`    Region: ${productData.products.find(p => p.grants && p.grants.some(g => g.name === grant.name))?.grantsRegion || 'N/A'}`);
    console.log('');
});

// Now let's check what's in the comprehensive-grants-system
const grantsSystem = fs.readFileSync('comprehensive-grants-system.js', 'utf8');

const portalGrantNames = [];
let match = grantsSystem.match(/name:\s*['"](.*?)['"]/g);
if (match) {
    match.forEach(m => {
        const name = m.match(/['"](.*?)['"]/)[1];
        if (!portalGrantNames.includes(name)) {
            portalGrantNames.push(name);
        }
    });
}

console.log(`\n🏛️ Grants in portal: ${portalGrantNames.length}\n`);

// Compare
const inProducts = [];
const inPortal = [];
const missing = [];

grantsMap.forEach((grant, key) => {
    if (portalGrantNames.includes(grant.name)) {
        inProducts.push(grant.name);
        inPortal.push(grant.name);
    } else {
        missing.push({
            name: grant.name,
            amount: grant.amount,
            currency: grant.currency,
            url: grant.applicationUrl
        });
    }
});

console.log('✅ Grants in BOTH product pages AND portal:');
inProducts.forEach(name => console.log(`  • ${name}`));
console.log('');

console.log('❌ Grants on product pages but NOT in portal:');
missing.forEach(grant => {
    console.log(`  • ${grant.name} - ${grant.currency}${grant.amount}`);
});

console.log(`\n📊 Summary:`);
console.log(`   Product-specific grants: ${grantsMap.size}`);
console.log(`   Also in portal: ${inProducts.length}`);
console.log(`   Missing from portal: ${missing.length}`);




const path = require('path');

console.log('🔍 Checking Product Grants vs Portal Grants\n');

// Read the product data
const productData = JSON.parse(fs.readFileSync('products-with-grants-and-collection.json', 'utf8'));

// Extract all unique grants from products
const productGrants = new Set();
const grantsMap = new Map();

productData.products.forEach(product => {
    if (product.grants && product.grants.length > 0) {
        product.grants.forEach(grant => {
            const key = `${grant.name}-${grant.applicationUrl}`;
            if (!grantsMap.has(key)) {
                grantsMap.set(key, grant);
                productGrants.add(grant.name);
            }
        });
    }
});

console.log(`📦 Total unique grants on product pages: ${grantsMap.size}\n`);

// List all grants used in products
console.log('📍 Grants used on product pages:');
grantsMap.forEach((grant, key) => {
    console.log(`  • ${grant.name}`);
    console.log(`    Amount: ${grant.currency}${grant.amount}`);
    console.log(`    Region: ${productData.products.find(p => p.grants && p.grants.some(g => g.name === grant.name))?.grantsRegion || 'N/A'}`);
    console.log('');
});

// Now let's check what's in the comprehensive-grants-system
const grantsSystem = fs.readFileSync('comprehensive-grants-system.js', 'utf8');

const portalGrantNames = [];
let match = grantsSystem.match(/name:\s*['"](.*?)['"]/g);
if (match) {
    match.forEach(m => {
        const name = m.match(/['"](.*?)['"]/)[1];
        if (!portalGrantNames.includes(name)) {
            portalGrantNames.push(name);
        }
    });
}

console.log(`\n🏛️ Grants in portal: ${portalGrantNames.length}\n`);

// Compare
const inProducts = [];
const inPortal = [];
const missing = [];

grantsMap.forEach((grant, key) => {
    if (portalGrantNames.includes(grant.name)) {
        inProducts.push(grant.name);
        inPortal.push(grant.name);
    } else {
        missing.push({
            name: grant.name,
            amount: grant.amount,
            currency: grant.currency,
            url: grant.applicationUrl
        });
    }
});

console.log('✅ Grants in BOTH product pages AND portal:');
inProducts.forEach(name => console.log(`  • ${name}`));
console.log('');

console.log('❌ Grants on product pages but NOT in portal:');
missing.forEach(grant => {
    console.log(`  • ${grant.name} - ${grant.currency}${grant.amount}`);
});

console.log(`\n📊 Summary:`);
console.log(`   Product-specific grants: ${grantsMap.size}`);
console.log(`   Also in portal: ${inProducts.length}`);
console.log(`   Missing from portal: ${missing.length}`);






















