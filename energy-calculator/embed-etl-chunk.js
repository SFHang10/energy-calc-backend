const fs = require('fs');

console.log('🚀 Embedding 500-product ETL chunk into calculator...');

try {
    // Read the ETL chunk
    const etlChunk = JSON.parse(fs.readFileSync('etl-chunk-500.json', 'utf8'));
    
    // Read the current calculator
    const calculatorContent = fs.readFileSync('energy-calculator-enhanced-2.html', 'utf8');
    
    // Create the embedded data string
    const embeddedData = `        // Create a comprehensive embedded dataset to bypass CORS completely
        window.ENHANCED_PRODUCTS_DATABASE = {
            metadata: {
                totalProducts: ${etlChunk.metadata.totalProducts},
                extractionDate: "${etlChunk.metadata.extractionDate}",
                sourceDatabase: "${etlChunk.metadata.sourceDatabase}",
                categories: ${JSON.stringify(etlChunk.metadata.categories)},
                subcategories: ${JSON.stringify(etlChunk.metadata.subcategories)},
                brands: ${JSON.stringify(etlChunk.metadata.brands)},
                chunkStrategy: "${etlChunk.metadata.chunkStrategy}",
                totalAvailable: ${etlChunk.metadata.totalAvailable},
                chunkSize: "${etlChunk.metadata.chunkSize}"
            },
            products: ${JSON.stringify(etlChunk.products, null, 16)}
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
    
    console.log('✅ SUCCESS: Embedded 500-product ETL chunk!');
    console.log(`📊 Products: ${etlChunk.metadata.totalProducts}`);
    console.log(`🏷️ Categories: ${etlChunk.metadata.categories.join(', ')}`);
    console.log(`🔧 Brands: ${etlChunk.metadata.brands.slice(0, 5).join(', ')}...`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





