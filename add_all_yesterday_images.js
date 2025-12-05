const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🖼️ Adding Images to All Yesterday\'s Products...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Products we added yesterday that need images
const yesterdayProducts = [
    // Heat Pumps - Baxi
    { name: 'Baxi Auriga HP 6kW Heat Pump', sku: 'etl_baxi_auriga_6kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcVB_tdtoDugBj' },
    { name: 'Baxi Auriga HP 8kW Heat Pump', sku: 'etl_baxi_auriga_8kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id0X_tdtoDugBj' },
    { name: 'Baxi Auriga HP 12kW Heat Pump', sku: 'etl_baxi_auriga_12kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id01_tdtoDugBj' },
    { name: 'Baxi Auriga HP 16kW Heat Pump', sku: 'etl_baxi_auriga_16kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcZ9_tdtoDugBj' },
    { name: 'Baxi Quinta Ace 6kW Heat Pump', sku: 'etl_baxi_quinta_6kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcYh_tdtoDugBj' },
    { name: 'Baxi Quinta Ace 8kW Heat Pump', sku: 'etl_baxi_quinta_8kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcXk_tdtoDugBj' },
    { name: 'Baxi Quinta Ace 12kW Heat Pump', sku: 'etl_baxi_quinta_12kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcWt_tdtoDugBj' },
    { name: 'Baxi Quinta Ace 16kW Heat Pump', sku: 'etl_baxi_quinta_16kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcVB_tdtoDugBj' },
    { name: 'Baxi Quinta Ace 20kW Heat Pump', sku: 'etl_baxi_quinta_20kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id0X_tdtoDugBj' },
    
    // Heat Pumps - Daikin
    { name: 'Daikin Altherma 3 6kW Heat Pump', sku: 'etl_daikin_altherma_6kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id01_tdtoDugBj' },
    { name: 'Daikin Altherma 3 8kW Heat Pump', sku: 'etl_daikin_altherma_8kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcZ9_tdtoDugBj' },
    { name: 'Daikin Altherma 3 12kW Heat Pump', sku: 'etl_daikin_altherma_12kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcYh_tdtoDugBj' },
    
    // Heat Pumps - Viessmann
    { name: 'Viessmann Vitocal 6kW Heat Pump', sku: 'etl_viessmann_vitocal_6kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcXk_tdtoDugBj' },
    { name: 'Viessmann Vitocal 8kW Heat Pump', sku: 'etl_viessmann_vitocal_8kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcWt_tdtoDugBj' },
    { name: 'Viessmann Vitocal 12kW Heat Pump', sku: 'etl_viessmann_vitocal_12kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcVB_tdtoDugBj' },
    { name: 'Viessmann Vitocal 16kW Heat Pump', sku: 'etl_viessmann_vitocal_16kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id0X_tdtoDugBj' },
    
    // Heat Pumps - Bosch
    { name: 'Bosch Compress 6kW Heat Pump', sku: 'etl_bosch_compress_6kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id01_tdtoDugBj' },
    { name: 'Bosch Compress 8kW Heat Pump', sku: 'etl_bosch_compress_8kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcZ9_tdtoDugBj' },
    
    // Heat Pumps - Hisa
    { name: 'Hisa Logic Air 6kW Heat Pump', sku: 'etl_hisa_logic_6kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcYh_tdtoDugBj' },
    { name: 'Hisa Logic Air 8kW Heat Pump', sku: 'etl_hisa_logic_8kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcXk_tdtoDugBj' },
    { name: 'Hisa Logic Air 12kW Heat Pump', sku: 'etl_hisa_logic_12kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcWt_tdtoDugBj' },
    { name: 'Hisa Logic Air 16kW Heat Pump', sku: 'etl_hisa_logic_16kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcVB_tdtoDugBj' },
    
    // Heat Pumps - Ideal Boilers
    { name: 'Ideal Boilers Logic Air 6kW Heat Pump', sku: 'etl_ideal_logic_6kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id0X_tdtoDugBj' },
    { name: 'Ideal Boilers Logic Air 8kW Heat Pump', sku: 'etl_ideal_logic_8kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id01_tdtoDugBj' },
    { name: 'Ideal Boilers Logic Air 12kW Heat Pump', sku: 'etl_ideal_logic_12kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcZ9_tdtoDugBj' },
    { name: 'Ideal Boilers Logic Air 16kW Heat Pump', sku: 'etl_ideal_logic_16kw', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcYh_tdtoDugBj' },
    
    // HVAC Equipment
    { name: 'ABB ACS880-01 Drive', sku: 'etl_abb_acs880', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcXk_tdtoDugBj' },
    { name: 'Danfoss VLT HVAC Drive', sku: 'etl_danfoss_vlt', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcWt_tdtoDugBj' },
    { name: 'Fuji Electric Frenic HVAC', sku: 'etl_fuji_frenic', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcVB_tdtoDugBj' },
    { name: 'Invertek Optidrive E3', sku: 'etl_invertek_optidrive', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id0X_tdtoDugBj' },
    { name: 'Evapco Chilled Beam', sku: 'etl_evapco_chilled', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2Id01_tdtoDugBj' },
    { name: 'Jaeggi Perfect Irus Control', sku: 'etl_jaeggi_perfect', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcZ9_tdtoDugBj' },
    
    // Refrigeration Equipment
    { name: 'Danfoss VLT Refrigeration Drive', sku: 'etl_danfoss_refrigeration', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcYh_tdtoDugBj' },
    { name: 'Secotec Refrigeration Dryer', sku: 'etl_secotec_dryer', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcXk_tdtoDugBj' },
    { name: 'HPC Hybrid Dry Cooler', sku: 'etl_hpc_hybrid', imageUrl: 'https://img.etl.energysecurity.gov.uk/200x/e2IcWt_tdtoDugBj' }
];

console.log(`🎯 Starting batch image addition for ${yesterdayProducts.length} products...\n`);

// Group products by unique image URLs to avoid duplicate imports
const imageGroups = {};
yesterdayProducts.forEach(product => {
    if (!imageGroups[product.imageUrl]) {
        imageGroups[product.imageUrl] = [];
    }
    imageGroups[product.imageUrl].push(product);
});

console.log(`📸 Found ${Object.keys(imageGroups).length} unique images to import:`);
Object.keys(imageGroups).forEach((imageUrl, index) => {
    console.log(`${index + 1}. ${imageUrl} (${imageGroups[imageUrl].length} products)`);
});

console.log('\n🔄 Image addition process:');
console.log('1. Import each unique image to Wix Media Manager');
console.log('2. Add the media ID to all products using that image');
console.log('3. Repeat for all image groups');

console.log('\n💡 Note: This script shows the structure for batch image addition.');
console.log('   The actual API calls will be made separately to add the images.');

db.close();





