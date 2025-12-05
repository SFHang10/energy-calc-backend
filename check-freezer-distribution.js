const fs = require('fs');

console.log('🔍 Freezer/Fridge distribution by category:');

try {
    const data = JSON.parse(fs.readFileSync('extracted-products-data.json', 'utf8'));

    const categories = ['Appliances', 'ETL Technology', 'Restaurant Equipment', 'Office Equipment', 'Smart Home', 'Lighting'];

    categories.forEach(category => {
        const products = data.products.filter(p => p.category === category);
        const freezers = products.filter(p => 
            p.name.toLowerCase().includes('freezer') || 
            p.name.toLowerCase().includes('fridge') ||
            p.name.toLowerCase().includes('refrigerator') ||
            p.subcategory.toLowerCase().includes('freezer') ||
            p.subcategory.toLowerCase().includes('fridge') ||
            p.subcategory.toLowerCase().includes('refrigerator')
        );
        
        console.log(`${category}: ${freezers.length} freezer/fridge products`);
        if (freezers.length > 0) {
            freezers.forEach(p => {
                console.log(`  - ${p.name} (${p.subcategory})`);
            });
        }
    });

    console.log('\n💡 The issue might be:');
    console.log('  - Users expect freezers under "Appliances"');
    console.log('  - But commercial freezers are correctly in "Restaurant Equipment"');
    console.log('  - Need to check if calculator UI shows all categories properly');

} catch (error) {
    console.error('❌ Error:', error.message);
}





