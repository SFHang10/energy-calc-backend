const https = require('https');
const http = require('http');

// Check what the API is actually returning
const url = 'http://localhost:4000/api/products/category/professional-foodservice';

http.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            const products = response.products;
            
            console.log(`🔍 API returned ${products.length} products\n`);
            
            let emptyImages = 0;
            let placeholderImages = 0;
            let realImages = 0;
            
            products.forEach((product, index) => {
                const imageUrl = product.imageUrl || product.image_url;
                
                if (!imageUrl || imageUrl === '' || imageUrl === null) {
                    console.log(`${index + 1}. ❌ EMPTY: ${product.name} (${product.brand})`);
                    emptyImages++;
                } else if (imageUrl.includes('placeholder') || imageUrl.includes('data:image/svg')) {
                    console.log(`${index + 1}. 🖼️ PLACEHOLDER: ${product.name} (${product.brand})`);
                    placeholderImages++;
                } else {
                    console.log(`${index + 1}. ✅ REAL: ${product.name} (${product.brand}) - ${imageUrl}`);
                    realImages++;
                }
            });
            
            console.log(`\n📊 Summary:`);
            console.log(`- Empty images: ${emptyImages}`);
            console.log(`- Placeholder images: ${placeholderImages}`);
            console.log(`- Real images: ${realImages}`);
            console.log(`- Total products: ${products.length}`);
            
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    });
}).on('error', (error) => {
    console.error('Error:', error);
});



















