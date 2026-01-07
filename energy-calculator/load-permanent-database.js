// LOAD PERMANENT DATABASE - SAFE AND TINY
console.log('🔄 Loading permanent database...');

// Check if database exists
if (typeof PRODUCT_DATABASE_BACKUP !== 'undefined') {
    console.log('✅ Database found:', PRODUCT_DATABASE_BACKUP.getProductCount(), 'products');
    
    // Safely load products
    if (typeof allProducts === 'undefined') {
        window.allProducts = PRODUCT_DATABASE_BACKUP.getAllProducts();
        console.log('✅ Created product array with', allProducts.length, 'products');
    } else {
        console.log('✅ Product array already exists with', allProducts.length, 'products');
    }
    
    console.log('🎉 Database loaded successfully!');
} else {
    console.error('❌ Database not found - check file inclusion');
}


