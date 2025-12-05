const fs = require('fs');

console.log('🚀 Embedding FULL 5,554-product database into calculator...');

try {
    // Read the FULL database chunk
    const fullDatabaseChunk = JSON.parse(fs.readFileSync('FULL-DATABASE-5554.json', 'utf8'));
    
    // Read the current calculator
    const calculatorContent = fs.readFileSync('energy-calculator-enhanced-2.html', 'utf8');
    
    // Create the embedded data string
    const embeddedData = `        // Create a comprehensive embedded dataset to bypass CORS completely
        window.ENHANCED_PRODUCTS_DATABASE = {
            metadata: {
                totalProducts: ${fullDatabaseChunk.metadata.totalProducts},
                extractionDate: "${fullDatabaseChunk.metadata.extractionDate}",
                sourceDatabase: "${fullDatabaseChunk.metadata.sourceDatabase}",
                categories: ${JSON.stringify(fullDatabaseChunk.metadata.categories)},
                subcategories: ${JSON.stringify(fullDatabaseChunk.metadata.subcategories)},
                brands: ${JSON.stringify(fullDatabaseChunk.metadata.brands)},
                chunkStrategy: "${fullDatabaseChunk.metadata.chunkStrategy}",
                totalAvailable: ${fullDatabaseChunk.metadata.totalAvailable},
                chunkSize: "${fullDatabaseChunk.metadata.chunkSize}",
                performance: "${fullDatabaseChunk.metadata.performance}",
                coverage: "${fullDatabaseChunk.metadata.coverage}",
                achievement: "${fullDatabaseChunk.metadata.achievement}"
            },
            products: ${JSON.stringify(fullDatabaseChunk.products, null, 16)}
        };`;
    
    // Find and replace the existing embedded database section
    const startMarker = '        // Create a comprehensive embedded dataset to bypass CORS completely';
    const endMarker = '        };';
    
    const startIndex = calculatorContent.indexOf(startMarker);
    const endIndex = calculatorContent.indexOf(endMarker, startIndex) + endMarker.length;
    
    if (startIndex === -1 || endIndex === -1) {
        throw new Error('Could not find embedded database section');
    }
    
    const newContent = calculatorContent.substring(0, startIndex) + 
                      embeddedData + 
                      calculatorContent.substring(endIndex);
    
    // Write the updated calculator
    fs.writeFileSync('energy-calculator-enhanced-2.html', newContent);
    
    console.log('🎉 MISSION ACCOMPLISHED! Embedded FULL DATABASE!');
    console.log(`📊 Products: ${fullDatabaseChunk.metadata.totalProducts}`);
    console.log(`🏷️ Categories: ${fullDatabaseChunk.metadata.categories.join(', ')}`);
    console.log(`🔧 Brands: ${fullDatabaseChunk.metadata.brands.slice(0, 5).join(', ')}...`);
    console.log(`📈 Subcategories: ${fullDatabaseChunk.metadata.subcategories.length} different types`);
    console.log(`⚡ Performance: ${fullDatabaseChunk.metadata.performance}`);
    console.log(`📊 Coverage: ${fullDatabaseChunk.metadata.coverage}`);
    console.log(`🏆 Achievement: ${fullDatabaseChunk.metadata.achievement}`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





