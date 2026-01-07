const db = require('./product-database-backup.js');

console.log('🔍 Checking Energy Cal 2 Database...\n');

let totalProducts = 0;
Object.keys(db.PRODUCT_DATABASE_BACKUP).forEach(category => {
    const count = db.PRODUCT_DATABASE_BACKUP[category].length;
    totalProducts += count;
    console.log(`${category}: ${count} products`);
});

console.log(`\n📊 Total products in Energy Cal 2 database: ${totalProducts}`);

// Test the getAllProducts function
const allProducts = db.PRODUCT_DATABASE_BACKUP.getAllProducts();
console.log(`✅ getAllProducts() returns: ${allProducts.length} products`);

// Show sample products
console.log('\n📋 Sample products:');
allProducts.slice(0, 5).forEach(product => {
    console.log(`   ${product.id}: ${product.name} (${product.category})`);
});















