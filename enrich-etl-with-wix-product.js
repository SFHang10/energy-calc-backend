/**
 * Script to enrich ETL database product with manually added Wix product data
 * This merges all information from Wix (images, descriptions, specs, etc.) into the ETL product
 * 
 * Usage: node enrich-etl-with-wix-product.js
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';

// Wix Product Information (manually added product)
const WIX_PRODUCT_ID = '0d89cc2e-0402-6577-cf38-af9690ca11ad';
const WIX_PRODUCT_SLUG = 'electrolux-professional-skyline-10-gn1-1-electric-3-glass-mode-ecoe101b2a1';

// ETL Product ID to enrich (best match from database)
const ETL_PRODUCT_ID = 'etl_22_86258'; // Electrolux Professional Skyline 10 GN1/1 Electric 3-glass

// Wix Product Data (extracted from the Wix page)
const WIX_PRODUCT_DATA = {
    name: 'Electrolux Professional Skyline 10 GN1/1 Electric 3-glass Model ECOE101B2A1',
    modelNumber: 'ECOE101B2A1',
    price: 14419.00,
    currency: 'EUR',
    description: {
        short: 'Professional commercial oven with advanced cooking features',
        full: [
            'Capacity: 10 GN 1/1 trays.',
            'Digital interface with LED backlight buttons with guided selection.',
            'Boilerless steaming function to add and retain moisture for high quality, consistent cooking results.',
            'Dry hot convection cycle (max 300 °C) ideal for low humidity cooking. Automatic moistener (11 settings) for boiler-less steam generation.',
            'EcoDelta cooking: cooking with food probe maintaining preset temperature difference between the core of the food and the cooking chamber.',
            'Programs mode: a maximum of 100 recipes can be stored in the oven\'s memory, to recreate the exact same recipe at any time. 4-step cooking programs also available.',
            'OptiFlow air distribution system to achieve maximum performance in chilling/heating eveness and temperature control thanks to a special design of the chamber.',
            'Fan with 5 speed levels from 300 to 1500 RPM and reverse rotation for optimal evenness. Fan stops in less than 5 seconds when door is opened.',
            'Single sensor core temperature probe included.',
            'Automatic fast cool down and pre-heat function.',
            'SkyClean: Automatic and built-in self cleaning system. 5 automatic cycles (soft, medium, strong, extra strong, rinse-only).'
        ].join(' ')
    },
    additionalInfo: [
        'Different chemical options available: solid (phosphate-free), liquid (requires optional accessory).',
        'GreaseOut: predisposed for integrated grease drain and collection for safer operation (dedicated base as optional accessory).',
        'Back-up mode with self-diagnosis is automatically activated if a failure occurs to avoid downtime.',
        'Double thermo-glazed door with open frame construction, for cool outside door panel. Swing hinged easy-release inner glass on door for easy cleaning.',
        'Hygienic internal chamber with all rounded corners for easy cleaning.',
        '304 AISI stainless steel construction throughout.',
        'Front access to control board for easy service.',
        'IPX 5 spray water protection certification for easy cleaning.',
        'Supplied with n.1 tray rack 1/1 GN, 67 mm pitch.'
    ],
    images: [
        'https://static.wixstatic.com/media/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg/v1/fill/w_1000,h_1000,al_c,q_85/c123de_4b135c78cc6b4ce8b49574e57d3f5082~mv2.jpg'
    ],
    specifications: {
        'Capacity': '10 GN 1/1 trays',
        'Max Temperature': '300 °C',
        'Fan Speeds': '5 levels (300-1500 RPM)',
        'Cleaning System': 'SkyClean - 5 automatic cycles',
        'Door Type': 'Double thermo-glazed door',
        'Construction': '304 AISI stainless steel',
        'Protection Rating': 'IPX 5 spray water protection',
        'Recipe Storage': 'Up to 100 recipes',
        'Temperature Probe': 'Single sensor core temperature probe included',
        'Steaming Function': 'Boilerless steaming with 11 settings',
        'Air Distribution': 'OptiFlow system',
        'Cool Down': 'Automatic fast cool down',
        'Pre-heat': 'Automatic pre-heat function'
    },
    features: [
        'Digital interface with LED backlight',
        'Boilerless steaming function',
        'EcoDelta cooking with food probe',
        'Programs mode (100 recipes)',
        'OptiFlow air distribution',
        'Variable speed fan (300-1500 RPM)',
        'SkyClean automatic cleaning',
        'Self-diagnosis back-up mode',
        'GreaseOut system (optional)',
        'Cool outside door panel'
    ]
};

// Load the database
let database;
try {
    const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
    database = JSON.parse(databaseContent);
    console.log(`✅ Loaded database with ${database.products?.length || 0} products`);
} catch (error) {
    console.error('❌ Error loading database:', error.message);
    process.exit(1);
}

/**
 * Merge Wix product data into ETL product
 * Never deletes existing data - only enriches/adds
 */
function enrichETLProductWithWixData(etlProduct, wixData) {
    console.log(`\n🔄 Enriching ETL product: ${etlProduct.id}`);
    console.log(`   Current name: ${etlProduct.name}`);
    
    const enriched = { ...etlProduct };
    let changes = [];
    
    // 1. Update name if Wix has more detailed name (but keep original if it's more descriptive)
    if (wixData.name && wixData.name.length > (etlProduct.name || '').length) {
        enriched.name = wixData.name;
        changes.push('Updated name with full model number');
    }
    
    // 2. Add/update model number
    if (wixData.modelNumber && !etlProduct.modelNumber) {
        enriched.modelNumber = wixData.modelNumber;
        changes.push(`Added model number: ${wixData.modelNumber}`);
    } else if (wixData.modelNumber && etlProduct.modelNumber !== wixData.modelNumber) {
        // Keep both if different
        enriched.modelNumber = `${etlProduct.modelNumber || ''} / ${wixData.modelNumber}`.trim();
        changes.push(`Updated model number: ${wixData.modelNumber}`);
    }
    
    // 3. Enrich description
    if (wixData.description) {
        // Merge short description
        if (wixData.description.short && !etlProduct.descriptionShort) {
            enriched.descriptionShort = wixData.description.short;
            changes.push('Added short description from Wix');
        } else if (wixData.description.short && etlProduct.descriptionShort) {
            // Combine if both exist
            enriched.descriptionShort = `${etlProduct.descriptionShort}\n\n${wixData.description.short}`;
            changes.push('Merged short descriptions');
        }
        
        // Merge full description
        if (wixData.description.full && !etlProduct.descriptionFull) {
            enriched.descriptionFull = wixData.description.full;
            changes.push('Added full description from Wix');
        } else if (wixData.description.full && etlProduct.descriptionFull) {
            // Combine if both exist (Wix description is usually more detailed)
            enriched.descriptionFull = `${etlProduct.descriptionFull}\n\n---\n\n${wixData.description.full}`;
            changes.push('Merged full descriptions');
        }
    }
    
    // 4. Add/merge images
    if (wixData.images && wixData.images.length > 0) {
        let existingImages = [];
        if (etlProduct.images) {
            try {
                const parsed = JSON.parse(etlProduct.images);
                existingImages = Array.isArray(parsed) ? parsed : [etlProduct.images];
            } catch (e) {
                existingImages = typeof etlProduct.images === 'string' ? [etlProduct.images] : [];
            }
        }
        
        // Add Wix images (avoid duplicates)
        const allImages = [...existingImages];
        wixData.images.forEach(imgUrl => {
            if (!allImages.includes(imgUrl)) {
                allImages.push(imgUrl);
            }
        });
        
        if (allImages.length > existingImages.length) {
            enriched.images = JSON.stringify(allImages);
            enriched.imageUrl = allImages[0]; // Set main image URL
            changes.push(`Added ${allImages.length - existingImages.length} image(s) from Wix`);
        }
    }
    
    // 5. Merge specifications
    if (wixData.specifications) {
        let existingSpecs = {};
        if (etlProduct.specifications) {
            try {
                existingSpecs = typeof etlProduct.specifications === 'string' 
                    ? JSON.parse(etlProduct.specifications) 
                    : etlProduct.specifications;
            } catch (e) {
                existingSpecs = {};
            }
        }
        
        // Merge Wix specs (don't overwrite existing, but add new ones)
        const mergedSpecs = { ...existingSpecs };
        Object.keys(wixData.specifications).forEach(key => {
            if (!mergedSpecs[key]) {
                mergedSpecs[key] = wixData.specifications[key];
            } else {
                // If both exist, combine them
                mergedSpecs[key] = `${mergedSpecs[key]} / ${wixData.specifications[key]}`;
            }
        });
        
        enriched.specifications = JSON.stringify(mergedSpecs);
        changes.push(`Merged ${Object.keys(wixData.specifications).length} specification(s)`);
    }
    
    // 6. Add additional information
    if (wixData.additionalInfo && wixData.additionalInfo.length > 0) {
        let existingAdditionalInfo = '';
        if (etlProduct.additionalInfo) {
            existingAdditionalInfo = typeof etlProduct.additionalInfo === 'string' 
                ? etlProduct.additionalInfo 
                : JSON.stringify(etlProduct.additionalInfo);
        }
        
        const combinedInfo = existingAdditionalInfo 
            ? `${existingAdditionalInfo}\n\n${wixData.additionalInfo.join('\n\n')}`
            : wixData.additionalInfo.join('\n\n');
        
        enriched.additionalInfo = combinedInfo;
        changes.push(`Added ${wixData.additionalInfo.length} additional information item(s)`);
    }
    
    // 7. Add features
    if (wixData.features && wixData.features.length > 0) {
        let existingFeatures = [];
        if (etlProduct.features) {
            try {
                existingFeatures = typeof etlProduct.features === 'string' 
                    ? JSON.parse(etlProduct.features) 
                    : (Array.isArray(etlProduct.features) ? etlProduct.features : []);
            } catch (e) {
                existingFeatures = [];
            }
        }
        
        // Merge features (avoid duplicates)
        const allFeatures = [...existingFeatures];
        wixData.features.forEach(feature => {
            if (!allFeatures.includes(feature)) {
                allFeatures.push(feature);
            }
        });
        
        enriched.features = JSON.stringify(allFeatures);
        changes.push(`Added ${allFeatures.length - existingFeatures.length} feature(s) from Wix`);
    }
    
    // 8. Add price if available (but don't overwrite if ETL has price)
    if (wixData.price && !etlProduct.price) {
        enriched.price = wixData.price;
        changes.push(`Added price: €${wixData.price.toLocaleString()}`);
    }
    
    // 9. Add Wix product reference
    enriched.wixId = WIX_PRODUCT_ID;
    enriched.wixProductUrl = `/product-page/${WIX_PRODUCT_SLUG}`;
    enriched.wixProductSlug = WIX_PRODUCT_SLUG;
    changes.push('Added Wix product reference');
    
    // 10. Add metadata
    enriched.lastEnrichedFromWix = new Date().toISOString();
    enriched.enrichmentSource = 'Wix Manual Product';
    
    console.log(`\n✅ Enrichment complete! Changes made:`);
    changes.forEach(change => console.log(`   - ${change}`));
    
    return enriched;
}

// Main function
function enrichProduct() {
    console.log('\n📦 Starting product enrichment process...');
    console.log(`   Wix Product ID: ${WIX_PRODUCT_ID}`);
    console.log(`   ETL Product ID: ${ETL_PRODUCT_ID}`);
    
    // Find the ETL product
    const etlProductIndex = database.products.findIndex(p => p.id === ETL_PRODUCT_ID);
    
    if (etlProductIndex === -1) {
        console.error(`❌ ETL product ${ETL_PRODUCT_ID} not found in database!`);
        process.exit(1);
    }
    
    const etlProduct = database.products[etlProductIndex];
    console.log(`\n✅ Found ETL product: ${etlProduct.name}`);
    
    // Enrich the product
    const enrichedProduct = enrichETLProductWithWixData(etlProduct, WIX_PRODUCT_DATA);
    
    // Update the database
    database.products[etlProductIndex] = enrichedProduct;
    
    // Create backup
    const backupPath = FULL_DATABASE_PATH.replace('.json', `_backup_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
    console.log(`\n💾 Created backup: ${path.basename(backupPath)}`);
    
    // Save enriched database
    fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(database, null, 2));
    console.log(`\n✅ Database updated successfully!`);
    console.log(`   Total products: ${database.products.length}`);
    console.log(`   Enriched product: ${enrichedProduct.id} - ${enrichedProduct.name}`);
    
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Test the enriched product in iframe: product-page-v2-marketplace-test.html?product=${ETL_PRODUCT_ID}`);
    console.log(`   2. Verify all images and information appear correctly`);
    console.log(`   3. Once verified, you can remove the manual Wix product`);
}

// Run the script
if (require.main === module) {
    enrichProduct();
}

module.exports = {
    enrichETLProductWithWixData,
    WIX_PRODUCT_DATA,
    ETL_PRODUCT_ID,
    WIX_PRODUCT_ID
};






