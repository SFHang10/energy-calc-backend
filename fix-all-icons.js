const fs = require('fs');

console.log('🔧 Fixing all product icons to use emojis instead of HTML...');

// Read the categorized file
const jsContent = fs.readFileSync('embedded-categorized-etl-products.js', 'utf8');
const data = eval(jsContent + '; EMBEDDED_CATEGORIZED_ETL_PRODUCTS');

// Fix all products to use proper emoji icons
const fixedProducts = data.map(product => {
    let icon = '📦'; // Default fallback
    
    // Set proper emoji based on category
    if (product.category === 'HVAC Equipment') {
        icon = '🌡️';
    } else if (product.category === 'Energy Monitoring') {
        icon = '📊';
    } else if (product.category === 'Motors, Drives & Fans') {
        icon = '⚙️';
    } else if (product.category === 'Hand Dryers') {
        icon = '🌬️'; // Wind/air icon for hand dryers
    } else if (product.category === 'Appliances') {
        icon = '🏠';
    } else if (product.category === 'Lighting') {
        icon = '💡';
    } else if (product.category === 'Restaurant Equipment') {
        icon = '🍽️';
    } else if (product.category === 'ETL Technology') {
        icon = '⚡';
    }
    
    return {
        ...product,
        icon: icon
    };
});

console.log(`✅ Fixed icons for ${fixedProducts.length} products`);

// Show category breakdown with icons
const categoryCount = {};
fixedProducts.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
});

console.log('\n📊 Fixed Categories with Icons:');
Object.entries(categoryCount).forEach(([cat, count]) => {
    const icon = fixedProducts.find(p => p.category === cat)?.icon || '📦';
    console.log(`   ${icon} ${cat}: ${count} products`);
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

console.log('\n✅ Fixed embedded-categorized-etl-products.js with proper emoji icons');
console.log('🎯 All product icons now display correctly!');







