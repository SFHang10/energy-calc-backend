const fs = require('fs');

// Load database
const dbPath = './FULL-DATABASE-5554.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('🔧 Moving Professional Foodservice ovens to Ovens category...\n');

let updatedCount = 0;

db.products.forEach(product => {
    const name = (product.name || '').toLowerCase();
    const category = product.category || '';
    const subcategory = product.subcategory || '';
    
    // Check if it's a professional foodservice product that should be an oven
    if (category === 'professional-foodservice') {
        // Combination Steam Ovens -> Ovens
        if (subcategory === 'Combination Steam Ovens') {
            console.log(`✅ ${product.name?.substring(0, 50)}`);
            console.log(`   ${category} / ${subcategory} → Ovens / Combination Steam Ovens\n`);
            product.category = 'Ovens';
            product.subcategory = 'Combination Steam Ovens';
            updatedCount++;
        }
        // Commercial Ovens -> Ovens
        else if (subcategory === 'Commercial Ovens') {
            console.log(`✅ ${product.name?.substring(0, 50)}`);
            console.log(`   ${category} / ${subcategory} → Ovens / Commercial Ovens\n`);
            product.category = 'Ovens';
            product.subcategory = 'Commercial Ovens';
            updatedCount++;
        }
        // Professional Foodservice Equipment that are ovens (Skyline, etc)
        else if (subcategory === 'Professional Foodservice Equipment' && 
                 (name.includes('skyline') || name.includes('oven') || name.includes('electric 3-glass') || name.includes('electric 2-glass'))) {
            console.log(`✅ ${product.name?.substring(0, 50)}`);
            console.log(`   ${category} / ${subcategory} → Ovens / Combination Steam Ovens\n`);
            product.category = 'Ovens';
            product.subcategory = 'Combination Steam Ovens';
            updatedCount++;
        }
        // Products with no subcategory that look like ovens
        else if (!subcategory || subcategory === 'none') {
            if (name.includes('oven') || name.includes('skyline') || name.includes('magistar')) {
                console.log(`✅ ${product.name?.substring(0, 50)}`);
                console.log(`   ${category} / (none) → Ovens / Combination Steam Ovens\n`);
                product.category = 'Ovens';
                product.subcategory = 'Combination Steam Ovens';
                updatedCount++;
            }
        }
    }
});

// Save updated database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`\n✅ Updated ${updatedCount} products to Ovens category`);
console.log('💾 Database saved!');

// Show final count
const ovensNow = db.products.filter(p => p.category === 'Ovens');
console.log(`\n📊 Total products now in Ovens category: ${ovensNow.length}`);




















