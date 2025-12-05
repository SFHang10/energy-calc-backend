const axios = require('axios');

// Configuration
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4'; // Greenways Market
const WIX_API_URL = 'https://www.wixapis.com/stores/v1/products';

// Manual products to preserve (based on our analysis)
const MANUAL_PRODUCTS_TO_PRESERVE = [
    // Electrolux Professional Skyline ovens
    'bc62ff93-83b8-2469-d208-77c9325bebc2',
    '2c5c3ff2-1967-2ccc-5ba3-90fb80f4e734',
    '20a8d177-745e-2918-282e-9a3adc1633a9',
    'ff5909d9-9dc0-4456-5f10-9fe4584d8488',
    '15c1a77c-7671-fcde-d520-3cd811067d6b',
    'c1be0f94-27cf-2d38-034e-a4f39dc4e0c9',
    '2cb0d83f-a992-afc6-b356-b8608196e213',
    
    // Zanussi Magistar ovens
    'f7c3e9f4-8a01-848f-c243-4cf2a4e2477b',
    '2482c097-c9c7-f9bf-5b5f-c64b4e058784',
    'cf34b75a-b632-a225-4c1e-9561d733252f',
    'ef974340-7beb-f153-d090-55aca674d282',
    'e4662b7d-8d37-0554-87fb-555312547d75',
    '051da703-3286-17eb-3e51-a990463e1253',
    '9a258ffd-ccd6-6bff-8992-5632d2d75036',
    
    // Other professional ovens
    '201bc036-9d52-8c73-c92b-34fbbf799597',
    '21db9301-4116-864f-b972-466d1f132dd9',
    '721fac43-27dc-627e-c768-d054e2d10609',
    'ce467e06-a456-29be-e6e9-7f6001ff2727',
    'b32d5a23-0d3c-bd4c-e7b2-53f215d9f857',
    'c1b1137c-f697-7387-d4a8-e91c6ed8ae92',
    'd4575362-3a45-179f-dcc4-f96ead82fe29',
    '837e9178-8f45-d55a-d945-7af8323575f0',
    'dd6bad9c-5cfe-72f9-b48e-5712c2294ca1',
    
    // Hand dryers
    'ee8ca797-5ec6-1801-5c77-d00ef9e5659c',
    '6452d653-eed1-660c-4550-3868a0bef213',
    '1b70ecfb-9ee3-2ba3-8aba-dcf33236c2cd',
    'd26183b8-ad6f-8c33-86c5-f654229f603b',
    '692468c8-a4a8-4f00-aa40-865c446e7a0a',
    'd223f9a4-3c58-1ede-15b6-64487f5c12c5',
    '6b080ee4-7a4d-0154-68e6-4bc4f141bbfb',
    
    // General products
    '5ca48d22-a711-4ce5-a7e6-b8e13aa5daec',
    'f0a3b609-7b63-4b4e-bf91-52275b4bf1ee',
    '2d0e3b5f-6509-4b7a-b92e-45dd6d2780a4',
    '0a2c35cb-a943-4f45-982a-046a1eca8f7c',
    'b61ed4c6-c3aa-4b2f-a3e0-1cff6a1ca70a',
    '77c017ac-c10c-48b9-93b1-3c4522a4c31c',
    '5b747e78-7975-4e53-bbc9-b56671ce40a3',
    'b107bd44-9815-4b6d-b566-2b2786dc21ef',
    '6d5412a0-6634-4849-bfc8-1c3a76c86aff'
];

async function getAllProducts() {
    console.log('🔍 Fetching all products from Wix store...');
    const allProducts = [];
    let offset = 0;
    const limit = 50;
    
    while (true) {
        try {
            const response = await axios.post(`${WIX_API_URL}/query`, {
                query: {
                    paging: { limit, offset }
                },
                includeVariants: false
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.WIX_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const products = response.data.products || [];
            if (products.length === 0) break;
            
            allProducts.push(...products);
            offset += limit;
            
            console.log(`📦 Fetched ${products.length} products (total: ${allProducts.length})`);
            
        } catch (error) {
            console.error('❌ Error fetching products:', error.response?.data || error.message);
            break;
        }
    }
    
    return allProducts;
}

async function deletePlaceholderProducts() {
    try {
        console.log('🚀 Starting cleanup of placeholder SKU products...\n');
        
        // Get all products
        const allProducts = await getAllProducts();
        console.log(`\n📊 Total products found: ${allProducts.length}`);
        
        // Identify placeholder products (SKU-based names)
        const placeholderProducts = allProducts.filter(product => {
            // Skip if it's a manual product we want to preserve
            if (MANUAL_PRODUCTS_TO_PRESERVE.includes(product.id)) {
                return false;
            }
            
            // Check if it's a placeholder SKU product
            return product.name && (
                product.name.startsWith('SK 530P-') ||
                product.name.includes('750000000000000') ||
                product.name.includes('ZZZZZ') ||
                (product.description && product.description.includes('Professional LED Lighting System - NORD Gear Ltd'))
            );
        });
        
        console.log(`\n🎯 Found ${placeholderProducts.length} placeholder products to delete`);
        console.log(`✅ Will preserve ${allProducts.length - placeholderProducts.length} manual products`);
        
        if (placeholderProducts.length === 0) {
            console.log('✨ No placeholder products found to delete!');
            return;
        }
        
        // Show some examples of what will be deleted
        console.log('\n📋 Examples of products to be deleted:');
        placeholderProducts.slice(0, 5).forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name}`);
        });
        
        console.log(`\n⚠️  Proceeding to delete ${placeholderProducts.length} placeholder products...`);
        
        // Delete placeholder products in batches
        let deletedCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < placeholderProducts.length; i += 10) {
            const batch = placeholderProducts.slice(i, i + 10);
            
            console.log(`\n🗑️  Deleting batch ${Math.floor(i/10) + 1} (${batch.length} products)...`);
            
            for (const product of batch) {
                try {
                    await axios.delete(`${WIX_API_URL}/${product.id}`, {
                        headers: {
                            'Authorization': `Bearer ${process.env.WIX_ACCESS_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    deletedCount++;
                    console.log(`   ✅ Deleted: ${product.name}`);
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    errorCount++;
                    console.log(`   ❌ Failed to delete ${product.name}: ${error.response?.data?.message || error.message}`);
                }
            }
        }
        
        console.log(`\n🎉 Cleanup completed!`);
        console.log(`   ✅ Successfully deleted: ${deletedCount} products`);
        console.log(`   ❌ Failed to delete: ${errorCount} products`);
        console.log(`   📊 Remaining products: ${allProducts.length - deletedCount}`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error.response?.data || error.message);
    }
}

// Run the cleanup
deletePlaceholderProducts();






