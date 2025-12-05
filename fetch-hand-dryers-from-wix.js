const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================
// FETCH HAND DRYERS FROM WIX
// ============================================
// This script fetches hand dryers from Wix and saves them to wix-hand-dryers.json
// The enrichment script can then use this file to enrich the database
// ============================================

// Configuration
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
const WIX_API_KEY = process.env.WIX_API_KEY || '';
const OUTPUT_FILE = path.join(__dirname, 'wix-hand-dryers.json');

console.log('='.repeat(70));
console.log('📡 FETCH HAND DRYERS FROM WIX');
console.log('='.repeat(70));
console.log('');

// Check for API key
if (!WIX_API_KEY) {
    console.error('❌ ERROR: WIX_API_KEY not found in environment variables.');
    console.error('   Please set WIX_API_KEY in your .env file.');
    console.error('');
    console.error('   Example:');
    console.error('   Create a .env file in the project root with:');
    console.error('   WIX_API_KEY=your_api_key_here');
    process.exit(1);
}

// Fetch all products from Wix
async function fetchAllWixProducts() {
    console.log('📡 Fetching products from Wix...');
    console.log('');

    const allProducts = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
        try {
            console.log(`📦 Fetching products (offset: ${offset}, limit: ${limit})...`);
            
            const response = await fetch('https://www.wixapis.com/stores-reader/v1/products/query', {
                method: 'POST',
                headers: {
                    'Authorization': WIX_API_KEY,
                    'wix-site-id': WIX_SITE_ID,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: {
                        paging: { limit, offset }
                    },
                    includeVariants: false,
                    includeHiddenProducts: false
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Wix API returned ${response.status}: ${errorText}`);
                break;
            }

            const data = await response.json();
            const products = data.products || [];
            
            console.log(`   ✅ Fetched ${products.length} products`);
            allProducts.push(...products);

            // Check if there are more products
            hasMore = products.length === limit;
            offset += limit;

            // Safety limit
            if (offset > 1000) {
                console.log('   ⚠️  Reached safety limit (1000 products)');
                break;
            }
        } catch (error) {
            console.error(`❌ Error fetching products: ${error.message}`);
            break;
        }
    }

    console.log(`\n✅ Total products fetched: ${allProducts.length}`);
    return allProducts;
}

// Filter hand dryers from Wix products
function filterHandDryers(wixProducts) {
    return wixProducts.filter(p => {
        const name = (p.name || '').toLowerCase();
        return name.includes('hand dryer') || name.includes('handdryer');
    });
}

// Fetch full product details for each hand dryer
async function fetchHandDryerDetails(handDryers) {
    console.log('\n' + '='.repeat(70));
    console.log('📡 Fetching full details for hand dryers...');
    console.log('='.repeat(70));
    console.log('');

    const detailedProducts = [];

    for (let i = 0; i < handDryers.length; i++) {
        const product = handDryers[i];
        console.log(`📦 [${i + 1}/${handDryers.length}] Fetching details for: ${product.name || product.id}`);

        try {
            const response = await fetch(`https://www.wixapis.com/stores-reader/v1/products/${product.id}`, {
                headers: {
                    'Authorization': WIX_API_KEY,
                    'wix-site-id': WIX_SITE_ID,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.log(`   ⚠️  API returned ${response.status}, using basic product data`);
                detailedProducts.push(product);
                continue;
            }

            const data = await response.json();
            const fullProduct = data.product || product;
            detailedProducts.push(fullProduct);
            console.log(`   ✅ Fetched full details`);
        } catch (error) {
            console.log(`   ⚠️  Error: ${error.message}, using basic product data`);
            detailedProducts.push(product);
        }
    }

    return detailedProducts;
}

// Main function
async function main() {
    try {
        // Step 1: Fetch all products
        const allProducts = await fetchAllWixProducts();
        
        if (allProducts.length === 0) {
            console.log('\n⚠️  No products fetched from Wix.');
            console.log('   Check your WIX_API_KEY and WIX_SITE_ID.');
            return;
        }

        // Step 2: Filter for hand dryers
        console.log('\n' + '='.repeat(70));
        console.log('🔍 Filtering for hand dryers...');
        console.log('='.repeat(70));
        
        const handDryers = filterHandDryers(allProducts);
        console.log(`\n✅ Found ${handDryers.length} hand dryers in Wix`);

        if (handDryers.length === 0) {
            console.log('\n⚠️  No hand dryers found in Wix products.');
            console.log('   Make sure products have "hand dryer" or "handdryer" in the name.');
            return;
        }

        // Step 3: Fetch full details for each hand dryer
        const detailedHandDryers = await fetchHandDryerDetails(handDryers);

        // Step 4: Save to file
        console.log('\n' + '='.repeat(70));
        console.log('💾 Saving hand dryers to file...');
        console.log('='.repeat(70));
        
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(detailedHandDryers, null, 2));
        console.log(`\n✅ Saved ${detailedHandDryers.length} hand dryers to: ${path.basename(OUTPUT_FILE)}`);

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('📊 SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total products fetched: ${allProducts.length}`);
        console.log(`Hand dryers found: ${handDryers.length}`);
        console.log(`Hand dryers with full details: ${detailedHandDryers.length}`);
        console.log(`Output file: ${path.basename(OUTPUT_FILE)}`);
        console.log('\n✅ Next step: Run the enrichment script:');
        console.log(`   node enrich-hand-dryers-WITH-MCP-DATA.js --test`);
        console.log('');

    } catch (error) {
        console.error('\n❌ Error during fetch:', error);
        process.exit(1);
    }
}

// Run
main();

