const fs = require('fs');

console.log('🏷️ Categorizing ETL Products by Official Categories...');

// Read the embedded file
const jsContent = fs.readFileSync('embedded-missing-etl-products.js', 'utf8');
const data = eval(jsContent + '; EMBEDDED_MISSING_ETL_PRODUCTS');

// Official ETL categories mapping
const categorizeProduct = (product) => {
    const name = product.name.toLowerCase();
    const subcategory = (product.subcategory || '').toLowerCase();
    
    // Energy Monitoring
    if (name.includes('monitoring') || name.includes('metering') || 
        name.includes('analyser') || name.includes('energy management') ||
        subcategory.includes('monitoring') || subcategory.includes('metering')) {
        return {
            ...product,
            category: 'Energy Monitoring',
            type: 'monitoring',
            icon: 'monitoring-icon.gif'
        };
    }
    
    // HVAC Equipment
    if (name.includes('hvac') || name.includes('heat pump') || name.includes('boiler') ||
        name.includes('ventilation') || name.includes('air conditioning') ||
        name.includes('chiller') || name.includes('heat recovery') ||
        subcategory.includes('hvac') || subcategory.includes('heat pump')) {
        return {
            ...product,
            category: 'HVAC Equipment',
            type: 'hvac',
            icon: 'hvac-icon.gif'
        };
    }
    
    // Motors, Drives & Fans
    if (name.includes('motor') || name.includes('drive') || name.includes('fan') ||
        name.includes('inverter') || name.includes('converter') ||
        subcategory.includes('motor') || subcategory.includes('drive')) {
        return {
            ...product,
            category: 'Motors, Drives & Fans',
            type: 'motor',
            icon: 'motor-icon.gif'
        };
    }
    
    // Keep existing category if no match
    return product;
};

// Categorize all products
const categorizedProducts = data.map(categorizeProduct);

// Create category breakdown
const categoryCount = {};
categorizedProducts.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
});

console.log('\n📊 Official ETL Category Breakdown:');
Object.entries(categoryCount).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} products`);
});

// Create embedded JavaScript file with categorized products
const categorizedJsContent = `// Embedded Categorized ETL Products Data
const EMBEDDED_CATEGORIZED_ETL_PRODUCTS = ${JSON.stringify(categorizedProducts, null, 2)};

// Make it globally available
if (typeof window !== 'undefined') {
    window.EMBEDDED_CATEGORIZED_ETL_PRODUCTS = EMBEDDED_CATEGORIZED_ETL_PRODUCTS;
}`;

// Write the file
fs.writeFileSync('embedded-categorized-etl-products.js', categorizedJsContent);

console.log(`\n✅ Created embedded-categorized-etl-products.js with official ETL categories`);
console.log('🎯 Ready to integrate with Energy Audit Widget!');







