const fs = require('fs');

console.log('🚀 Creating 5,000-product comprehensive chunk...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    // Create 5,000-product comprehensive chunk (first 5,000 products from all categories)
    console.log('📊 Creating 5,000-product comprehensive chunk...');
    const comprehensive5000 = data.products.slice(0, 5000);
    
    const comprehensive5000Chunk = {
        metadata: {
            chunkType: 'Comprehensive Mixed',
            totalProducts: comprehensive5000.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: [...new Set(comprehensive5000.map(p => p.category))],
            subcategories: [...new Set(comprehensive5000.map(p => p.subcategory))],
            brands: [...new Set(comprehensive5000.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - Mixed Categories',
            totalAvailable: 5554,
            chunkSize: '5,000 products (comprehensive)',
            performance: 'Optimized for speed',
            coverage: '90% of full database'
        },
        products: comprehensive5000
    };
    
    fs.writeFileSync('comprehensive-chunk-5000.json', JSON.stringify(comprehensive5000Chunk, null, 2));
    console.log(`✅ Created comprehensive 5000 chunk: ${comprehensive5000Chunk.metadata.totalProducts} products`);
    
    // Check file size
    const size5000 = fs.statSync('comprehensive-chunk-5000.json').size;
    
    console.log('\n📊 File size:');
    console.log(`  5,000-product chunk: ${(size5000 / 1024 / 1024).toFixed(2)} MB`);
    
    // Calculate coverage percentage
    const coverage5000 = ((5000 / 5554) * 100).toFixed(1);
    
    console.log('\n📈 Database coverage:');
    console.log(`  5,000 products: ${coverage5000}% coverage`);
    
    console.log('\n🎯 5,000-product chunk ready!');
    console.log('📁 File created:');
    console.log('  - comprehensive-chunk-5000.json (5,000 products, 90% coverage)');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





