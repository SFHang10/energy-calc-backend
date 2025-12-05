const fs = require('fs');

console.log('🚀 Creating ETL Technology chunk (500 products)...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    // Get first 500 ETL Technology products
    const etlProducts = data.products.filter(p => p.category === 'ETL Technology').slice(0, 500);
    
    console.log(`✅ Found ${etlProducts.length} ETL Technology products`);
    
    // Create chunk metadata
    const chunk = {
        metadata: {
            chunkType: 'ETL Technology',
            totalProducts: etlProducts.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: ['ETL Technology'],
            subcategories: [...new Set(etlProducts.map(p => p.subcategory))],
            brands: [...new Set(etlProducts.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - Category Based',
            totalAvailable: 5469,
            chunkSize: '500 products (first chunk)'
        },
        products: etlProducts
    };
    
    // Write chunk file
    console.log('💾 Writing etl-technology-chunk-500.json...');
    fs.writeFileSync('etl-technology-chunk-500.json', JSON.stringify(chunk, null, 2));
    
    console.log('✅ SUCCESS: Created ETL Technology chunk!');
    console.log(`📊 Products: ${chunk.metadata.totalProducts}`);
    console.log(`🏷️ Subcategories: ${chunk.metadata.subcategories.slice(0, 5).join(', ')}...`);
    console.log(`🔧 Brands: ${chunk.metadata.brands.slice(0, 10).join(', ')}...`);
    
    // Also create a combined chunk with all categories (500 total)
    console.log('\n🔄 Creating combined chunk (500 products from all categories)...');
    const combinedProducts = data.products.slice(0, 500);
    
    const combinedChunk = {
        metadata: {
            chunkType: 'Combined All Categories',
            totalProducts: combinedProducts.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: [...new Set(combinedProducts.map(p => p.category))],
            subcategories: [...new Set(combinedProducts.map(p => p.subcategory))],
            brands: [...new Set(combinedProducts.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - Mixed Categories',
            totalAvailable: 5554,
            chunkSize: '500 products (mixed)'
        },
        products: combinedProducts
    };
    
    fs.writeFileSync('combined-chunk-500.json', JSON.stringify(combinedChunk, null, 2));
    console.log('✅ SUCCESS: Created combined chunk!');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





