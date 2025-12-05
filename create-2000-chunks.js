const fs = require('fs');

console.log('🚀 Creating 2,000-product comprehensive chunk...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    // Create 2,000-product comprehensive chunk (first 2,000 products from all categories)
    console.log('📊 Creating 2,000-product comprehensive chunk...');
    const comprehensive2000 = data.products.slice(0, 2000);
    
    const comprehensive2000Chunk = {
        metadata: {
            chunkType: 'Comprehensive Mixed',
            totalProducts: comprehensive2000.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: [...new Set(comprehensive2000.map(p => p.category))],
            subcategories: [...new Set(comprehensive2000.map(p => p.subcategory))],
            brands: [...new Set(comprehensive2000.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - Mixed Categories',
            totalAvailable: 5554,
            chunkSize: '2,000 products (comprehensive)',
            performance: 'Optimized for speed'
        },
        products: comprehensive2000
    };
    
    fs.writeFileSync('comprehensive-chunk-2000.json', JSON.stringify(comprehensive2000Chunk, null, 2));
    console.log(`✅ Created comprehensive 2000 chunk: ${comprehensive2000Chunk.metadata.totalProducts} products`);
    
    // Also create a balanced chunk (mix of categories proportionally)
    console.log('\n🔄 Creating balanced 2,000-product chunk...');
    
    const categories = {};
    data.products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    const balancedProducts = [];
    const targetPerCategory = Math.floor(2000 / Object.keys(categories).length);
    
    Object.entries(categories).forEach(([category, totalCount]) => {
        const categoryProducts = data.products.filter(p => p.category === category);
        const takeCount = Math.min(targetPerCategory, categoryProducts.length);
        balancedProducts.push(...categoryProducts.slice(0, takeCount));
    });
    
    // Fill remaining slots with ETL Technology (largest category)
    const remaining = 2000 - balancedProducts.length;
    if (remaining > 0) {
        const etlProducts = data.products.filter(p => p.category === 'ETL Technology');
        const alreadyIncluded = balancedProducts.filter(p => p.category === 'ETL Technology').length;
        const additionalETL = etlProducts.slice(alreadyIncluded, alreadyIncluded + remaining);
        balancedProducts.push(...additionalETL);
    }
    
    const balanced2000Chunk = {
        metadata: {
            chunkType: 'Balanced Mixed',
            totalProducts: balancedProducts.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: [...new Set(balancedProducts.map(p => p.category))],
            subcategories: [...new Set(balancedProducts.map(p => p.subcategory))],
            brands: [...new Set(balancedProducts.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - Balanced Categories',
            totalAvailable: 5554,
            chunkSize: '2,000 products (balanced)',
            performance: 'Optimized for category diversity'
        },
        products: balancedProducts
    };
    
    fs.writeFileSync('balanced-chunk-2000.json', JSON.stringify(balanced2000Chunk, null, 2));
    console.log(`✅ Created balanced 2000 chunk: ${balanced2000Chunk.metadata.totalProducts} products`);
    
    // Check file sizes
    const comprehensiveSize = fs.statSync('comprehensive-chunk-2000.json').size;
    const balancedSize = fs.statSync('balanced-chunk-2000.json').size;
    
    console.log('\n📊 File sizes:');
    console.log(`  Comprehensive chunk: ${(comprehensiveSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Balanced chunk: ${(balancedSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n🎯 2,000-product chunks ready!');
    console.log('📁 Files created:');
    console.log('  - comprehensive-chunk-2000.json (first 2,000 products)');
    console.log('  - balanced-chunk-2000.json (balanced across categories)');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





