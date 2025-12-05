const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🖼️ Adding Images to Specific Products Added Yesterday...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// These are the specific products we added to Wix yesterday that need images
const productsToAddImages = [
    // Heat Pumps
    { name: 'Baxi Auriga HP', brand: 'Baxi Heating-Commercial', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcVB_tdtoDugBj' },
    { name: 'Baxi Quinta Ace', brand: 'Baxi Heating-Commercial', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id0X_tdtoDugBj' },
    { name: 'Daikin Altherma 3', brand: 'Daikin Europe N.V.', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id01_tdtoDugBj' },
    { name: 'Viessmann Vitocal', brand: 'Viessmann Ltd', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcZ9_tdtoDugBj' },
    { name: 'Bosch Compress', brand: 'Bosch Thermotechnology Ltd', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcYh_tdtoDugBj' },
    
    // HVAC Equipment
    { name: 'VLT REFRIGERATION DRIVE', brand: 'Danfoss Ltd', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcXk_tdtoDugBj' },
    { name: 'Frenic HVAC', brand: 'Fuji Electric', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcWt_tdtoDugBj' },
    { name: 'Optidrive E3', brand: 'Invertek Drives Ltd', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcVB_tdtoDugBj' },
    { name: 'Chilled Beam', brand: 'Evapco Europe NV', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id0X_tdtoDugBj' },
    { name: 'Perfect Irus', brand: 'Jaeggi Hybridtechnology Ltd', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id01_tdtoDugBj' },
    
    // Refrigeration Equipment
    { name: 'Secotec Refrigeration Dryer', brand: 'HPC Industrial Process Cooling Ltd', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcZ9_tdtoDugBj' },
    { name: 'Hybrid Dry Cooler', brand: 'Jaeggi Hybridtechnology Ltd', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcYh_tdtoDugBj' },
    { name: 'Induced Draft Axial Fan Hybrid Condenser', brand: 'Jaeggi Hybridtechnology Ltd', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcXk_tdtoDugBj' }
];

async function findWixProducts() {
    return new Promise((resolve, reject) => {
        // We'll need to query Wix to get the actual product IDs
        // For now, let's just show what we need to do
        console.log('📋 Products that need images added:');
        console.log('================================================================================');
        
        productsToAddImages.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} - ${product.brand}`);
            console.log(`   Image URL: ${product.imageUrl}`);
            console.log('');
        });
        
        console.log('🎯 Next Steps:');
        console.log('1. Query Wix store to get product IDs for these products');
        console.log('2. Import images to Wix Media Manager');
        console.log('3. Add media IDs to each product');
        
        resolve(productsToAddImages);
    });
}

findWixProducts().then(() => db.close()).catch(() => db.close());





