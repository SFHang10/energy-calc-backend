const fs = require('fs');

console.log('🔍 Investigating Freezer categorization in the database...');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));
    
    console.log(`📊 Total products in database: ${data.products.length}`);
    
    // Search for products containing "freezer" or "fridge" in name or subcategory
    const freezerProducts = data.products.filter(p => 
        p.name.toLowerCase().includes('freezer') || 
        p.name.toLowerCase().includes('fridge') ||
        p.subcategory.toLowerCase().includes('freezer') ||
        p.subcategory.toLowerCase().includes('fridge') ||
        p.subcategory.toLowerCase().includes('refrigerator')
    );
    
    console.log(`\n🧊 Found ${freezerProducts.length} freezer/fridge products:`);
    
    // Group by subcategory
    const subcategoryGroups = {};
    freezerProducts.forEach(product => {
        const subcat = product.subcategory;
        if (!subcategoryGroups[subcat]) {
            subcategoryGroups[subcat] = [];
        }
        subcategoryGroups[subcat].push(product);
    });
    
    console.log('\n📂 Freezer/Fridge products by subcategory:');
    Object.entries(subcategoryGroups).forEach(([subcat, products]) => {
        console.log(`  ${subcat}: ${products.length} products`);
        // Show first few product names as examples
        products.slice(0, 3).forEach(p => {
            console.log(`    - ${p.name}`);
        });
        if (products.length > 3) {
            console.log(`    ... and ${products.length - 3} more`);
        }
    });
    
    // Also check what subcategories exist for Appliances category
    const applianceProducts = data.products.filter(p => p.category === 'Appliances');
    const applianceSubcategories = [...new Set(applianceProducts.map(p => p.subcategory))];
    
    console.log('\n🏷️ All Appliances subcategories:');
    applianceSubcategories.forEach(subcat => {
        const count = applianceProducts.filter(p => p.subcategory === subcat).length;
        console.log(`  ${subcat}: ${count} products`);
    });
    
    // Check if there are any products with "Freezer" as a standalone subcategory
    const standaloneFreezers = data.products.filter(p => 
        p.subcategory.toLowerCase() === 'freezer' ||
        p.subcategory.toLowerCase() === 'freezers'
    );
    
    console.log(`\n🧊 Standalone "Freezer" subcategory: ${standaloneFreezers.length} products`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
}





