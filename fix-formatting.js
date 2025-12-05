const fs = require('fs');

console.log('🔧 Fixing formatting issues in categorized products...');

// Read the categorized file
const jsContent = fs.readFileSync('embedded-categorized-etl-products.js', 'utf8');
const data = eval(jsContent + '; EMBEDDED_CATEGORIZED_ETL_PRODUCTS');

// Fix formatting issues
const fixedProducts = data.map(product => ({
    ...product,
    // Fix image issues - use proper icons instead of broken URLs
    icon: product.category === 'HVAC Equipment' ? '🌡️' : 
          product.category === 'Energy Monitoring' ? '📊' : 
          product.category === 'Motors, Drives & Fans' ? '⚙️' : 
          product.icon || '📦',
    
    // Ensure proper type mapping
    type: product.category === 'HVAC Equipment' ? 'hvac' : 
          product.category === 'Energy Monitoring' ? 'monitoring' : 
          product.category === 'Motors, Drives & Fans' ? 'motor' : 
          product.type,
    
    // Fix power display (ensure it's a number)
    power: typeof product.power === 'number' ? product.power : parseFloat(product.power) || 0,
    
    // Fix running cost calculation
    runningCostPerYear: product.runningCostPerYear || (product.power * 0.12 * 8760) || 0,
    
    // Ensure proper display name
    displayName: product.name || product.displayName || 'Unknown Product',
    
    // Fix more info text formatting
    moreInfoText: product.moreInfoText ? product.moreInfoText.replace(/\\n/g, '\n') : 
                  `Brand: ${product.brand || 'N/A'}\nSubcategory: ${product.subcategory || 'N/A'}\nModel: ${product.model_number || 'N/A'}\nSource: ETL Database`
}));

console.log(`✅ Fixed formatting for ${fixedProducts.length} products`);

// Show category breakdown
const categoryCount = {};
fixedProducts.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
});

console.log('\n📊 Fixed Categories:');
Object.entries(categoryCount).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} products`);
});

// Create fixed embedded JavaScript file
const fixedJsContent = `// Fixed Embedded Categorized ETL Products Data
const EMBEDDED_CATEGORIZED_ETL_PRODUCTS = ${JSON.stringify(fixedProducts, null, 2)};

// Make it globally available
if (typeof window !== 'undefined') {
    window.EMBEDDED_CATEGORIZED_ETL_PRODUCTS = EMBEDDED_CATEGORIZED_ETL_PRODUCTS;
}`;

// Write the fixed file
fs.writeFileSync('embedded-categorized-etl-products.js', fixedJsContent);

console.log('\n✅ Fixed embedded-categorized-etl-products.js');
console.log('🎯 Formatting issues resolved!');







