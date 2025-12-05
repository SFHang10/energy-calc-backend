const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const ETL_API_KEY = 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Fetching ALL ETL Products Using Proper API...\n');

async function fetchAllProducts() {
    try {
        let allProducts = [];
        let page = 0;
        let hasMorePages = true;
        
        console.log('📡 Fetching products page by page...');
        
        while (hasMorePages) {
            console.log(`   Fetching page ${page}...`);
            
            const response = await axios.get(`${ETL_BASE_URL}/products`, {
                headers: { 'x-api-key': ETL_API_KEY },
                params: {
                    page: page,
                    size: 200, // Maximum page size
                    listingStatus: 'current' // Only current products
                }
            });
            
            const products = response.data.products;
            console.log(`   ✅ Found ${products.length} products on page ${page}`);
            
            allProducts = allProducts.concat(products);
            
            // Check if there are more pages
            const totalPages = response.data.page.totalPages;
            hasMorePages = page < totalPages - 1;
            page++;
            
            // Add a small delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`\n🎯 Total products fetched: ${allProducts.length}`);
        
        // Analyze the products
        console.log('\n📊 Product Analysis:');
        console.log('='.repeat(50));
        
        // Get unique manufacturers
        const manufacturers = [...new Set(allProducts.map(p => p.manufacturer.name))];
        console.log(`📋 Manufacturers: ${manufacturers.length}`);
        manufacturers.slice(0, 10).forEach((man, index) => {
            const count = allProducts.filter(p => p.manufacturer.name === man).length;
            console.log(`   ${index + 1}. ${man} (${count} products)`);
        });
        
        // Get unique technologies
        const technologies = [...new Set(allProducts.map(p => p.technologyId))];
        console.log(`\n🔧 Technology Categories: ${technologies.length}`);
        
        // Get products with images
        const productsWithImages = allProducts.filter(p => p.images && p.images.length > 0);
        console.log(`\n🖼️  Products with images: ${productsWithImages.length} (${Math.round(productsWithImages.length/allProducts.length*100)}%)`);
        
        // Check for shower products specifically
        const showerProducts = allProducts.filter(p => 
            p.name.toLowerCase().includes('shower') || 
            p.manufacturer.name.toLowerCase().includes('shower')
        );
        console.log(`\n🚿 Shower-related products: ${showerProducts.length}`);
        if (showerProducts.length > 0) {
            console.log('   Sample shower products:');
            showerProducts.slice(0, 5).forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name} - ${product.manufacturer.name}`);
            });
        }
        
        return allProducts;
        
    } catch (error) {
        console.error('❌ Error fetching products:', error.message);
        throw error;
    }
}

// Run the fetch
fetchAllProducts()
    .then(products => {
        console.log('\n✅ Product fetch completed successfully!');
        console.log(`📊 Total products: ${products.length}`);
        db.close();
    })
    .catch(error => {
        console.error('❌ Failed to fetch products:', error);
        db.close();
    });






