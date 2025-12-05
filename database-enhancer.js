/**
 * COMPREHENSIVE DATABASE ENHANCEMENT SYSTEM
 * 1. Creates proper subcategories for ETL products
 * 2. Adds additional product information from other sources
 * 3. Sets up interface system for calculators
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🚀 COMPREHENSIVE DATABASE ENHANCEMENT SYSTEM\n');

class DatabaseEnhancer {
    constructor() {
        this.centralDbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
        this.enhancedDbPath = path.join(__dirname, 'database', 'energy_calculator_enhanced.db');
        
        // Additional data sources
        this.productMediaData = this.loadJsonFile('product-media-data.json');
        this.wixProductsData = this.loadJsonFile('wix_products_export.json');
        this.commercialProductsData = this.loadJsonFile('commercial-products.json');
        this.appliancesData = this.loadJsonFile('appliances_products.json');
        this.lightingData = this.loadJsonFile('lighting_products.json');
    }

    // Load JSON files safely
    loadJsonFile(filename) {
        try {
            const filePath = path.join(__dirname, filename);
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`✅ Loaded ${filename}: ${Array.isArray(data) ? data.length : Object.keys(data).length} items`);
                return data;
            } else {
                console.log(`⚠️ File not found: ${filename}`);
                return null;
            }
        } catch (error) {
            console.log(`❌ Error loading ${filename}:`, error.message);
            return null;
        }
    }

    // Step 1: Create proper subcategories for ETL products
    createETLSubcategories() {
        console.log('📂 Step 1: Creating proper ETL subcategories...');
        
        const etlSubcategoryMap = {
            // Motors and Drives
            'NORD Gear Ltd': 'Motors & Drives',
            'ABB Ltd': 'Motors & Drives',
            'WEG Electric Motors (UK) Ltd': 'Motors & Drives',
            'Invertek Drives Ltd': 'Motors & Drives',
            'Emerson Industrial Automation - Control techniques - Leroy Somer': 'Motors & Drives',
            'Eaton Electrical Limited': 'Motors & Drives',
            'Vacon Drives UK Ltd': 'Motors & Drives',
            'Nidec Drives': 'Motors & Drives',
            'Fuji Electric Europe GmbH': 'Motors & Drives',
            'FUTURE MOTORS LIMITED': 'Motors & Drives',
            
            // HVAC and Cooling
            'Evapco Europe NV': 'HVAC & Cooling',
            'Baltimore Aircoil Ltd.': 'HVAC & Cooling',
            'BITZER Kühlmaschinenbau GmbH': 'HVAC & Cooling',
            'True Refrigeration UK Limited': 'HVAC & Cooling',
            'AHT Cooling Systems GmbH': 'HVAC & Cooling',
            'Carrier Linde Commercial Refrigeration': 'HVAC & Cooling',
            'Husky Refrigerators (UK) Ltd.': 'HVAC & Cooling',
            'Adande Refrigeration': 'HVAC & Cooling',
            'Pastorfrigor SpA': 'HVAC & Cooling',
            'Williams Refrigeration': 'HVAC & Cooling',
            'LIEBHERR': 'HVAC & Cooling',
            'Staycold Export Ltd': 'HVAS & Cooling',
            
            // Heating Systems
            'Danfoss Ltd': 'Heating Systems',
            'Froeling Heizkessel und Behaelterbau GmbH': 'Heating Systems',
            'ETA Heiztechnik': 'Heating Systems',
            'Limpsfield Combustion Engineering Co Ltd': 'Heating Systems',
            'Windhager UK': 'Heating Systems',
            'Remeha Commercial': 'Heating Systems',
            'BOSCH THERMOTECHNOLOGY LTD': 'Heating Systems',
            'Ideal Boilers Ltd': 'Heating Systems',
            'AIC HEATING UK LIMITED': 'Heating Systems',
            'Vokera Limited': 'Heating Systems',
            'Powrmatic Ltd': 'Heating Systems',
            'A.O. Smith Water Heaters': 'Heating Systems',
            'Baxi Heating-Commercial': 'Heating Systems',
            'Viessmann Ltd': 'Heating Systems',
            'Elco Heating Solutions Limited': 'Heating Systems',
            'Andrews Water Heaters and Boilers': 'Heating Systems',
            'Weishaupt (UK) Limited': 'Heating Systems',
            'HeatingSave Ltd': 'Heating Systems',
            'Cochran Limited': 'Heating Systems',
            'Rinnai UK Ltd': 'Heating Systems',
            'NAVIEN LTD': 'Heating Systems',
            'Potterton Commercial': 'Heating Systems',
            'Autoflame Engineering': 'Heating Systems',
            'ATAG Commercial Ltd': 'Heating Systems',
            'Keston Boilers Ltd': 'Heating Systems',
            
            // Pumps and Water Systems
            'Grundfos Pumps Ltd': 'Pumps & Water Systems',
            'XYLEM WATER SOLUTIONS UK LTD': 'Pumps & Water Systems',
            'Triton Showers (A division of Norcros Group Ltd)': 'Pumps & Water Systems',
            'KELDA SHOWERS LIMITED': 'Pumps & Water Systems',
            
            // Power and Electrical
            'Schneider Electric Ltd': 'Power & Electrical',
            'Eaton - Power Quality Products': 'Power & Electrical',
            'POWER QUALITY EXPERT LIMITED': 'Power & Electrical',
            'APC By Schneider Electric': 'Power & Electrical',
            'Socomec U.K. Limited': 'Power & Electrical',
            'Piller UK Ltd': 'Power & Electrical',
            'Chauvin Arnoux UK Limited': 'Power & Electrical',
            
            // Insulation and Building Materials
            'KNAUF INSULATION LIMITED': 'Insulation & Building Materials',
            'Therma Screens Ltd': 'Insulation & Building Materials',
            'BUILDING PRODUCTS DISTRIBUTORS LIMITED': 'Insulation & Building Materials',
            
            // Combustion and Burners
            'Dunphy Combustion Ltd': 'Combustion & Burners',
            'Jaeggi Hybridtechnology Ltd': 'Combustion & Burners',
            'Kenfield Ltd': 'Combustion & Burners',
            'Treco Ltd': 'Combustion & Burners',
            'Alternative Heat Ltd': 'Combustion & Burners',
            'JBG-2 Sp. z o.o.': 'Combustion & Burners',
            'Organic Energy (UK) Ltd': 'Combustion & Burners',
            'RECOUP ENERGY SOLUTIONS LTD': 'Combustion & Burners',
            
            // Professional Equipment
            'Electrolux Professional': 'Professional Equipment',
            'RATIONAL UK LIMITED': 'Professional Equipment',
            'UNOX UK LIMITED': 'Professional Equipment',
            'MKN Maschinenfabrik Kurt Neubauer GmbH&Co.KG': 'Professional Equipment',
            'Hobart': 'Professional Equipment',
            'Eloma GmbH': 'Professional Equipment',
            'Showmaster Limited': 'Professional Equipment',
            'VICTOR MANUFACTURING LIMITED': 'Professional Equipment',
            'J&E Hall International Ltd.': 'Professional Equipment',
            'Thermofrost Cryo PLC': 'Professional Equipment',
            
            // Automation and Controls
            'Mitsubishi Electric UK - Automation Systems Division': 'Automation & Controls',
            'Ziehl Abegg UK Ltd': 'Automation & Controls',
            'Hubbard Products Ltd': 'Automation & Controls',
            'WIRTH RESEARCH LIMITED': 'Automation & Controls',
            'Resource Data Management': 'Automation & Controls',
            'ebm-papst UK Ltd': 'Automation & Controls',
            'TEV Ltd': 'Automation & Controls',
            'LOXONE UK LIMITED': 'Automation & Controls',
            'INTELLIGENT FACILITY SOLUTIONS LIMITED': 'Automation & Controls',
            'Prefect Controls Ltd': 'Automation & Controls',
            'Power Tecnique Ltd': 'Automation & Controls',
            't-mac Technologies': 'Automation & Controls',
            'Guardian Controls International Ltd': 'Automation & Controls',
            'DMS METERING LIMITED': 'Automation & Controls',
            
            // Solar and Renewable
            'SOLARFOCUS GmbH': 'Solar & Renewable',
            'SolarUK': 'Solar & Renewable',
            'Naked Energy Ltd.': 'Solar & Renewable',
            'ENERGY EFFICIENCY CONSULTANCY LTD': 'Solar & Renewable',
            
            // Ventilation and Air Systems
            'Daikin Europe N.V.': 'Ventilation & Air Systems',
            'SEELEY INTERNATIONAL (EUROPE) LIMITED': 'Ventilation & Air Systems',
            'AIRSYS (UK) LIMITED': 'Ventilation & Air Systems',
            'Vent-Axia': 'Ventilation & Air Systems',
            'CoolSky Ltd': 'Ventilation & Air Systems',
            'Kooltech Ltd': 'Ventilation & Air Systems',
            'AEROFOIL ENERGY LIMITED': 'Ventilation & Air Systems',
            
            // Compressed Air and Pneumatics
            'HPC Compressed Air Systems': 'Compressed Air & Pneumatics',
            'Ingersoll Rand International Ltd': 'Compressed Air & Pneumatics',
            
            // Measurement and Instrumentation
            'FLEXIM INSTRUMENTS UK LTD.': 'Measurement & Instrumentation',
            'Tektroniks Ltd': 'Measurement & Instrumentation',
            'Stark Software International Ltd': 'Measurement & Instrumentation',
            
            // Other Specialized Equipment
            'Bond Retail Services Ltd': 'Specialized Equipment',
            'SCHOTT UK LIMITED': 'Specialized Equipment',
            'Dravo Limited': 'Specialized Equipment',
            'Therm Tech Contracts Ltd': 'Specialized Equipment',
            'Quintex Systems Ltd.': 'Specialized Equipment',
            'Pilot Group Ltd': 'Specialized Equipment',
            'MCS NV': 'Specialized Equipment',
            'FONDERIE SIME SPA': 'Specialized Equipment',
            'Enlighted Inc': 'Specialized Equipment',
            'Alpha Therm Ltd': 'Specialized Equipment',
            'S & S NORTHERN LIMITED': 'Specialized Equipment',
            'Novum (Overseas) Ltd': 'Specialized Equipment',
            'Pentland Wholesale Limited': 'Specialized Equipment',
            'Winterwarm': 'Specialized Equipment',
            'LINCAT LIMITED': 'Specialized Equipment',
            'TQ Environmental plc': 'Specialized Equipment',
            'Spirax Sarco Ltd': 'Specialized Equipment',
            'Rayotec Ltd': 'Specialized Equipment',
            'Mikropor Makina Sanayi Ve Ticaret A.S.': 'Specialized Equipment',
            'MITA Cooling Technologies S.r.l.': 'Specialized Equipment',
            'CPC UK': 'Specialized Equipment',
            'TECHNIK 2 LIMITED': 'Specialized Equipment',
            'Advanced Ergonomic Technologies Ltd': 'Specialized Equipment',
            'Siemens plc': 'Specialized Equipment',
            'Hisa Engineering Ltd': 'Specialized Equipment',
            'Dalroad Norslo Limited': 'Specialized Equipment'
        };

        return etlSubcategoryMap;
    }

    // Step 2: Enhance products with additional information
    enhanceProductWithAdditionalInfo(product) {
        const enhanced = { ...product };
        
        // Add media information
        if (this.productMediaData) {
            const mediaKey = Object.keys(this.productMediaData).find(key => 
                product.name.toLowerCase().includes(key.toLowerCase()) ||
                key.toLowerCase().includes(product.name.toLowerCase())
            );
            
            if (mediaKey && this.productMediaData[mediaKey]) {
                const mediaData = this.productMediaData[mediaKey];
                enhanced.images = [...(enhanced.images || []), ...(mediaData.images || [])];
                enhanced.videos = [...(enhanced.videos || []), ...(mediaData.videos || [])];
            }
        }

        // Add Wix product information
        if (this.wixProductsData) {
            const wixProduct = this.wixProductsData.find(wix => 
                wix.name.toLowerCase().includes(product.name.toLowerCase()) ||
                product.name.toLowerCase().includes(wix.name.toLowerCase()) ||
                wix.sku === product.id
            );
            
            if (wixProduct) {
                enhanced.price = wixProduct.price || enhanced.price;
                enhanced.descriptionFull = wixProduct.description || enhanced.descriptionFull;
                enhanced.sku = wixProduct.sku || enhanced.sku;
                enhanced.collection = wixProduct.collection;
                enhanced.productImageUrl = wixProduct.productImageUrl;
                enhanced.inventory = wixProduct.inventory;
                enhanced.visible = wixProduct.visible;
            }
        }

        // Add commercial product information
        if (this.commercialProductsData && this.commercialProductsData.products) {
            const commercialProduct = this.commercialProductsData.products.find(com => 
                com.name.toLowerCase().includes(product.name.toLowerCase()) ||
                product.name.toLowerCase().includes(com.name.toLowerCase())
            );
            
            if (commercialProduct) {
                enhanced.price = commercialProduct.price || enhanced.price;
                enhanced.descriptionFull = commercialProduct.description || enhanced.descriptionFull;
                enhanced.specifications = { ...enhanced.specifications, ...commercialProduct.specifications };
                enhanced.additionalInfo = [...(enhanced.additionalInfo || []), ...(commercialProduct.additionalInfo || [])];
            }
        }

        // Add appliances information
        if (this.appliancesData && Array.isArray(this.appliancesData)) {
            const applianceProduct = this.appliancesData.find(app => 
                app.name.toLowerCase().includes(product.name.toLowerCase()) ||
                product.name.toLowerCase().includes(app.name.toLowerCase())
            );
            
            if (applianceProduct) {
                enhanced.price = applianceProduct.price || enhanced.price;
                enhanced.descriptionFull = applianceProduct.description || enhanced.descriptionFull;
                enhanced.specifications = { ...enhanced.specifications, ...applianceProduct.specifications };
                enhanced.additionalInfo = [...(enhanced.additionalInfo || []), ...(applianceProduct.additionalInfo || [])];
            }
        }

        // Add lighting information
        if (this.lightingData && Array.isArray(this.lightingData)) {
            const lightingProduct = this.lightingData.find(light => 
                light.name.toLowerCase().includes(product.name.toLowerCase()) ||
                product.name.toLowerCase().includes(light.name.toLowerCase())
            );
            
            if (lightingProduct) {
                enhanced.price = lightingProduct.price || enhanced.price;
                enhanced.descriptionFull = lightingProduct.description || enhanced.descriptionFull;
                enhanced.specifications = { ...enhanced.specifications, ...lightingProduct.specifications };
                enhanced.additionalInfo = [...(enhanced.additionalInfo || []), ...(lightingProduct.additionalInfo || [])];
            }
        }

        // Add extra additional info marker
        enhanced.extraAdditionalInfo = {
            hasMediaData: this.productMediaData && Object.keys(this.productMediaData).some(key => 
                product.name.toLowerCase().includes(key.toLowerCase()) ||
                key.toLowerCase().includes(product.name.toLowerCase())
            ),
            hasWixData: this.wixProductsData && this.wixProductsData.some(wix => 
                wix.name.toLowerCase().includes(product.name.toLowerCase()) ||
                product.name.toLowerCase().includes(wix.name.toLowerCase()) ||
                wix.sku === product.id
            ),
            hasCommercialData: this.commercialProductsData && this.commercialProductsData.products && this.commercialProductsData.products.some(com => 
                com.name.toLowerCase().includes(product.name.toLowerCase()) ||
                product.name.toLowerCase().includes(com.name.toLowerCase())
            ),
            hasApplianceData: this.appliancesData && Array.isArray(this.appliancesData) && this.appliancesData.some(app => 
                app.name.toLowerCase().includes(product.name.toLowerCase()) ||
                product.name.toLowerCase().includes(app.name.toLowerCase())
            ),
            hasLightingData: this.lightingData && Array.isArray(this.lightingData) && this.lightingData.some(light => 
                light.name.toLowerCase().includes(product.name.toLowerCase()) ||
                product.name.toLowerCase().includes(light.name.toLowerCase())
            ),
            enhancementDate: new Date().toISOString()
        };

        return enhanced;
    }

    // Step 3: Create enhanced database
    async createEnhancedDatabase() {
        console.log('🏗️ Step 3: Creating enhanced database...');
        
        // Remove old enhanced database if it exists
        if (fs.existsSync(this.enhancedDbPath)) {
            fs.unlinkSync(this.enhancedDbPath);
            console.log('🗑️ Removed old enhanced database');
        }
        
        // Create new enhanced database
        const enhancedDb = new sqlite3.Database(this.enhancedDbPath);
        const centralDb = new sqlite3.Database(this.centralDbPath);
        
        return new Promise((resolve, reject) => {
            enhancedDb.serialize(() => {
                // Create enhanced products table
                enhancedDb.run(`
                    CREATE TABLE IF NOT EXISTS products (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        brand TEXT,
                        category TEXT,
                        subcategory TEXT,
                        enhanced_subcategory TEXT,
                        modelNumber TEXT,
                        price REAL DEFAULT 0,
                        power REAL DEFAULT 0,
                        powerDisplay TEXT,
                        energyRating TEXT,
                        efficiency TEXT,
                        runningCostPerYear REAL DEFAULT 0,
                        waterPerCycle REAL DEFAULT 0,
                        waterPerYear REAL DEFAULT 0,
                        capacityKg REAL DEFAULT 0,
                        placeSettings INTEGER DEFAULT 0,
                        imageUrl TEXT,
                        images TEXT,
                        videos TEXT,
                        descriptionShort TEXT,
                        descriptionFull TEXT,
                        additionalInfo TEXT,
                        specifications TEXT,
                        marketingInfo TEXT,
                        calculatorData TEXT,
                        productPageUrl TEXT,
                        affiliateInfo TEXT,
                        extraAdditionalInfo TEXT,
                        createdAt TEXT,
                        updatedAt TEXT,
                        extractedFrom TEXT,
                        extractionDate TEXT,
                        enhancementDate TEXT
                    )
                `, (err) => {
                    if (err) {
                        console.error('❌ Error creating enhanced table:', err.message);
                        reject(err);
                        return;
                    }
                    
                    console.log('✅ Created enhanced products table');
                    
                    // Get all products from central database
                    centralDb.all('SELECT * FROM products', (err, products) => {
                        if (err) {
                            console.error('❌ Error reading products:', err.message);
                            reject(err);
                            return;
                        }
                        
                        console.log(`📊 Processing ${products.length} products...`);
                        
                        const etlSubcategoryMap = this.createETLSubcategories();
                        let processed = 0;
                        let enhanced = 0;
                        
                        // Prepare statement once
                        const stmt = enhancedDb.prepare(`
                            INSERT INTO products (
                                id, name, brand, category, subcategory, enhanced_subcategory,
                                modelNumber, price, power, powerDisplay, energyRating, efficiency,
                                runningCostPerYear, waterPerCycle, waterPerYear, capacityKg, placeSettings,
                                imageUrl, images, videos, descriptionShort, descriptionFull,
                                additionalInfo, specifications, marketingInfo, calculatorData,
                                productPageUrl, affiliateInfo, extraAdditionalInfo,
                                createdAt, updatedAt, extractedFrom, extractionDate, enhancementDate
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `);
                        
                        // Process each product
                        products.forEach(product => {
                            // Add proper subcategory for ETL products
                            if (product.category === 'ETL Technology') {
                                product.enhanced_subcategory = etlSubcategoryMap[product.brand] || 'Other ETL Equipment';
                            } else {
                                product.enhanced_subcategory = product.subcategory || product.category;
                            }
                            
                            // Enhance with additional information
                            const enhancedProduct = this.enhanceProductWithAdditionalInfo(product);
                            
                            if (enhancedProduct.extraAdditionalInfo.hasMediaData || 
                                enhancedProduct.extraAdditionalInfo.hasWixData ||
                                enhancedProduct.extraAdditionalInfo.hasCommercialData ||
                                enhancedProduct.extraAdditionalInfo.hasApplianceData ||
                                enhancedProduct.extraAdditionalInfo.hasLightingData) {
                                enhanced++;
                            }
                            
                            // Insert into enhanced database
                            stmt.run([
                                enhancedProduct.id, enhancedProduct.name, enhancedProduct.brand, 
                                enhancedProduct.category, enhancedProduct.subcategory, enhancedProduct.enhanced_subcategory,
                                enhancedProduct.modelNumber, enhancedProduct.price, enhancedProduct.power, 
                                enhancedProduct.powerDisplay, enhancedProduct.energyRating, enhancedProduct.efficiency,
                                enhancedProduct.runningCostPerYear, enhancedProduct.waterPerCycle, enhancedProduct.waterPerYear,
                                enhancedProduct.capacityKg, enhancedProduct.placeSettings, enhancedProduct.imageUrl,
                                JSON.stringify(enhancedProduct.images), JSON.stringify(enhancedProduct.videos),
                                enhancedProduct.descriptionShort, enhancedProduct.descriptionFull,
                                JSON.stringify(enhancedProduct.additionalInfo), JSON.stringify(enhancedProduct.specifications),
                                JSON.stringify(enhancedProduct.marketingInfo), JSON.stringify(enhancedProduct.calculatorData),
                                enhancedProduct.productPageUrl, JSON.stringify(enhancedProduct.affiliateInfo),
                                JSON.stringify(enhancedProduct.extraAdditionalInfo), enhancedProduct.createdAt,
                                enhancedProduct.updatedAt, enhancedProduct.extractedFrom, enhancedProduct.extractionDate,
                                new Date().toISOString()
                            ], (err) => {
                                if (err) {
                                    console.error('❌ Error inserting enhanced product:', enhancedProduct.id, err.message);
                                } else {
                                    processed++;
                                    if (processed % 1000 === 0) {
                                        console.log(`📊 Processed ${processed} products...`);
                                    }
                                }
                            });
                        });
                        
                        stmt.finalize((err) => {
                            if (err) {
                                console.error('❌ Error finalizing insert:', err.message);
                                reject(err);
                            } else {
                                console.log(`✅ Successfully processed ${processed} products`);
                                console.log(`✅ Enhanced ${enhanced} products with additional information`);
                                resolve({ processed, enhanced });
                            }
                            enhancedDb.close();
                            centralDb.close();
                        });
                    });
                });
            });
        });
    }

    // Step 4: Generate enhanced statistics
    async generateEnhancedStatistics() {
        console.log('📊 Step 4: Generating enhanced statistics...');
        
        const enhancedDb = new sqlite3.Database(this.enhancedDbPath);
        
        return new Promise((resolve, reject) => {
            enhancedDb.serialize(() => {
                // Get enhanced subcategories
                enhancedDb.all('SELECT enhanced_subcategory, COUNT(*) as count FROM products GROUP BY enhanced_subcategory ORDER BY count DESC', (err, rows) => {
                    if (err) {
                        console.error('❌ Error getting enhanced subcategories:', err.message);
                        reject(err);
                        return;
                    }
                    
                    console.log('📂 ENHANCED SUBCATEGORIES:');
                    rows.forEach(row => {
                        console.log(`   ${row.enhanced_subcategory}: ${row.count} products`);
                    });
                    
                    // Get enhancement statistics
                    enhancedDb.all('SELECT extraAdditionalInfo FROM products WHERE extraAdditionalInfo IS NOT NULL', (err, enhancedRows) => {
                        if (err) {
                            console.error('❌ Error getting enhancement stats:', err.message);
                            reject(err);
                            return;
                        }
                        
                        let mediaEnhanced = 0;
                        let wixEnhanced = 0;
                        let commercialEnhanced = 0;
                        let applianceEnhanced = 0;
                        let lightingEnhanced = 0;
                        
                        enhancedRows.forEach(row => {
                            const extraInfo = JSON.parse(row.extraAdditionalInfo);
                            if (extraInfo.hasMediaData) mediaEnhanced++;
                            if (extraInfo.hasWixData) wixEnhanced++;
                            if (extraInfo.hasCommercialData) commercialEnhanced++;
                            if (extraInfo.hasApplianceData) applianceEnhanced++;
                            if (extraInfo.hasLightingData) lightingEnhanced++;
                        });
                        
                        console.log('\n🎯 ENHANCEMENT STATISTICS:');
                        console.log(`   Products with Media Data: ${mediaEnhanced}`);
                        console.log(`   Products with Wix Data: ${wixEnhanced}`);
                        console.log(`   Products with Commercial Data: ${commercialEnhanced}`);
                        console.log(`   Products with Appliance Data: ${applianceEnhanced}`);
                        console.log(`   Products with Lighting Data: ${lightingEnhanced}`);
                        
                        resolve({
                            enhancedSubcategories: rows,
                            enhancementStats: {
                                mediaEnhanced,
                                wixEnhanced,
                                commercialEnhanced,
                                applianceEnhanced,
                                lightingEnhanced
                            }
                        });
                        
                        enhancedDb.close();
                    });
                });
            });
        });
    }

    // Main enhancement process
    async enhanceAll() {
        try {
            console.log('🚀 Starting comprehensive database enhancement...\n');
            
            // Step 1: Create enhanced database
            const { processed, enhanced } = await this.createEnhancedDatabase();
            
            // Step 2: Generate statistics
            const stats = await this.generateEnhancedStatistics();
            
            console.log('\n🎉 COMPREHENSIVE ENHANCEMENT COMPLETE!');
            console.log(`✅ Processed ${processed} products`);
            console.log(`✅ Enhanced ${enhanced} products with additional information`);
            console.log(`✅ Created enhanced database: ${this.enhancedDbPath}`);
            console.log(`✅ Created ${stats.enhancedSubcategories.length} proper subcategories`);
            console.log('✅ Added extra additional information from multiple sources');
            
            return {
                success: true,
                processed,
                enhanced,
                enhancedDbPath: this.enhancedDbPath,
                subcategories: stats.enhancedSubcategories.length,
                enhancementStats: stats.enhancementStats
            };
            
        } catch (error) {
            console.error('❌ Enhancement failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Run the enhancement
if (require.main === module) {
    const enhancer = new DatabaseEnhancer();
    enhancer.enhanceAll().then(result => {
        if (result.success) {
            console.log('\n🎯 Next Steps:');
            console.log('1. Use enhanced database for all calculator interfaces');
            console.log('2. Products now have proper subcategories for better filtering');
            console.log('3. Additional information from multiple sources integrated');
            console.log('4. Ready for calculator integration');
        } else {
            console.log('\n❌ Enhancement failed - check error messages above');
        }
    });
}

module.exports = DatabaseEnhancer;
