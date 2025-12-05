const http = require('http');

console.log('🧪 TESTING API AFTER INTEGRATION\n');

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
            
            console.log('✅ API Results:');
            console.log(`   Total products: ${json.products.length}`);
            console.log(`   Professional foodservice products: ${foodserviceProducts.length}`);
            
            const withImages = foodserviceProducts.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
            console.log(`   Products with images: ${withImages.length}`);
            console.log(`   Products without images: ${foodserviceProducts.length - withImages.length}`);
            
            const withGrants = foodserviceProducts.filter(p => p.grantsCount > 0);
            console.log(`   Products with grants: ${withGrants.length}`);
            
            const withCollections = foodserviceProducts.filter(p => p.collectionAgenciesCount > 0);
            console.log(`   Products with collections: ${withCollections.length}`);
            
            // Show sample products
            console.log('\n📋 Sample products:');
            foodserviceProducts.slice(0, 5).forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name} (${product.brand})`);
                console.log(`      Image: ${product.imageUrl ? 'Yes' : 'No'}`);
                console.log(`      Grants: ${product.grantsCount || 0}`);
                console.log(`      Collections: ${product.collectionAgenciesCount || 0}`);
            });
            
            console.log('\n🎉 Integration test completed successfully!');
            
        } catch (error) {
            console.log('❌ Error parsing API response:', error.message);
        }
    });
    
}).on('error', (error) => {
    console.log('❌ Request error:', error.message);
});



















