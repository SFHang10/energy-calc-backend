// Wix Integration Helper Script
// This script helps integrate the dynamic product page with Wix

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class WixIntegrationHelper {
    constructor() {
        this.dbPath = path.resolve(__dirname, 'database', 'energy_calculator.db');
        this.outputDir = path.resolve(__dirname, 'wix-integration');
    }

    // Create output directory
    createOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
            console.log('✅ Created output directory:', this.outputDir);
        }
    }

    // Export products for Wix import
    async exportProductsForWix() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY);
            
            const query = `
                SELECT 
                    id,
                    name,
                    power,
                    brand,
                    category,
                    subcategory,
                    energy_rating,
                    efficiency,
                    model_number,
                    image_url
                FROM products 
                WHERE name IS NOT NULL 
                AND power IS NOT NULL 
                LIMIT 100
            `;

            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Transform data for Wix
                const wixProducts = rows.map(product => ({
                    id: product.id,
                    name: product.name,
                    sku: `ETL-${product.id.toUpperCase()}`,
                    price: this.generatePrice(product),
                    category: product.category || 'Energy Products',
                    brand: product.brand || 'Unknown',
                    powerRating: `${product.power}W`,
                    modelNumber: product.model_number || product.id,
                    energyRating: product.energy_rating || 'A',
                    efficiency: product.efficiency || 'High',
                    descriptionShort: this.generateShortDescription(product),
                    descriptionFull: this.generateFullDescription(product),
                    additionalInfo: this.generateAdditionalInfo(product),
                    imageUrl: product.image_url || `https://via.placeholder.com/600x400/2d7a5f/ffffff?text=${encodeURIComponent(product.name)}`
                }));

                // Save to JSON
                const jsonPath = path.join(this.outputDir, 'wix-products.json');
                fs.writeFileSync(jsonPath, JSON.stringify(wixProducts, null, 2));

                // Save to CSV
                this.saveAsCSV(wixProducts);

                console.log(`✅ Exported ${wixProducts.length} products for Wix integration`);
                console.log(`📁 Files saved to: ${this.outputDir}`);
                
                db.close();
                resolve(wixProducts);
            });
        });
    }

    // Generate realistic pricing
    generatePrice(product) {
        const basePrice = 1000;
        const powerMultiplier = (product.power || 1000) / 1000;
        const brandMultiplier = this.getBrandMultiplier(product.brand);
        return Math.round(basePrice * powerMultiplier * brandMultiplier);
    }

    // Brand pricing multipliers
    getBrandMultiplier(brand) {
        const multipliers = {
            'Baxi': 1.2,
            'Ideal': 1.1,
            'Vaillant': 1.3,
            'Worcester': 1.25,
            'Viessmann': 1.15,
            'Daikin': 1.4,
            'Mitsubishi': 1.35
        };
        return multipliers[brand] || 1.0;
    }

    // Generate short description
    generateShortDescription(product) {
        return `Professional ${product.category || 'Energy Product'} - ${product.brand || 'High-quality'} ${product.name}. Energy-efficient design with ${product.power}W power rating.`;
    }

    // Generate full description
    generateFullDescription(product) {
        return `The ${product.name} is a professional-grade ${product.category || 'energy product'} designed for maximum efficiency and performance. This ${product.brand || 'high-quality'} product delivers exceptional performance while maintaining low operating costs. Features include advanced technology, intelligent controls, and comprehensive safety systems. Perfect for both commercial and residential applications requiring reliable, efficient operation. Energy rating: ${product.energyRating || 'A'}, Efficiency: ${product.efficiency || 'High'}.`;
    }

    // Generate additional info
    generateAdditionalInfo(product) {
        return [
            `Power Rating: ${product.power}W`,
            `Energy Rating: ${product.energyRating || 'A'}`,
            `Efficiency: ${product.efficiency || 'High'}`,
            `Brand: ${product.brand || 'Professional'}`,
            `Category: ${product.category || 'Energy Products'}`,
            `Model: ${product.modelNumber || product.id}`,
            'Professional installation recommended',
            'Comprehensive warranty included'
        ];
    }

    // Save as CSV
    saveAsCSV(products) {
        const csvPath = path.join(this.outputDir, 'wix-products.csv');
        
        // CSV headers
        const headers = [
            'id', 'name', 'sku', 'price', 'category', 'brand', 
            'powerRating', 'modelNumber', 'energyRating', 'efficiency',
            'descriptionShort', 'descriptionFull', 'additionalInfo', 'imageUrl'
        ];

        // Convert to CSV
        let csvContent = headers.join(',') + '\n';
        
        products.forEach(product => {
            const row = headers.map(header => {
                let value = product[header] || '';
                // Escape commas and quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvContent += row.join(',') + '\n';
        });

        fs.writeFileSync(csvPath, csvContent);
        console.log(`📊 CSV file saved: ${csvPath}`);
    }

    // Generate Wix Velo code for custom fields
    generateVeloCode() {
        const veloCode = `
// Wix Velo Code for Dynamic Product Page
// Add this to your Wix site's backend

import wixStores from 'wix-stores';

// Get product with custom fields
export async function getProductWithCustomFields(productId) {
    try {
        const product = await wixStores.getProduct(productId);
        
        // Add custom fields
        const customFields = {
            powerRating: product.customFields?.powerRating || 'Unknown',
            brand: product.customFields?.brand || 'Unknown',
            category: product.customFields?.category || 'Energy Products',
            modelNumber: product.customFields?.modelNumber || product.id,
            energyRating: product.customFields?.energyRating || 'A',
            efficiency: product.customFields?.efficiency || 'High',
            descriptionShort: product.customFields?.descriptionShort || product.description,
            descriptionFull: product.customFields?.descriptionFull || product.description,
            additionalInfo: product.customFields?.additionalInfo || []
        };

        return {
            ...product,
            ...customFields
        };
    } catch (error) {
        console.error('Error getting product:', error);
        throw error;
    }
}

// Update product custom fields
export async function updateProductCustomFields(productId, customFields) {
    try {
        await wixStores.updateProduct(productId, {
            customFields: customFields
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

// Bulk update products with custom fields
export async function bulkUpdateProducts(products) {
    const results = [];
    
    for (const product of products) {
        try {
            await updateProductCustomFields(product.id, {
                powerRating: product.powerRating,
                brand: product.brand,
                category: product.category,
                modelNumber: product.modelNumber,
                energyRating: product.energyRating,
                efficiency: product.efficiency,
                descriptionShort: product.descriptionShort,
                descriptionFull: product.descriptionFull,
                additionalInfo: product.additionalInfo
            });
            results.push({ id: product.id, status: 'success' });
        } catch (error) {
            results.push({ id: product.id, status: 'error', error: error.message });
        }
    }
    
    return results;
}
`;

        const veloPath = path.join(this.outputDir, 'wix-velo-code.js');
        fs.writeFileSync(veloPath, veloCode);
        console.log(`💻 Velo code saved: ${veloPath}`);
    }

    // Generate HTML for Wix integration
    generateWixHTML() {
        const htmlCode = `
<!-- Wix Dynamic Product Page HTML -->
<!-- Add this HTML element to your Wix dynamic page -->

<div id="dynamic-product-container">
    <iframe 
        id="product-page-iframe"
        src="http://localhost:4000/dynamic-product-page.html?product={{wixStores.currentProduct.id}}"
        width="100%" 
        height="1200" 
        frameborder="0"
        style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    </iframe>
</div>

<script>
// Auto-resize iframe based on content
window.addEventListener('message', function(event) {
    if (event.data.type === 'resize') {
        document.getElementById('product-page-iframe').style.height = event.data.height + 'px';
    }
});
</script>
`;

        const htmlPath = path.join(this.outputDir, 'wix-integration.html');
        fs.writeFileSync(htmlPath, htmlCode);
        console.log(`🌐 HTML integration code saved: ${htmlPath}`);
    }

    // Main execution
    async run() {
        try {
            console.log('🚀 Starting Wix Integration Helper...');
            
            this.createOutputDir();
            await this.exportProductsForWix();
            this.generateVeloCode();
            this.generateWixHTML();
            
            console.log('\n✅ Wix Integration Helper completed successfully!');
            console.log('\n📋 Next Steps:');
            console.log('1. Import wix-products.csv into your Wix product collection');
            console.log('2. Add custom fields to your product collection');
            console.log('3. Use the Velo code to manage custom fields');
            console.log('4. Add the HTML integration code to your dynamic page');
            console.log('5. Test the dynamic product page');
            
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
}

// Run the integration helper
const helper = new WixIntegrationHelper();
helper.run();
