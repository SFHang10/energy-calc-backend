// Using native fetch (Node.js 18+) or node-fetch
const fetch = globalThis.fetch || require('node-fetch');

console.log('🔍 Testing Wix MCP Connection...\n');

// Test Wix MCP connection
async function testWixMCP() {
    try {
        console.log('📡 Testing connection to Wix MCP...');
        
        // Test the MCP endpoint
        const response = await fetch('https://mcp.wix.com/mcp', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Energy-Calculator-Backend/1.0.0'
            }
        });
        
        if (response.ok) {
            console.log('✅ Wix MCP endpoint is accessible');
            console.log(`   Status: ${response.status}`);
            console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
        } else {
            console.log(`❌ Wix MCP endpoint returned status: ${response.status}`);
        }
        
    } catch (error) {
        console.log('❌ Error connecting to Wix MCP:', error.message);
    }
}

// Test your local Wix integration
async function testLocalWixIntegration() {
    try {
        console.log('\n🏠 Testing local Wix integration...');
        
        const response = await fetch('http://localhost:4000/api/wix/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Local Wix integration is working');
            console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
        } else {
            console.log(`❌ Local Wix integration returned status: ${response.status}`);
        }
        
    } catch (error) {
        console.log('❌ Error connecting to local Wix integration:', error.message);
        console.log('   Make sure your server is running on port 4000');
    }
}

// Test product sync capability
async function testProductSync() {
    try {
        console.log('\n📦 Testing product sync capability...');
        
        const response = await fetch('http://localhost:4000/api/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const products = await response.json();
            console.log('✅ Product API is working');
            console.log(`   Total products available: ${products.length}`);
            console.log(`   Sample product: ${products[0]?.name || 'No products found'}`);
        } else {
            console.log(`❌ Product API returned status: ${response.status}`);
        }
        
    } catch (error) {
        console.log('❌ Error connecting to product API:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    await testWixMCP();
    await testLocalWixIntegration();
    await testProductSync();
    
    console.log('\n🎯 Summary:');
    console.log('   - Wix MCP: Check if endpoint is accessible');
    console.log('   - Local Integration: Check if your server is running');
    console.log('   - Product Sync: Check if you can access your 985 products');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure your server is running: node server.js');
    console.log('   2. Test the Wix MCP in Cursor');
    console.log('   3. Set up product syncing to your Wix store');
}

runAllTests();


console.log('🔍 Testing Wix MCP Connection...\n');

// Test Wix MCP connection
async function testWixMCP() {
    try {
        console.log('📡 Testing connection to Wix MCP...');
        
        // Test the MCP endpoint
        const response = await fetch('https://mcp.wix.com/mcp', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Energy-Calculator-Backend/1.0.0'
            }
        });
        
        if (response.ok) {
            console.log('✅ Wix MCP endpoint is accessible');
            console.log(`   Status: ${response.status}`);
            console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
        } else {
            console.log(`❌ Wix MCP endpoint returned status: ${response.status}`);
        }
        
    } catch (error) {
        console.log('❌ Error connecting to Wix MCP:', error.message);
    }
}

// Test your local Wix integration
async function testLocalWixIntegration() {
    try {
        console.log('\n🏠 Testing local Wix integration...');
        
        const response = await fetch('http://localhost:4000/api/wix/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Local Wix integration is working');
            console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
        } else {
            console.log(`❌ Local Wix integration returned status: ${response.status}`);
        }
        
    } catch (error) {
        console.log('❌ Error connecting to local Wix integration:', error.message);
        console.log('   Make sure your server is running on port 4000');
    }
}

// Test product sync capability
async function testProductSync() {
    try {
        console.log('\n📦 Testing product sync capability...');
        
        const response = await fetch('http://localhost:4000/api/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const products = await response.json();
            console.log('✅ Product API is working');
            console.log(`   Total products available: ${products.length}`);
            console.log(`   Sample product: ${products[0]?.name || 'No products found'}`);
        } else {
            console.log(`❌ Product API returned status: ${response.status}`);
        }
        
    } catch (error) {
        console.log('❌ Error connecting to product API:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    await testWixMCP();
    await testLocalWixIntegration();
    await testProductSync();
    
    console.log('\n🎯 Summary:');
    console.log('   - Wix MCP: Check if endpoint is accessible');
    console.log('   - Local Integration: Check if your server is running');
    console.log('   - Product Sync: Check if you can access your 985 products');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure your server is running: node server.js');
    console.log('   2. Test the Wix MCP in Cursor');
    console.log('   3. Set up product syncing to your Wix store');
}

runAllTests();
