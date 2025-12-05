const axios = require('axios');

console.log('🔍 Testing ETL API for Products with Images...\n');

// ETL API Configuration
const ETL_API_KEY = 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

async function testETLImages() {
    try {
        console.log('📡 Fetching technologies and testing for images...');
        
        // Get all technologies
        const techResponse = await axios.get(`${ETL_BASE_URL}/technologies`, {
            headers: {
                'x-api-key': ETL_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        const technologies = techResponse.data.technologies || [];
        console.log(`✅ Found ${technologies.length} technologies`);
        
        // Test a few different technologies to find ones with images
        const testTechnologies = technologies.slice(0, 5); // Test first 5 technologies
        
        for (const tech of testTechnologies) {
            console.log(`\n🔍 Testing technology: ${tech.name} (ID: ${tech.id})`);
            
            try {
                const productResponse = await axios.get(`${ETL_BASE_URL}/products`, {
                    headers: {
                        'x-api-key': ETL_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        size: 3, // Get 3 products to check
                        offset: 0,
                        listingStatus: 'current',
                        technologyId: tech.id
                    }
                });
                
                const products = productResponse.data.products || [];
                
                if (products.length > 0) {
                    console.log(`   📦 Found ${products.length} products`);
                    
                    // Check each product for images
                    products.forEach((product, index) => {
                        const hasImages = product.images && product.images.length > 0;
                        console.log(`   ${index + 1}. ${product.name}: ${hasImages ? '✅ HAS IMAGES' : '❌ No images'}`);
                        
                        if (hasImages) {
                            console.log(`      🖼️  Images: ${product.images.length} found`);
                            product.images.forEach((img, imgIndex) => {
                                console.log(`         ${imgIndex + 1}. ${img.url || img.src || 'Unknown URL'}`);
                            });
                        }
                    });
                } else {
                    console.log('   ❌ No products found');
                }
                
            } catch (error) {
                console.log(`   ❌ Error fetching products: ${error.message}`);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testETLImages();






