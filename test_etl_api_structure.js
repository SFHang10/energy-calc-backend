const axios = require('axios');

console.log('🔍 Testing ETL API Response Structure...\n');

// ETL API Configuration
const ETL_API_KEY = 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

async function testETLAPI() {
    try {
        console.log('📡 Fetching sample product from ETL API...');
        
        // First get technologies
        const techResponse = await axios.get(`${ETL_BASE_URL}/technologies`, {
            headers: {
                'x-api-key': ETL_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        const technologies = techResponse.data.technologies || [];
        console.log(`✅ Found ${technologies.length} technologies`);
        
        if (technologies.length > 0) {
            // Get a sample product from the first technology
            const sampleTech = technologies[0];
            console.log(`\n🔍 Testing with technology: ${sampleTech.name} (ID: ${sampleTech.id})`);
            
            const productResponse = await axios.get(`${ETL_BASE_URL}/products`, {
                headers: {
                    'x-api-key': ETL_API_KEY,
                    'Content-Type': 'application/json'
                },
                params: {
                    size: 1,
                    offset: 0,
                    listingStatus: 'current',
                    technologyId: sampleTech.id
                }
            });
            
            const products = productResponse.data.products || [];
            
            if (products.length > 0) {
                const sampleProduct = products[0];
                console.log('\n📦 Sample Product Structure:');
                console.log('='.repeat(80));
                console.log(JSON.stringify(sampleProduct, null, 2));
                console.log('='.repeat(80));
                
                // Check specifically for image fields
                console.log('\n🖼️  Checking for image fields:');
                const imageFields = Object.keys(sampleProduct).filter(key => 
                    key.toLowerCase().includes('image') || 
                    key.toLowerCase().includes('photo') || 
                    key.toLowerCase().includes('picture') ||
                    key.toLowerCase().includes('url')
                );
                
                if (imageFields.length > 0) {
                    console.log('✅ Found potential image fields:', imageFields);
                    imageFields.forEach(field => {
                        console.log(`   ${field}: ${sampleProduct[field]}`);
                    });
                } else {
                    console.log('❌ No obvious image fields found');
                }
                
            } else {
                console.log('❌ No products found for this technology');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testETLAPI();






