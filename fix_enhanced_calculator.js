const fs = require('fs');
const path = require('path');

// Read the Enhanced Calculator file
const filePath = path.join(__dirname, 'Energy Cal 2', 'energy-calculator-enhanced-test2.html');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the initializeCalculator function
const oldFunction = `        function initializeCalculator() {
            // Load all product sources
            loadEnhancedSampleData();
            loadBackendProducts();
            loadRealProducts();
            loadEnergyStarProducts();
            setupEventListeners();
        }`;

const newFunction = `        function initializeCalculator() {
            // Load embedded data first (5,554 products with grants and collection agencies)
            console.log('🚀 Loading embedded database with full product data...');
            loadFullETLDatabase();
            loadEnhancedDatabaseProducts();
            
            // Load sample data as fallback
            loadEnhancedSampleData();
            
            // Setup event listeners
            setupEventListeners();
            
            console.log('✅ Enhanced Calculator initialized with embedded data');
        }`;

// Replace the function
content = content.replace(oldFunction, newFunction);

// Write the updated content back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Enhanced Calculator fixed!');
console.log('📁 Updated file: Energy Cal 2/energy-calculator-enhanced-test2.html');
console.log('🔄 The calculator will now load embedded data instead of failing API calls');

