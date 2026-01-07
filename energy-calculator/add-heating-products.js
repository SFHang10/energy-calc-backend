// ADDITIONAL HEATING PRODUCTS - BATCH 5
// This adds 12 more heating products to expand the database safely

const ADDITIONAL_HEATING_PRODUCTS = [
    { id: 'heat_51', name: 'Vaillant ecoTEC Plus 24kW Combi Boiler', power: 24000, category: 'Heating', subcategory: 'Boilers', brand: 'Vaillant', runningCostPerYear: 1051.20, energyRating: 'A+', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_52', name: 'Mitsubishi Electric Ecodan 5kW Heat Pump', power: 5000, category: 'Heating', subcategory: 'Heat Pumps', brand: 'Mitsubishi', runningCostPerYear: 219.00, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_53', name: 'Worcester 8000 Style 30kW Combi Boiler', power: 30000, category: 'Heating', subcategory: 'Boilers', brand: 'Worcester', runningCostPerYear: 1314.00, energyRating: 'A+', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_54', name: 'Daikin Altherma 7kW Heat Pump', power: 7000, category: 'Heating', subcategory: 'Heat Pumps', brand: 'Daikin', runningCostPerYear: 306.60, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_55', name: 'Baxi 800 18kW Combi Boiler', power: 18000, category: 'Heating', subcategory: 'Boilers', brand: 'Baxi', runningCostPerYear: 788.40, energyRating: 'A+', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_56', name: 'Ideal Logic Plus 25kW Combi Boiler', power: 25000, category: 'Heating', subcategory: 'Boilers', brand: 'Ideal', runningCostPerYear: 1095.00, energyRating: 'A+', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_57', name: 'Glow-worm Energy 20kW Combi Boiler', power: 20000, category: 'Heating', subcategory: 'Boilers', brand: 'Glow-worm', runningCostPerYear: 876.00, energyRating: 'A+', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_58', name: 'Fujitsu Airstage 3kW Heat Pump', power: 3000, category: 'Heating', subcategory: 'Heat Pumps', brand: 'Fujitsu', runningCostPerYear: 131.40, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_59', name: 'Panasonic Aquarea 4kW Heat Pump', power: 4000, category: 'Heating', subcategory: 'Heat Pumps', brand: 'Panasonic', runningCostPerYear: 175.20, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_60', name: 'Viessmann Vitodens 22kW Combi Boiler', power: 22000, category: 'Heating', subcategory: 'Boilers', brand: 'Viessmann', runningCostPerYear: 963.60, energyRating: 'A+', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_61', name: 'LG Therma V 6kW Heat Pump', power: 6000, category: 'Heating', subcategory: 'Heat Pumps', brand: 'LG', runningCostPerYear: 262.80, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'heat_62', name: 'Samsung EHS Split 8kW Heat Pump', power: 8000, category: 'Heating', subcategory: 'Heat Pumps', brand: 'Samsung', runningCostPerYear: 350.40, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 }
];

// Safe function to add these products
function addHeatingProducts() {
    console.log('🔄 Adding heating products to database...');
    
    if (typeof PRODUCT_DATABASE_BACKUP !== 'undefined') {
        // Add to the backup database
        PRODUCT_DATABASE_BACKUP.sampleProducts.push(...ADDITIONAL_HEATING_PRODUCTS);
        console.log('✅ Added', ADDITIONAL_HEATING_PRODUCTS.length, 'heating products');
        console.log('📊 Total products now:', PRODUCT_DATABASE_BACKUP.getProductCount());
    } else {
        console.error('❌ Database not found');
    }
}

// Export for safe use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ADDITIONAL_HEATING_PRODUCTS, addHeatingProducts };
} else {
    window.ADDITIONAL_HEATING_PRODUCTS = ADDITIONAL_HEATING_PRODUCTS;
    window.addHeatingProducts = addHeatingProducts;
}


