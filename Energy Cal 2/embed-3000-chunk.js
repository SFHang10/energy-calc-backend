const fs = require('fs');

console.log('🚀 Embedding 3,000-product comprehensive chunk into calculator...');

try {
    // Read the comprehensive chunk
    const comprehensiveChunk = JSON.parse(fs.readFileSync('comprehensive-chunk-3000.json', 'utf8'));
    
    // Read the current calculator
    const calculatorContent = fs.readFileSync('energy-calculator-enhanced-2.html', 'utf8');
    
    // Create the embedded data string
    const embeddedData = `        // Create a comprehensive embedded dataset to bypass CORS completely
        window.ENHANCED_PRODUCTS_DATABASE = {
            metadata: {
                totalProducts: ${comprehensiveChunk.metadata.totalProducts},
                extractionDate: "${comprehensiveChunk.metadata.extractionDate}",
                sourceDatabase: "${comprehensiveChunk.metadata.sourceDatabase}",
                categories: ${JSON.stringify(comprehensiveChunk.metadata.categories)},
                subcategories: ${JSON.stringify(comprehensiveChunk.metadata.subcategories)},
                brands: ${JSON.stringify(comprehensiveChunk.metadata.brands)},
                chunkStrategy: "${comprehensiveChunk.metadata.chunkStrategy}",
                totalAvailable: ${comprehensiveChunk.metadata.totalAvailable},
                chunkSize: "${comprehensiveChunk.metadata.chunkSize}",
                performance: "${comprehensiveChunk.metadata.performance}",
                coverage: "${comprehensiveChunk.metadata.coverage}"
            },
            products: ${JSON.stringify(comprehensiveChunk.products, null, 16)}
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
    
    console.log('✅ SUCCESS: Embedded 3,000-product comprehensive chunk!');
    console.log(`📊 Products: ${comprehensiveChunk.metadata.totalProducts}`);
    console.log(`🏷️ Categories: ${comprehensiveChunk.metadata.categories.join(', ')}`);
    console.log(`🔧 Brands: ${comprehensiveChunk.metadata.brands.slice(0, 5).join(', ')}...`);
    console.log(`📈 Subcategories: ${comprehensiveChunk.metadata.subcategories.length} different types`);
    console.log(`⚡ Performance: ${comprehensiveChunk.metadata.performance}`);
    console.log(`📊 Coverage: ${comprehensiveChunk.metadata.coverage}`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





