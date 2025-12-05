// Test Fixed ETL API Connection
const axios = require('axios');

const ETL_API_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';
const ETL_API_KEY = 'de6a4b7c-771e-4f22-9721-11f39763d794';

async function testETLConnection() {
    console.log('🔌 Testing Fixed ETL API Connection...');
    console.log('🌐 API URL:', ETL_API_URL);
    console.log('🔑 API Key:', ETL_API_KEY ? 'Present' : 'Missing');
    
    try {
        // Test 1: Get products
        console.log('\n📦 Testing Products Endpoint...');
        const productsResponse = await axios.get(`${ETL_API_URL}/products?size=5&listingStatus=current`, {
            headers: {
                'x-api-key': ETL_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (productsResponse.status === 200) {
            const productsData = productsResponse.data;
            console.log('✅ Products API Success!');
            console.log(`   - Status: ${productsResponse.status}`);
            console.log(`   - Products in response: ${productsData.products ? productsData.products.length : 'No products array'}`);
            if (productsData.products && productsData.products.length > 0) {
                console.log(`   - First product: ${productsData.products[0]?.name || 'N/A'}`);
                console.log(`   - First product features:`, productsData.products[0]?.features ? 'Present' : 'None');
            }
        } else {
            console.log('❌ Products API Failed:', productsResponse.status, productsResponse.statusText);
        }

    } catch (error) {
        console.error('❌ Connection Error:', error.message);
        if (error.response) {
            console.error('   - Status:', error.response.status);
            console.error('   - Data:', error.response.data);
        }
    }
}

// Run the test
testETLConnection();
