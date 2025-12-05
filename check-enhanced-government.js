const fs = require('fs');

console.log('🔍 Checking enhanced-products-with-etl-identification.json for government info...');

try {
    const data = JSON.parse(fs.readFileSync('enhanced-products-with-etl-identification.json', 'utf8'));

    console.log(`📊 Total products: ${data.products.length}`);

    const sampleProduct = data.products[0];
    console.log('\n📋 Sample product fields:');
    Object.keys(sampleProduct).forEach(key => {
        console.log(`  ${key}: ${typeof sampleProduct[key]}`);
    });

    // Check if products have grants
    const hasGrants = data.products.some(p => p.hasOwnProperty('grants') || p.hasOwnProperty('grantsTotal'));
    console.log(`\n💰 Products with grants: ${hasGrants}`);

    // Check if products have collection agencies
    const hasCollectionAgencies = data.products.some(p => p.hasOwnProperty('collectionAgencies') || p.hasOwnProperty('collectionAgenciesCount'));
    console.log(`♻️ Products with collection agencies: ${hasCollectionAgencies}`);

    // Count products with grants
    const productsWithGrants = data.products.filter(p => p.grants && p.grants.length > 0);
    console.log(`📊 Products with grants: ${productsWithGrants.length}`);

    // Count products with collection agencies
    const productsWithCollection = data.products.filter(p => p.collectionAgencies && p.collectionAgencies.length > 0);
    console.log(`📊 Products with collection agencies: ${productsWithCollection.length}`);

    if (productsWithGrants.length > 0) {
        console.log('\n💰 Sample grant:');
        console.log(JSON.stringify(productsWithGrants[0].grants[0], null, 2));
    }

    if (productsWithCollection.length > 0) {
        console.log('\n♻️ Sample collection agency:');
        console.log(JSON.stringify(productsWithCollection[0].collectionAgencies[0], null, 2));
    }

    console.log('\n💡 Analysis:');
    if (hasGrants && hasCollectionAgencies) {
        console.log('✅ This dataset HAS hardcoded government information!');
        console.log('✅ This is the correct dataset to use');
    } else {
        console.log('❌ This dataset also missing hardcoded government information');
    }

} catch (error) {
    console.error('❌ Error:', error.message);
}





