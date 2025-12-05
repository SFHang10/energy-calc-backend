const fs = require('fs');

console.log('🚀 Creating ETL Product Enhancement Script...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    console.log(`📊 Processing ${data.products.length} products...`);
    
    // Enhance products with ETL identification
    const enhancedProducts = data.products.map(product => {
        const enhanced = { ...product };
        
        // Add ETL identification
        enhanced.isETL = product.category === 'ETL Technology';
        enhanced.etlCertified = product.category === 'ETL Technology';
        enhanced.source = product.category === 'ETL Technology' ? 'ETL' : 'Comparative';
        
        // Add ETL-specific fields
        if (enhanced.isETL) {
            enhanced.etlStatus = 'Certified';
            enhanced.grantEligible = true;
            enhanced.etlCategory = product.subcategory;
        } else {
            enhanced.etlStatus = 'Not ETL';
            enhanced.grantEligible = false;
            enhanced.etlCategory = null;
        }
        
        // Add product type for easier identification
        enhanced.productType = enhanced.isETL ? 'ETL Certified' : 'Comparative Data';
        
        return enhanced;
    });
    
    // Create enhanced database
    const enhancedDatabase = {
        metadata: {
            ...data.metadata,
            totalProducts: enhancedProducts.length,
            etlProducts: enhancedProducts.filter(p => p.isETL).length,
            comparativeProducts: enhancedProducts.filter(p => !p.isETL).length,
            enhancementDate: new Date().toISOString(),
            enhancements: [
                'Added ETL identification fields',
                'Distinguished ETL from Comparative products',
                'Added grant eligibility markers',
                'Added product type classification'
            ]
        },
        products: enhancedProducts
    };
    
    // Save enhanced database
    fs.writeFileSync('enhanced-products-with-etl-identification.json', JSON.stringify(enhancedDatabase, null, 2));
    
    console.log('✅ Enhanced database created!');
    console.log(`📊 ETL Products: ${enhancedDatabase.metadata.etlProducts}`);
    console.log(`📊 Comparative Products: ${enhancedDatabase.metadata.comparativeProducts}`);
    console.log(`📊 Total Products: ${enhancedDatabase.metadata.totalProducts}`);
    
    // Check refrigeration products in ETL category
    const etlProducts = enhancedProducts.filter(p => p.isETL);
    const refrigerationProducts = etlProducts.filter(p => 
        p.name.toLowerCase().includes('refrigerat') ||
        p.name.toLowerCase().includes('freezer') ||
        p.name.toLowerCase().includes('fridge') ||
        p.name.toLowerCase().includes('cooling') ||
        p.name.toLowerCase().includes('chiller') ||
        p.subcategory.toLowerCase().includes('refrigerat') ||
        p.subcategory.toLowerCase().includes('cooling')
    );
    
    console.log(`\n🧊 ETL Refrigeration Products: ${refrigerationProducts.length}`);
    console.log('   (Still missing ~2,456 ETL refrigeration products)');
    
    console.log('\n📁 Files created:');
    console.log('  - enhanced-products-with-etl-identification.json');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





