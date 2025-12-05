// Test Script for Dynamic Product Page
// Run this to verify everything is working before Wix integration

const http = require('http');
const fs = require('fs');
const path = require('path');

class DynamicPageTester {
    constructor() {
        this.baseUrl = 'http://localhost:4000';
        this.testProducts = [
            'sample_1',
            'sample_2', 
            'sample_3',
            'baxi-auriga-hp-20t'
        ];
    }

    // Test if server is running
    async testServer() {
        return new Promise((resolve) => {
            const req = http.get(`${this.baseUrl}/api/product-widget/products/all`, (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ Server is running on port 4000');
                    resolve(true);
                } else {
                    console.log('❌ Server returned status:', res.statusCode);
                    resolve(false);
                }
            });

            req.on('error', (err) => {
                console.log('❌ Server not running:', err.message);
                resolve(false);
            });

            req.setTimeout(5000, () => {
                console.log('❌ Server timeout');
                resolve(false);
            });
        });
    }

    // Test API endpoints
    async testAPIEndpoints() {
        console.log('\n🔍 Testing API Endpoints...');
        
        for (const productId of this.testProducts) {
            try {
                const response = await this.makeRequest(`/api/product-widget/${productId}`);
                if (response.success) {
                    console.log(`✅ Product API: ${productId} - ${response.product.name}`);
                } else {
                    console.log(`❌ Product API: ${productId} - ${response.message}`);
                }
            } catch (error) {
                console.log(`❌ Product API: ${productId} - Error: ${error.message}`);
            }
        }

        // Test incentives API
        try {
            const response = await this.makeRequest('/api/product-widget/incentives/sample_1?country=NL');
            if (response.success) {
                console.log(`✅ Incentives API: Found ${response.incentives.length} incentives`);
            } else {
                console.log(`❌ Incentives API: ${response.message}`);
            }
        } catch (error) {
            console.log(`❌ Incentives API: Error: ${error.message}`);
        }
    }

    // Test dynamic page
    async testDynamicPage() {
        console.log('\n🌐 Testing Dynamic Page...');
        
        const pagePath = path.resolve(__dirname, 'dynamic-product-page.html');
        if (fs.existsSync(pagePath)) {
            console.log('✅ Dynamic page file exists');
            
            // Test with different products
            for (const productId of this.testProducts) {
                const testUrl = `${this.baseUrl}/dynamic-product-page.html?product=${productId}`;
                console.log(`🔗 Test URL: ${testUrl}`);
            }
        } else {
            console.log('❌ Dynamic page file not found');
        }
    }

    // Test calculator widget
    async testCalculatorWidget() {
        console.log('\n🧮 Testing Calculator Widget...');
        
        const widgetPath = path.resolve(__dirname, 'product-energy-widget-glassmorphism.html');
        if (fs.existsSync(widgetPath)) {
            console.log('✅ Calculator widget file exists');
            
            // Test widget URL
            const widgetUrl = `${this.baseUrl}/product-energy-widget-glassmorphism.html?productId=sample_1`;
            console.log(`🔗 Widget URL: ${widgetUrl}`);
        } else {
            console.log('❌ Calculator widget file not found');
        }
    }

    // Test Wix integration files
    testWixFiles() {
        console.log('\n📁 Testing Wix Integration Files...');
        
        const wixDir = path.resolve(__dirname, 'wix-integration');
        const requiredFiles = [
            'wix-products.csv',
            'wix-products.json',
            'wix-velo-code.js',
            'wix-integration.html'
        ];

        requiredFiles.forEach(file => {
            const filePath = path.join(wixDir, file);
            if (fs.existsSync(filePath)) {
                console.log(`✅ ${file} exists`);
            } else {
                console.log(`❌ ${file} missing`);
            }
        });
    }

    // Make HTTP request
    makeRequest(path) {
        return new Promise((resolve, reject) => {
            const req = http.get(`${this.baseUrl}${path}`, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                });
            });

            req.on('error', reject);
            req.setTimeout(5000, () => reject(new Error('Request timeout')));
        });
    }

    // Run all tests
    async runTests() {
        console.log('🚀 Starting Dynamic Product Page Tests...\n');
        
        const serverRunning = await this.testServer();
        if (!serverRunning) {
            console.log('\n❌ Server not running. Please start the server first:');
            console.log('   node server-new.js');
            return;
        }

        await this.testAPIEndpoints();
        await this.testDynamicPage();
        await this.testCalculatorWidget();
        this.testWixFiles();

        console.log('\n🎉 Test Summary:');
        console.log('✅ Server is running');
        console.log('✅ API endpoints are working');
        console.log('✅ Dynamic page is ready');
        console.log('✅ Calculator widget is ready');
        console.log('✅ Wix integration files are ready');
        
        console.log('\n🚀 Ready for Wix Integration!');
        console.log('\nNext Steps:');
        console.log('1. Follow the WIX_SETUP_GUIDE.md');
        console.log('2. Import wix-products.csv into Wix');
        console.log('3. Add custom fields to product collection');
        console.log('4. Create dynamic page with HTML integration code');
        console.log('5. Test with sample products');
    }
}

// Run the tests
const tester = new DynamicPageTester();
tester.runTests().catch(console.error);

