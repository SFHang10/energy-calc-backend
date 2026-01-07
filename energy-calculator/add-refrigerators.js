// ADDITIONAL REFRIGERATORS - BATCH 3
// This adds 10 more refrigerators to expand the database safely

const ADDITIONAL_REFRIGERATORS = [
    { id: 'fridge_51', name: 'Miele K 37422 iD Fridge Freezer', power: 95, category: 'Appliances', subcategory: 'Refrigerator', brand: 'Miele', runningCostPerYear: 41.61, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'fridge_52', name: 'Bosch KGN39XWPA Fridge Freezer', power: 100, category: 'Appliances', subcategory: 'Refrigerator', brand: 'Bosch', runningCostPerYear: 43.80, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'fridge_53', name: 'Samsung RB38T602CS9 Fridge Freezer', power: 105, category: 'Appliances', subcategory: 'Refrigerator', brand: 'Samsung', runningCostPerYear: 45.99, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'fridge_54', name: 'LG GSL760PZXV Fridge Freezer', power: 110, category: 'Appliances', subcategory: 'Refrigerator', brand: 'LG', runningCostPerYear: 48.18, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'fridge_55', name: 'AEG SAN 8884 Fridge Freezer', power: 115, category: 'Appliances', subcategory: 'Refrigerator', brand: 'AEG', runningCostPerYear: 50.37, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'fridge_56', name: 'Siemens KG39NAWPA Fridge Freezer', power: 120, category: 'Appliances', subcategory: 'Refrigerator', brand: 'Siemens', runningCostPerYear: 52.56, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'fridge_57', name: 'Electrolux EN3887AOX Fridge Freezer', power: 125, category: 'Appliances', subcategory: 'Refrigerator', brand: 'Electrolux', runningCostPerYear: 54.75, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'fridge_58', name: 'Zanussi ZBF3A20W Fridge Freezer', power: 130, category: 'Appliances', subcategory: 'Refrigerator', brand: 'Zanussi', runningCostPerYear: 56.94, energyRating: 'A++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'fridge_59', name: 'Hotpoint NMF 5184 Fridge Freezer', power: 135, category: 'Appliances', subcategory: 'Refrigerator', brand: 'Hotpoint', runningCostPerYear: 59.13, energyRating: 'A++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'fridge_60', name: 'Indesit BIA 120 Fridge Freezer', power: 140, category: 'Appliances', subcategory: 'Refrigerator', brand: 'Indesit', runningCostPerYear: 61.32, energyRating: 'A++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 }
];

// Safe function to add these products
function addRefrigerators() {
    console.log('🔄 Adding refrigerators to database...');
    
    if (typeof PRODUCT_DATABASE_BACKUP !== 'undefined') {
        // Add to the backup database
        PRODUCT_DATABASE_BACKUP.sampleProducts.push(...ADDITIONAL_REFRIGERATORS);
        console.log('✅ Added', ADDITIONAL_REFRIGERATORS.length, 'refrigerators');
        console.log('📊 Total products now:', PRODUCT_DATABASE_BACKUP.getProductCount());
    } else {
        console.error('❌ Database not found');
    }
}

// Export for safe use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ADDITIONAL_REFRIGERATORS, addRefrigerators };
} else {
    window.ADDITIONAL_REFRIGERATORS = ADDITIONAL_REFRIGERATORS;
    window.addRefrigerators = addRefrigerators;
}


