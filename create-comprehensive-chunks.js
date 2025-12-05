const fs = require('fs');

console.log('🚀 Creating comprehensive chunking strategy...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    // 1. Create 1,000-product ETL Technology chunk
    console.log('\n📊 Creating 1,000-product ETL Technology chunk...');
    const etl1000 = data.products.filter(p => p.category === 'ETL Technology').slice(0, 1000);
    
    const etl1000Chunk = {
        metadata: {
            chunkType: 'ETL Technology',
            totalProducts: etl1000.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: ['ETL Technology'],
            subcategories: [...new Set(etl1000.map(p => p.subcategory))],
            brands: [...new Set(etl1000.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - Category Based',
            totalAvailable: 5469,
            chunkSize: '1,000 products (expanded chunk)'
        },
        products: etl1000
    };
    
    fs.writeFileSync('etl-technology-chunk-1000.json', JSON.stringify(etl1000Chunk, null, 2));
    console.log(`✅ Created ETL 1000 chunk: ${etl1000Chunk.metadata.totalProducts} products`);
    
    // 2. Create comprehensive mixed chunk (1,000 products from all categories)
    console.log('\n🔄 Creating comprehensive mixed chunk (1,000 products)...');
    const mixed1000 = data.products.slice(0, 1000);
    
    const mixed1000Chunk = {
        metadata: {
            chunkType: 'Comprehensive Mixed',
            totalProducts: mixed1000.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: [...new Set(mixed1000.map(p => p.category))],
            subcategories: [...new Set(mixed1000.map(p => p.subcategory))],
            brands: [...new Set(mixed1000.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - Mixed Categories',
            totalAvailable: 5554,
            chunkSize: '1,000 products (comprehensive)'
        },
        products: mixed1000
    };
    
    fs.writeFileSync('comprehensive-chunk-1000.json', JSON.stringify(mixed1000Chunk, null, 2));
    console.log(`✅ Created comprehensive chunk: ${mixed1000Chunk.metadata.totalProducts} products`);
    
    // 3. Create category-specific chunks
    console.log('\n🏷️ Creating category-specific chunks...');
    
    const categories = {};
    data.products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    Object.entries(categories).forEach(([category, count]) => {
        if (count > 0) {
            const categoryProducts = data.products.filter(p => p.category === category);
            const chunk = {
                metadata: {
                    chunkType: category,
                    totalProducts: categoryProducts.length,
                    extractionDate: new Date().toISOString(),
                    sourceDatabase: 'energy_calculator.db',
                    categories: [category],
                    subcategories: [...new Set(categoryProducts.map(p => p.subcategory))],
                    brands: [...new Set(categoryProducts.map(p => p.brand))],
                    chunkStrategy: 'Smart Chunking - Category Specific',
                    totalAvailable: count,
                    chunkSize: `${count} products (full category)`
                },
                products: categoryProducts
            };
            
            const filename = `${category.toLowerCase().replace(/\s+/g, '-')}-chunk.json`;
            fs.writeFileSync(filename, JSON.stringify(chunk, null, 2));
            console.log(`✅ Created ${category} chunk: ${count} products`);
        }
    });
    
    console.log('\n🎯 Chunking strategy complete!');
    console.log('📁 Files created:');
    console.log('  - etl-technology-chunk-1000.json (1,000 ETL products)');
    console.log('  - comprehensive-chunk-1000.json (1,000 mixed products)');
    console.log('  - appliances-chunk.json (50 appliances)');
    console.log('  - restaurant-equipment-chunk.json (13 restaurant products)');
    console.log('  - office-equipment-chunk.json (12 office products)');
    console.log('  - smart-home-chunk.json (9 smart home products)');
    console.log('  - lighting-chunk.json (1 lighting product)');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





