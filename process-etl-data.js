const fs = require('fs');

console.log('🚀 Starting ETL Data Processing...');

// Read the copied file
const data = JSON.parse(fs.readFileSync('audit-etl-products.json'));

console.log(`📊 Processing ${data.products.length} products...`);

// Transform to Energy Audit Widget format
const transformedProducts = data.products.map(product => ({
    id: product.id,
    name: product.name,
    power: product.power,
    type: product.type,
    brand: product.brand,
    year: product.year,
    efficiency: product.efficiency,
    icon: 'default-icon.gif', // You can change this later
    category: product.category,
    subcategory: product.subcategory,
    isCurated: false,
    displayName: product.name,
    notes: product.subcategory || 'ETL Technology',
    hasMoreInfo: true,
    moreInfoText: `Brand: ${product.brand}\\nSubcategory: ${product.subcategory || 'N/A'}\\nModel: ${product.model_number || 'N/A'}\\nSource: ETL Database`
}));

// Create embedded JavaScript file
const jsContent = `// Embedded Missing ETL Products Data
const EMBEDDED_MISSING_ETL_PRODUCTS = ${JSON.stringify(transformedProducts, null, 2)};

// Make it globally available
if (typeof window !== 'undefined') {
    window.EMBEDDED_MISSING_ETL_PRODUCTS = EMBEDDED_MISSING_ETL_PRODUCTS;
}`;

// Write the file
fs.writeFileSync('embedded-missing-etl-products.js', jsContent);

console.log(`✅ Created embedded-missing-etl-products.js with ${transformedProducts.length} products`);

// Show category breakdown
const categoryCount = {};
transformedProducts.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
});

console.log('📈 Category breakdown:');
Object.entries(categoryCount).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} products`);
});

console.log('🎯 Ready to copy back to main directory!');