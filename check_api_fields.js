const https = require('https');
const http = require('http');

// Check API response fields
const url = 'http://localhost:4000/api/products/category/professional-foodservice';

http.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            const firstProduct = response.products[0];
            
            console.log('🔍 API Response Fields:');
            console.log('Product name:', firstProduct.name);
            console.log('Has imageUrl:', 'imageUrl' in firstProduct);
            console.log('Has image_url:', 'image_url' in firstProduct);
            console.log('imageUrl value:', firstProduct.imageUrl);
            console.log('image_url value:', firstProduct.image_url);
            
            console.log('\n📋 All fields containing "image":');
            Object.keys(firstProduct).forEach(key => {
                if (key.toLowerCase().includes('image')) {
                    console.log(`- ${key}: ${firstProduct[key]}`);
                }
            });
            
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    });
}).on('error', (error) => {
    console.error('Error:', error);
});



















