const axios = require('axios');

console.log('🔍 Testing calculator-wix API directly...\n');

async function testAPI() {
    try {
        const response = await axios.get('http://localhost:4000/api/calculator-wix/products?limit=3');
        console.log('✅ API Response:');
        console.log('Status:', response.status);
        console.log('Data length:', response.data.length);
        console.log('First product:', response.data[0]);
        
        // Check if it's the old hardcoded data
        if (response.data[0] && response.data[0].id === '1') {
            console.log('⚠️ WARNING: Still getting old hardcoded data!');
        } else {
            console.log('✅ Getting new database data!');
        }
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAPI();



