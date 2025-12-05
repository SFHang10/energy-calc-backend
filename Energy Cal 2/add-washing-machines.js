// ADDITIONAL WASHING MACHINES - BATCH 1
// This adds 10 more washing machines to expand the database safely

const ADDITIONAL_WASHING_MACHINES = [
    { id: 'wm_51', name: 'Miele WDB020 WCS Eco Washing Machine', power: 140, category: 'Appliances', subcategory: 'Washing Machine', brand: 'Miele', runningCostPerYear: 61.32, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 7.5 },
    { id: 'wm_52', name: 'Bosch WAT28460GB Serie 6 Washing Machine', power: 160, category: 'Appliances', subcategory: 'Washing Machine', brand: 'Bosch', runningCostPerYear: 70.08, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 8.0 },
    { id: 'wm_53', name: 'Samsung WW90T554DAX AddWash Washing Machine', power: 150, category: 'Appliances', subcategory: 'Washing Machine', brand: 'Samsung', runningCostPerYear: 65.70, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 7.8 },
    { id: 'wm_54', name: 'LG F4WV510S0E 10kg Washing Machine', power: 145, category: 'Appliances', subcategory: 'Washing Machine', brand: 'LG', runningCostPerYear: 63.51, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 7.6 },
    { id: 'wm_55', name: 'AEG L7FEC966R ProSteam Washing Machine', power: 155, category: 'Appliances', subcategory: 'Washing Machine', brand: 'AEG', runningCostPerYear: 67.89, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 8.2 },
    { id: 'wm_56', name: 'Siemens WM14T460GB iQ500 Washing Machine', power: 165, category: 'Appliances', subcategory: 'Washing Machine', brand: 'Siemens', runningCostPerYear: 72.27, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 8.5 },
    { id: 'wm_57', name: 'Electrolux EW6F1408S PerfectCare Washing Machine', power: 135, category: 'Appliances', subcategory: 'Washing Machine', brand: 'Electrolux', runningCostPerYear: 59.13, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 7.3 },
    { id: 'wm_58', name: 'Zanussi ZWF01486SE 1400 Spin Washing Machine', power: 170, category: 'Appliances', subcategory: 'Washing Machine', brand: 'Zanussi', runningCostPerYear: 74.46, energyRating: 'A++', efficiency: 'High', source: 'Expansion', waterUsage: 8.8 },
    { id: 'wm_59', name: 'Hotpoint NSWE 1233BUK Washing Machine', power: 180, category: 'Appliances', subcategory: 'Washing Machine', brand: 'Hotpoint', runningCostPerYear: 78.84, energyRating: 'A++', efficiency: 'High', source: 'Expansion', waterUsage: 9.0 },
    { id: 'wm_60', name: 'Indesit IWSC 61251 C ECO Washing Machine', power: 175, category: 'Appliances', subcategory: 'Washing Machine', brand: 'Indesit', runningCostPerYear: 76.65, energyRating: 'A++', efficiency: 'High', source: 'Expansion', waterUsage: 8.7 }
];

// Safe function to add these products
function addWashingMachines() {
    console.log('🔄 Adding washing machines to database...');
    
    if (typeof PRODUCT_DATABASE_BACKUP !== 'undefined') {
        // Add to the backup database
        PRODUCT_DATABASE_BACKUP.sampleProducts.push(...ADDITIONAL_WASHING_MACHINES);
        console.log('✅ Added', ADDITIONAL_WASHING_MACHINES.length, 'washing machines');
        console.log('📊 Total products now:', PRODUCT_DATABASE_BACKUP.getProductCount());
    } else {
        console.error('❌ Database not found');
    }
}

// Export for safe use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ADDITIONAL_WASHING_MACHINES, addWashingMachines };
} else {
    window.ADDITIONAL_WASHING_MACHINES = ADDITIONAL_WASHING_MACHINES;
    window.addWashingMachines = addWashingMachines;
}


