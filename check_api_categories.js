const https = require('https');
const http = require('http');

console.log('🔍 Checking API category data...');

// Function to make HTTP request
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function checkCategories() {
    try {
        console.log('📡 Fetching products from API...');
        const response = await makeRequest('http://localhost:4000/api/products');
        
        if (response.products && Array.isArray(response.products)) {
            console.log(`📊 Total products: ${response.products.length}`);
            
            // Group by category
            const categoryCounts = {};
            response.products.forEach(product => {
                const category = product.category || 'Unknown';
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });
            
            console.log('\n📋 Products by category:');
            Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([category, count]) => {
                    console.log(`  ${category}: ${count} products`);
                });
            
            // Check for specific categories that might be problematic
            console.log('\n🔍 Checking for specific categories:');
            const problemCategories = ['Restaurant Equipment', 'professional-foodservice', 'Appliances', 'Lighting', 'Heating'];
            problemCategories.forEach(cat => {
                const count = categoryCounts[cat] || 0;
                console.log(`  ${cat}: ${count} products`);
            });
            
        } else {
            console.log('❌ Invalid API response structure');
            console.log('Response keys:', Object.keys(response));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkCategories();



















