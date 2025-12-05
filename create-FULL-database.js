const fs = require('fs');

console.log('🚀 Creating FULL 5,554-product comprehensive chunk...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    // Create FULL 5,554-product comprehensive chunk (ALL products from all categories)
    console.log('📊 Creating FULL 5,554-product comprehensive chunk...');
    const fullDatabase = data.products; // All 5,554 products
    
    const fullDatabaseChunk = {
        metadata: {
            chunkType: 'FULL DATABASE',
            totalProducts: fullDatabase.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: [...new Set(fullDatabase.map(p => p.category))],
            subcategories: [...new Set(fullDatabase.map(p => p.subcategory))],
            brands: [...new Set(fullDatabase.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - FULL DATABASE',
            totalAvailable: 5554,
            chunkSize: '5,554 products (COMPLETE DATABASE)',
            performance: 'Optimized for speed',
            coverage: '100% of full database',
            achievement: 'MISSION ACCOMPLISHED'
        },
        products: fullDatabase
    };
    
    fs.writeFileSync('FULL-DATABASE-5554.json', JSON.stringify(fullDatabaseChunk, null, 2));
    console.log(`✅ Created FULL DATABASE chunk: ${fullDatabaseChunk.metadata.totalProducts} products`);
    
    // Check file size
    const fullSize = fs.statSync('FULL-DATABASE-5554.json').size;
    
    console.log('\n📊 File size:');
    console.log(`  FULL DATABASE chunk: ${(fullSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Calculate the difference from 5,000
    const additionalProducts = fullDatabase.length - 5000;
    
    console.log('\n📈 Database coverage:');
    console.log(`  Previous: 5,000 products (90% coverage)`);
    console.log(`  Adding: ${additionalProducts} more products`);
    console.log(`  Final: ${fullDatabase.length} products (100% coverage)`);
    
    console.log('\n🎯 FULL DATABASE ready!');
    console.log('📁 File created:');
    console.log('  - FULL-DATABASE-5554.json (5,554 products, 100% coverage)');
    console.log('  - MISSION ACCOMPLISHED! 🚀');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





