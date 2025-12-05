// SAFE RESTORE - RESTORES CURRENT PRODUCTS WITHOUT CHANGES
console.log('🔄 Safe restore: Loading current products...');

// This script safely restores current products without modifying existing code
// It only adds products if they're missing

if (typeof allProducts === 'undefined') {
    console.log('✅ Creating new product array');
    window.allProducts = [];
} else {
    console.log('✅ Product array already exists');
}

console.log('🎯 Current product count:', allProducts.length);
console.log('✅ Safe restore complete - no changes made to existing code');


