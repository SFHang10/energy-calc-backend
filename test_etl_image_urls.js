const https = require('https');
const http = require('http');

console.log('🔍 Testing ETL Image URL Accessibility...\n');

// The corrected ETL image URLs
const etlImageUrls = [
    {
        product: 'Invertek Optidrive E3 HVAC Drive (0.37kW)',
        url: 'https://img.etl.energysecurity.gov.uk/200x/e5TLK0_tduee7OrWZ'
    },
    {
        product: 'Fuji Electric Frenic HVAC Drive (75kW)',
        url: 'https://img.etl.energysecurity.gov.uk/200x/ec6fDi_tdtppiq6UE'
    },
    {
        product: 'ABB 3BP4 Process Performance Super Premium Efficiency Motor (75kW)',
        url: 'https://img.etl.energysecurity.gov.uk/200x/eNJhi_tdtoDDupLw'
    }
];

async function testImageUrl(url, productName) {
    return new Promise((resolve) => {
        console.log(`🔍 Testing: ${productName}`);
        console.log(`   URL: ${url}`);
        
        const protocol = url.startsWith('https:') ? https : http;
        
        const req = protocol.get(url, (res) => {
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Content-Type: ${res.headers['content-type']}`);
            console.log(`   Content-Length: ${res.headers['content-length'] || 'Unknown'}`);
            
            if (res.statusCode === 200) {
                console.log(`   ✅ Image is accessible`);
                
                // Check if it's actually an image
                const contentType = res.headers['content-type'];
                if (contentType && contentType.startsWith('image/')) {
                    console.log(`   ✅ Valid image format: ${contentType}`);
                } else {
                    console.log(`   ⚠️  Not a standard image format: ${contentType}`);
                }
            } else {
                console.log(`   ❌ Image not accessible (Status: ${res.statusCode})`);
            }
            
            console.log('');
            resolve({
                url,
                statusCode: res.statusCode,
                contentType: res.headers['content-type'],
                accessible: res.statusCode === 200
            });
        });
        
        req.on('error', (err) => {
            console.log(`   ❌ Error accessing image: ${err.message}`);
            console.log('');
            resolve({
                url,
                statusCode: 0,
                contentType: null,
                accessible: false,
                error: err.message
            });
        });
        
        req.setTimeout(10000, () => {
            console.log(`   ❌ Request timeout`);
            console.log('');
            req.destroy();
            resolve({
                url,
                statusCode: 0,
                contentType: null,
                accessible: false,
                error: 'Timeout'
            });
        });
    });
}

async function testAllImages() {
    console.log('🚀 Testing all ETL image URLs...\n');
    
    const results = [];
    
    for (const imageData of etlImageUrls) {
        const result = await testImageUrl(imageData.url, imageData.product);
        results.push({
            product: imageData.product,
            ...result
        });
    }
    
    console.log('📊 SUMMARY:');
    console.log('================================================================================');
    
    const accessibleImages = results.filter(r => r.accessible);
    const inaccessibleImages = results.filter(r => !r.accessible);
    
    if (accessibleImages.length > 0) {
        console.log(`✅ ${accessibleImages.length} images are accessible:`);
        accessibleImages.forEach(img => {
            console.log(`   - ${img.product}`);
            console.log(`     URL: ${img.url}`);
            console.log(`     Type: ${img.contentType}`);
        });
    }
    
    if (inaccessibleImages.length > 0) {
        console.log(`\n❌ ${inaccessibleImages.length} images are NOT accessible:`);
        inaccessibleImages.forEach(img => {
            console.log(`   - ${img.product}`);
            console.log(`     URL: ${img.url}`);
            console.log(`     Error: ${img.error || `Status ${img.statusCode}`}`);
        });
    }
    
    console.log('\n💡 SOLUTIONS FOR WIX:');
    console.log('================================================================================');
    console.log('1. If images are accessible but Wix can\'t import them:');
    console.log('   - Try downloading the images first, then uploading to Wix');
    console.log('   - Check if Wix has restrictions on external image sources');
    console.log('   - Try using a different image format (JPG, PNG)');
    console.log('');
    console.log('2. If images are not accessible:');
    console.log('   - The ETL URLs might be temporary or require authentication');
    console.log('   - Try finding the same products on manufacturer websites');
    console.log('   - Use generic product category images instead');
    console.log('');
    console.log('3. Alternative approach:');
    console.log('   - Search for these products on manufacturer websites');
    console.log('   - Use Google Images to find product photos');
    console.log('   - Contact manufacturers for high-resolution product images');
}

testAllImages();





