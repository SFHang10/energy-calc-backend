// ADDITIONAL DISHWASHERS - BATCH 2
// This adds 10 more dishwashers to expand the database safely

const ADDITIONAL_DISHWASHERS = [
    { id: 'dw_51', name: 'Miele G 7100 SCVi Dishwasher', power: 120, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Miele', runningCostPerYear: 52.56, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 6.5 },
    { id: 'dw_52', name: 'Bosch SMS6ZCI01G Serie 6 Dishwasher', power: 125, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Bosch', runningCostPerYear: 54.75, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 6.8 },
    { id: 'dw_53', name: 'Samsung DW60M5050FS Smart Dishwasher', power: 130, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Samsung', runningCostPerYear: 56.94, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 7.0 },
    { id: 'dw_54', name: 'LG DFB325HS 14 Place Dishwasher', power: 115, category: 'Appliances', subcategory: 'Dishwasher', brand: 'LG', runningCostPerYear: 50.37, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 6.2 },
    { id: 'dw_55', name: 'AEG FFB52606PM ProClean Dishwasher', power: 135, category: 'Appliances', subcategory: 'Dishwasher', brand: 'AEG', runningCostPerYear: 59.13, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 7.2 },
    { id: 'dw_56', name: 'Siemens SN236I03ME iQ300 Dishwasher', power: 140, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Siemens', runningCostPerYear: 61.32, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 7.5 },
    { id: 'dw_57', name: 'Electrolux ESL 5205L Dishwasher', power: 110, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Electrolux', runningCostPerYear: 48.18, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 5.8 },
    { id: 'dw_58', name: 'Zanussi ZDT26001FA Dishwasher', power: 145, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Zanussi', runningCostPerYear: 63.51, energyRating: 'A++', efficiency: 'High', source: 'Expansion', waterUsage: 7.8 },
    { id: 'dw_59', name: 'Hotpoint HIC3B26 Dishwasher', power: 150, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Hotpoint', runningCostPerYear: 65.70, energyRating: 'A++', efficiency: 'High', source: 'Expansion', waterUsage: 8.0 },
    { id: 'dw_60', name: 'Indesit DIF 06B1 Dishwasher', power: 155, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Indesit', runningCostPerYear: 67.89, energyRating: 'A++', efficiency: 'High', source: 'Expansion', waterUsage: 8.2 }
];

// Safe function to add these products
function addDishwashers() {
    console.log('🔄 Adding dishwashers to database...');
    
    if (typeof PRODUCT_DATABASE_BACKUP !== 'undefined') {
        // Add to the backup database
        PRODUCT_DATABASE_BACKUP.sampleProducts.push(...ADDITIONAL_DISHWASHERS);
        console.log('✅ Added', ADDITIONAL_DISHWASHERS.length, 'dishwashers');
        console.log('📊 Total products now:', PRODUCT_DATABASE_BACKUP.getProductCount());
    } else {
        console.error('❌ Database not found');
    }
}

// Export for safe use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ADDITIONAL_DISHWASHERS, addDishwashers };
} else {
    window.ADDITIONAL_DISHWASHERS = ADDITIONAL_DISHWASHERS;
    window.addDishwashers = addDishwashers;
}


