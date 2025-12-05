// ETL Product Sync System
// Syncs ETL products with affiliate programs and marketplace

const ETLAffiliateManager = require('./affiliate-manager');
const sqlite3 = require('sqlite3').verbose();

class ETLProductSync {
    constructor() {
        this.affiliateManager = new ETLAffiliateManager();
        this.db = new sqlite3.Database('./energy_calculator.db');
    }

    // Sync ETL products with affiliate programs
    async syncETLProductsWithAffiliates() {
        try {
            console.log('🔄 Starting ETL product sync with affiliate programs...');
            
            // Get all ETL products from database
            const products = await this.getETLProducts();
            console.log(`📦 Found ${products.length} ETL products`);

            // Process each product
            for (const product of products) {
                await this.processProductForAffiliate(product);
            }

            console.log('✅ ETL product sync completed');
        } catch (error) {
            console.error('❌ Error syncing ETL products:', error);
        }
    }

    // Get ETL products from database
    async getETLProducts() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    id,
                    name,
                    manufacturer,
                    etl_id,
                    price,
                    image_url,
                    description,
                    category
                FROM etl_products 
                WHERE etl_certified = 1
                ORDER BY manufacturer, name
            `;

            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Process individual product for affiliate program
    async processProductForAffiliate(product) {
        try {
            // Determine manufacturer from product name/manufacturer field
            const manufacturer = this.determineManufacturer(product);
            
            if (!manufacturer) {
                console.log(`⚠️ Could not determine manufacturer for: ${product.name}`);
                return;
            }

            // Generate affiliate link
            const affiliateLink = this.affiliateManager.generateAffiliateLink(
                product.id,
                manufacturer
            );

            if (!affiliateLink) {
                console.log(`⚠️ Could not generate affiliate link for: ${product.name}`);
                return;
            }

            // Update product with affiliate information
            await this.updateProductWithAffiliateInfo(product.id, {
                manufacturer: manufacturer,
                affiliate_link: affiliateLink,
                commission_rate: this.affiliateManager.affiliateConfig.affiliate_programs[manufacturer]?.commission_rate || 0.05,
                last_synced: new Date().toISOString()
            });

            console.log(`✅ Processed: ${product.name} (${manufacturer})`);

        } catch (error) {
            console.error(`❌ Error processing product ${product.name}:`, error);
        }
    }

    // Determine manufacturer from product information
    determineManufacturer(product) {
        const name = product.name.toLowerCase();
        const manufacturer = product.manufacturer?.toLowerCase();

        // Check manufacturer field first
        if (manufacturer) {
            if (manufacturer.includes('bosch')) return 'bosch';
            if (manufacturer.includes('siemens')) return 'siemens';
            if (manufacturer.includes('hobart')) return 'hobart';
            if (manufacturer.includes('adande')) return 'adande';
        }

        // Check product name for manufacturer indicators
        if (name.includes('bosch')) return 'bosch';
        if (name.includes('siemens')) return 'siemens';
        if (name.includes('hobart')) return 'hobart';
        if (name.includes('adande')) return 'adande';
        if (name.includes('whirlpool')) return 'whirlpool';
        if (name.includes('lg')) return 'lg';
        if (name.includes('samsung')) return 'samsung';

        return null;
    }

    // Update product with affiliate information
    async updateProductWithAffiliateInfo(productId, affiliateInfo) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE etl_products 
                SET 
                    manufacturer = ?,
                    affiliate_link = ?,
                    commission_rate = ?,
                    last_synced = ?
                WHERE id = ?
            `;

            this.db.run(query, [
                affiliateInfo.manufacturer,
                affiliateInfo.affiliate_link,
                affiliateInfo.commission_rate,
                affiliateInfo.last_synced,
                productId
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    // Generate marketplace product data
    generateMarketplaceData() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    id,
                    name,
                    manufacturer,
                    etl_id,
                    price,
                    image_url,
                    description,
                    category,
                    affiliate_link,
                    commission_rate
                FROM etl_products 
                WHERE etl_certified = 1 
                AND affiliate_link IS NOT NULL
                ORDER BY manufacturer, name
            `;

            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const marketplaceData = {
                        products: rows,
                        total_products: rows.length,
                        manufacturers: [...new Set(rows.map(p => p.manufacturer))],
                        total_commission_potential: rows.reduce((sum, p) => sum + (p.price * p.commission_rate), 0),
                        last_updated: new Date().toISOString()
                    };
                    resolve(marketplaceData);
                }
            });
        });
    }

    // Export marketplace data to JSON
    async exportMarketplaceData() {
        try {
            const data = await this.generateMarketplaceData();
            const fs = require('fs');
            const path = require('path');
            
            const filePath = path.join(__dirname, 'marketplace-products.json');
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            
            console.log(`📄 Marketplace data exported to: ${filePath}`);
            console.log(`📊 Total products: ${data.total_products}`);
            console.log(`🏭 Manufacturers: ${data.manufacturers.join(', ')}`);
            console.log(`💰 Commission potential: £${data.total_commission_potential.toFixed(2)}`);
            
            return filePath;
        } catch (error) {
            console.error('❌ Error exporting marketplace data:', error);
        }
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

// Export for use in other modules
module.exports = ETLProductSync;

// Example usage:
/*
const productSync = new ETLProductSync();

// Sync all ETL products with affiliate programs
productSync.syncETLProductsWithAffiliates()
    .then(() => {
        console.log('Sync completed');
        return productSync.exportMarketplaceData();
    })
    .then(() => {
        productSync.close();
    })
    .catch(error => {
        console.error('Error:', error);
        productSync.close();
    });
*/










