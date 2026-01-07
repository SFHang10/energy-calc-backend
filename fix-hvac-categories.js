const fs = require('fs');

// Load database
const dbPath = './FULL-DATABASE-5554.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('🔧 Fixing HVAC product categories...\n');

// HVAC Building Controls products
const hvacBuildingControls = ['Prefect', 'Merlin', 'HeatingSave', 'Energy Manager', 'CHEETAH'];

// Evaporative Air Coolers products
const evaporativeCoolers = ['FREECOOL', 'Breezair', 'AIRSYS', 'Seeley'];

let updatedCount = 0;

db.products.forEach(product => {
    const name = (product.name || '').toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    
    // Check if it's an HVAC Building Controls product
    const isBuildingControls = hvacBuildingControls.some(term => 
        name.includes(term.toLowerCase()) || brand.includes(term.toLowerCase())
    );
    
    // Check if it's an Evaporative Air Coolers product
    const isEvaporativeCooler = evaporativeCoolers.some(term => 
        name.includes(term.toLowerCase()) || brand.includes(term.toLowerCase())
    );
    
    if (isBuildingControls) {
        const oldCat = product.category;
        const oldSub = product.subcategory;
        product.category = 'HVAC';
        product.subcategory = 'HVAC Building Controls';
        console.log(`✅ ${product.name}`);
        console.log(`   Category: "${oldCat}" → "HVAC"`);
        console.log(`   Subcategory: "${oldSub}" → "HVAC Building Controls"\n`);
        updatedCount++;
    } else if (isEvaporativeCooler) {
        const oldCat = product.category;
        const oldSub = product.subcategory;
        product.category = 'HVAC';
        product.subcategory = 'Evaporative Air Coolers';
        console.log(`✅ ${product.name}`);
        console.log(`   Category: "${oldCat}" → "HVAC"`);
        console.log(`   Subcategory: "${oldSub}" → "Evaporative Air Coolers"\n`);
        updatedCount++;
    }
});

// Save updated database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`\n✅ Updated ${updatedCount} products to HVAC category`);
console.log('💾 Database saved!');



















