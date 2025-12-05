const http = require('http');

console.log('🔍 CHECKING IMAGE STATUS FOR PROFESSIONAL FOODSERVICE PRODUCTS\n');

const url = 'http://localhost:4000/api/products';

http.get(url, (res) => {
    let data = '';
    
    res.on('data', chunk => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const foodserviceProducts = json.products.filter(p => p.category === 'professional-foodservice');
            
            console.log(`📊 Total professional foodservice products: ${foodserviceProducts.length}`);
            
            // Check image status
            const productsWithImages = foodserviceProducts.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
            const productsWithoutImages = foodserviceProducts.filter(p => !p.imageUrl || p.imageUrl.trim() === '');
            
            console.log(`📸 Products with images: ${productsWithImages.length}`);
            console.log(`❌ Products without images: ${productsWithoutImages.length}`);
            
            // Show first 10 products and their image status
            console.log('\n📋 First 10 products image status:');
            foodserviceProducts.slice(0, 10).forEach((product, index) => {
                const hasImage = product.imageUrl && product.imageUrl.trim() !== '';
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Brand: ${product.brand}`);
                console.log(`   Image URL: ${product.imageUrl || 'NO IMAGE'}`);
                console.log(`   Status: ${hasImage ? '✅ HAS IMAGE' : '❌ NO IMAGE'}`);
                console.log('');
            });
            
            // Check for common image issues
            console.log('🔍 Analyzing image URLs...');
            const imageIssues = {
                placeholder: 0,
                localhost: 0,
                external: 0,
                empty: 0
            };
            
            foodserviceProducts.forEach(product => {
                if (!product.imageUrl || product.imageUrl.trim() === '') {
                    imageIssues.empty++;
                } else if (product.imageUrl.includes('via.placeholder.com')) {
                    imageIssues.placeholder++;
                } else if (product.imageUrl.includes('localhost')) {
                    imageIssues.localhost++;
                } else {
                    imageIssues.external++;
                }
            });
            
            console.log('\n📊 Image URL Analysis:');
            console.log(`   Empty URLs: ${imageIssues.empty}`);
            console.log(`   Placeholder URLs: ${imageIssues.placeholder}`);
            console.log(`   Localhost URLs: ${imageIssues.localhost}`);
            console.log(`   External URLs: ${imageIssues.external}`);
            
        } catch (error) {
            console.log('❌ Error parsing API response:', error.message);
        }
    });
    
}).on('error', (error) => {
    console.log('❌ Request error:', error.message);
});



















