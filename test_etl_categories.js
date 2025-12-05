const axios = require('axios');

const ETL_API_KEY = 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

async function testETLCategories() {
    try {
        console.log('🔍 Testing ETL API categories...');
        
        // Get technologies
        const techResponse = await axios.get(`${ETL_BASE_URL}/technologies`, {
            headers: {
                'x-api-key': ETL_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Available Technologies:');
        console.log(JSON.stringify(techResponse.data, null, 2));
        
        // Test products with different technology filters
        const desiredCategories = [
            'Hand dryers',
            'Heat Pumps', 
            'Heating and Ventilation',
            'Lighting',
            'Professional Food service Equipment',
            'Refrigerator Equipment',
            'Showers'
        ];
        
        console.log('\n🔍 Testing product searches for desired categories...');
        
        for (const category of desiredCategories) {
            try {
                const productResponse = await axios.get(`${ETL_BASE_URL}/products`, {
                    headers: {
                        'x-api-key': ETL_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        size: 5,
                        listingStatus: 'current',
                        search: category
                    }
                });
                
                console.log(`\n📦 ${category}:`);
                console.log(`   Found ${productResponse.data.products.length} products`);
                if (productResponse.data.products.length > 0) {
                    console.log(`   Sample: ${productResponse.data.products[0].name}`);
                    console.log(`   Technology ID: ${productResponse.data.products[0].technologyId}`);
                }
            } catch (error) {
                console.log(`❌ Error searching for ${category}:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ ETL API Error:', error.response?.data || error.message);
    }
}

testETLCategories();








