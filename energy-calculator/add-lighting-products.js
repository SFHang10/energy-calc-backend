// ADDITIONAL LIGHTING PRODUCTS - BATCH 4
// This adds 15 more lighting products to expand the database safely

const ADDITIONAL_LIGHTING_PRODUCTS = [
    { id: 'light_51', name: 'Philips Hue White A19 LED Bulb 9W', power: 9, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'Philips', runningCostPerYear: 3.94, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_52', name: 'Osram LED Star Classic A60 8W', power: 8, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'Osram', runningCostPerYear: 3.50, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_53', name: 'GE Lighting LED A19 10W', power: 10, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'GE', runningCostPerYear: 4.38, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_54', name: 'Cree LED A19 7W', power: 7, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'Cree', runningCostPerYear: 3.07, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_55', name: 'Sylvania LED A19 6W', power: 6, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'Sylvania', runningCostPerYear: 2.63, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_56', name: 'Feit Electric LED A19 5W', power: 5, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'Feit Electric', runningCostPerYear: 2.19, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_57', name: 'MaxLite LED A19 8W', power: 8, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'MaxLite', runningCostPerYear: 3.50, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_58', name: 'Lithonia LED A19 9W', power: 9, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'Lithonia', runningCostPerYear: 3.94, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_59', name: 'Cooper Lighting LED A19 7W', power: 7, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'Cooper Lighting', runningCostPerYear: 3.07, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_60', name: 'Hubbell LED A19 6W', power: 6, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'Hubbell', runningCostPerYear: 2.63, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_61', name: 'Philips LED Tube 18W T8', power: 18, category: 'Lighting', subcategory: 'LED Tubes', brand: 'Philips', runningCostPerYear: 7.88, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_62', name: 'Osram LED Tube 20W T8', power: 20, category: 'Lighting', subcategory: 'LED Tubes', brand: 'Osram', runningCostPerYear: 8.76, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_63', name: 'Sylvania LED Tube 15W T8', power: 15, category: 'Lighting', subcategory: 'LED Tubes', brand: 'Sylvania', runningCostPerYear: 6.57, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_64', name: 'GE LED Tube 16W T8', power: 16, category: 'Lighting', subcategory: 'LED Tubes', brand: 'GE', runningCostPerYear: 7.01, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 },
    { id: 'light_65', name: 'Cree LED Tube 17W T8', power: 17, category: 'Lighting', subcategory: 'LED Tubes', brand: 'Cree', runningCostPerYear: 7.45, energyRating: 'A+++', efficiency: 'High', source: 'Expansion', waterUsage: 0.0 }
];

// Safe function to add these products
function addLightingProducts() {
    console.log('🔄 Adding lighting products to database...');
    
    if (typeof PRODUCT_DATABASE_BACKUP !== 'undefined') {
        // Add to the backup database
        PRODUCT_DATABASE_BACKUP.sampleProducts.push(...ADDITIONAL_LIGHTING_PRODUCTS);
        console.log('✅ Added', ADDITIONAL_LIGHTING_PRODUCTS.length, 'lighting products');
        console.log('📊 Total products now:', PRODUCT_DATABASE_BACKUP.getProductCount());
    } else {
        console.error('❌ Database not found');
    }
}

// Export for safe use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ADDITIONAL_LIGHTING_PRODUCTS, addLightingProducts };
} else {
    window.ADDITIONAL_LIGHTING_PRODUCTS = ADDITIONAL_LIGHTING_PRODUCTS;
    window.addLightingProducts = addLightingProducts;
}


