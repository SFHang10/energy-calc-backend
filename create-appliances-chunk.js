const fs = require('fs');

console.log('🚀 Starting appliances chunk creation...');

try {
    // Read the full database
    console.log('📖 Reading extracted-products-data.json...');
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    console.log(`📊 Total products in database: ${data.products.length}`);
    
    // Filter appliances and take first 500
    console.log('🔍 Filtering appliances...');
    const appliances = data.products.filter(p => p.category === 'Appliances').slice(0, 500);
    
    console.log(`✅ Found ${appliances.length} appliances`);
    
    // Create chunk metadata
    const chunk = {
        metadata: {
            chunkType: 'Appliances',
            totalProducts: appliances.length,
            extractionDate: new Date().toISOString(),
            sourceDatabase: 'energy_calculator.db',
            categories: ['Appliances'],
            subcategories: [...new Set(appliances.map(p => p.subcategory))],
            brands: [...new Set(appliances.map(p => p.brand))],
            chunkStrategy: 'Smart Chunking - Category Based'
        },
        products: appliances
    };
    
    // Write chunk file
    console.log('💾 Writing appliances-chunk-500.json...');
    fs.writeFileSync('appliances-chunk-500.json', JSON.stringify(chunk, null, 2));
    
    console.log('✅ SUCCESS: Created appliances chunk!');
    console.log(`📊 Products: ${chunk.metadata.totalProducts}`);
    console.log(`🏷️ Subcategories: ${chunk.metadata.subcategories.join(', ')}`);
    console.log(`🔧 Brands: ${chunk.metadata.brands.slice(0, 10).join(', ')}...`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





