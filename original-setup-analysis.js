// Based on the API response we got earlier, here's what the original setup was doing:

const originalHardcodedProducts = [
    {
        id: '1',
        name: 'Energy Efficient Fridge',
        power: 150,
        category: 'Appliances',
        brand: 'EcoBrand',
        runningCostPerYear: 45.5,
        energyRating: 'A+++',
        efficiency: 'high'
    },
    {
        id: '2',
        name: 'LED TV 55"',
        power: 80,
        category: 'Electronics',
        brand: 'GreenTech',
        runningCostPerYear: 24.3,
        energyRating: 'A',
        efficiency: 'high'
    },
    {
        id: '3',
        name: 'Solar Panel System',
        power: 0,
        category: 'Renewable',
        brand: 'SunPower',
        runningCostPerYear: -120,
        energyRating: 'A+++',
        efficiency: 'renewable'
    },
    {
        id: '4',
        name: 'Smart Thermostat',
        power: 5,
        category: 'Smart Home',
        brand: 'EcoControl',
        runningCostPerYear: 1.5,
        energyRating: 'A+',
        efficiency: 'high'
    },
    {
        id: '5',
        name: 'Standard Fridge',
        power: 300,
        category: 'Appliances',
        brand: 'StandardBrand',
        runningCostPerYear: 91,
        energyRating: 'C',
        efficiency: 'low'
    },
    {
        id: '6',
        name: 'Traditional TV 55"',
        power: 150,
        category: 'Electronics',
        brand: 'StandardTech',
        runningCostPerYear: 45.6,
        energyRating: 'D',
        efficiency: 'low'
    },
    {
        id: '7',
        name: 'Old Washing Machine',
        power: 500,
        category: 'Appliances',
        brand: 'OldBrand',
        runningCostPerYear: 151.67,
        energyRating: 'E',
        efficiency: 'low'
    },
    {
        id: '8',
        name: 'Energy Efficient Washing Machine',
        power: 200,
        category: 'Appliances',
        brand: 'EcoWash',
        runningCostPerYear: 60.67,
        energyRating: 'A++',
        efficiency: 'high'
    },
    {
        id: '9',
        name: 'Desktop Computer',
        power: 250,
        category: 'Electronics',
        brand: 'TechCorp',
        runningCostPerYear: 75.83,
        energyRating: 'C',
        efficiency: 'medium'
    },
    {
        id: '10',
        name: 'Laptop Computer',
        power: 45,
        category: 'Electronics',
        brand: 'PortableTech',
        runningCostPerYear: 13.65,
        energyRating: 'A',
        efficiency: 'high'
    }
];

console.log('📋 Original Setup Analysis:');
console.log('========================');
console.log('');
console.log('🔍 What the shop was doing LAST WEEK:');
console.log('');
console.log('1. **Hardcoded Products**: The calculator-wix route was serving exactly 10 hardcoded products');
console.log('2. **Product Types**: Mix of residential appliances and electronics');
console.log('3. **Categories**: Appliances, Electronics, Renewable, Smart Home');
console.log('4. **Data Source**: No database - just hardcoded JSON array');
console.log('5. **Purpose**: Simple demo/fallback data for the shop calculator');
console.log('');
console.log('📊 Product Breakdown:');
console.log('- Appliances: 4 products (fridges, washing machines)');
console.log('- Electronics: 4 products (TVs, computers)');
console.log('- Renewable: 1 product (solar panels)');
console.log('- Smart Home: 1 product (thermostat)');
console.log('');
console.log('🎯 The Issue:');
console.log('The server is STILL serving this old hardcoded data instead of our new database integration.');
console.log('This means either:');
console.log('1. Server hasn\'t restarted properly');
console.log('2. There\'s a syntax error preventing the new route from loading');
console.log('3. Server is using a cached/old version of the route file');
console.log('');
console.log('💡 Solution:');
console.log('We need to either:');
console.log('1. Force restart the server');
console.log('2. Fix any syntax errors in the route');
console.log('3. Or temporarily restore the original simple hardcoded setup');

module.exports = originalHardcodedProducts;



