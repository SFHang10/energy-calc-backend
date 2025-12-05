require('dotenv').config();

async function testETLAPI() {
    console.log('🔍 Testing ETL API Connection...');
    console.log('API Key:', process.env.ETL_API_KEY ? '✅ Found' : '❌ Missing');
    console.log('Base URL:', process.env.ETL_BASE_URL || '❌ Missing');
    
    if (!process.env.ETL_API_KEY) {
        console.log('❌ ETL_API_KEY not found in .env file');
        return;
    }
    
    try {
        console.log('\n📡 Making request to ETL API...');
        
        // Use the correct endpoint: /api/v1/products
        const response = await fetch(`${process.env.ETL_BASE_URL}/api/v1/products`, {
            headers: {
                'x-api-key': process.env.ETL_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('   Response Status:', response.status);
        console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ ETL API Response:');
            console.log('Data structure:', Object.keys(data));
            console.log('Products count:', data.products ? data.products.length : 'No products array');
            if (data.products && data.products.length > 0) {
                console.log('First product sample:', JSON.stringify(data.products[0], null, 2));
            }
        } else {
            const errorText = await response.text();
            console.log('❌ ETL API Error Response:', errorText);
        }
        
    } catch (error) {
        console.log('❌ ETL API Request Failed:', error.message);
        console.log('Full error:', error);
    }
}

// Add fetch for Node.js if needed
if (!global.fetch) {
    global.fetch = require('node-fetch');
}

testETLAPI();