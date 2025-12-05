const fs = require('fs');

console.log('🚀 Creating 3,000-product comprehensive chunk...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    // Create 3,000-product comprehensive chunk (first 3,000 products from all categories)
    console.log('📊 Creating 3,000-product comprehensive chunk...');
    const comprehensive3000 = data.products.slice(0, 3000);
    
    const comprehensive3000Chunk = {
        metadata: {
            chunkType: 'Comprehensive Mixed',
            totalProducts: comprehensive3000.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: [...new Set(comprehensive3000.map(p => p.category))],
            subcategories: [...new Set(comprehensive3000.map(p => p.subcategory))],
            brands: [...new Set(comprehensive3000.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - Mixed Categories',
            totalAvailable: 5554,
            chunkSize: '3,000 products (comprehensive)',
            performance: 'Optimized for speed',
            coverage: '54% of full database'
        },
        products: comprehensive3000
    };
    
    fs.writeFileSync('comprehensive-chunk-3000.json', JSON.stringify(comprehensive3000Chunk, null, 2));
    console.log(`✅ Created comprehensive 3000 chunk: ${comprehensive3000Chunk.metadata.totalProducts} products`);
    
    // Also create a 4,000-product chunk for the next level
    console.log('\n🔄 Creating 4,000-product comprehensive chunk...');
    const comprehensive4000 = data.products.slice(0, 4000);
    
    const comprehensive4000Chunk = {
        metadata: {
            chunkType: 'Comprehensive Mixed',
            totalProducts: comprehensive4000.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: [...new Set(comprehensive4000.map(p => p.category))],
            subcategories: [...new Set(comprehensive4000.map(p => p.subcategory))],
            brands: [...new Set(comprehensive4000.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - Mixed Categories',
            totalAvailable: 5554,
            chunkSize: '4,000 products (comprehensive)',
            performance: 'Optimized for speed',
            coverage: '72% of full database'
        },
        products: comprehensive4000
    };
    
    fs.writeFileSync('comprehensive-chunk-4000.json', JSON.stringify(comprehensive4000Chunk, null, 2));
    console.log(`✅ Created comprehensive 4000 chunk: ${comprehensive4000Chunk.metadata.totalProducts} products`);
    
    // Check file sizes
    const size3000 = fs.statSync('comprehensive-chunk-3000.json').size;
    const size4000 = fs.statSync('comprehensive-chunk-4000.json').size;
    
    console.log('\n📊 File sizes:');
    console.log(`  3,000-product chunk: ${(size3000 / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  4,000-product chunk: ${(size4000 / 1024 / 1024).toFixed(2)} MB`);
    
    // Calculate coverage percentages
    const coverage3000 = ((3000 / 5554) * 100).toFixed(1);
    const coverage4000 = ((4000 / 5554) * 100).toFixed(1);
    
    console.log('\n📈 Database coverage:');
    console.log(`  3,000 products: ${coverage3000}% coverage`);
    console.log(`  4,000 products: ${coverage4000}% coverage`);
    
    console.log('\n🎯 Large chunks ready!');
    console.log('📁 Files created:');
    console.log('  - comprehensive-chunk-3000.json (3,000 products, 54% coverage)');
    console.log('  - comprehensive-chunk-4000.json (4,000 products, 72% coverage)');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





