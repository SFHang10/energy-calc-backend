const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 CHECKING DATABASE SCHEMAS\n');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CENTRAL_DB_PATH = path.join(__dirname, 'database', 'energy_calculator_central.db');
const CALCULATOR_DB_PATH = path.join(__dirname, 'database', 'energy_calculator.db');

// ============================================================================
// SCHEMA CHECK FUNCTION
// ============================================================================

async function checkSchemas() {
    try {
        console.log('📋 Connecting to both databases...');
        const centralDb = new sqlite3.Database(CENTRAL_DB_PATH);
        const calculatorDb = new sqlite3.Database(CALCULATOR_DB_PATH);
        
        return new Promise((resolve, reject) => {
            // Get Central DB schema
            centralDb.all("PRAGMA table_info(products)", [], (err, centralSchema) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log('✅ Central DB Schema:');
                centralSchema.forEach(column => {
                    console.log(`   ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}`);
                });
                
                // Get Calculator DB schema
                calculatorDb.all("PRAGMA table_info(products)", [], (err, calculatorSchema) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    console.log('\n✅ Calculator DB Schema:');
                    calculatorSchema.forEach(column => {
                        console.log(`   ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}`);
                    });
                    
                    // Compare schemas
                    console.log('\n📊 SCHEMA COMPARISON:');
                    const centralColumns = centralSchema.map(col => col.name);
                    const calculatorColumns = calculatorSchema.map(col => col.name);
                    
                    const centralOnly = centralColumns.filter(col => !calculatorColumns.includes(col));
                    const calculatorOnly = calculatorColumns.filter(col => !centralColumns.includes(col));
                    const commonColumns = centralColumns.filter(col => calculatorColumns.includes(col));
                    
                    console.log(`   Common columns: ${commonColumns.length}`);
                    console.log(`   Central-only columns: ${centralOnly.length}`);
                    console.log(`   Calculator-only columns: ${calculatorOnly.length}`);
                    
                    if (centralOnly.length > 0) {
                        console.log('\n   Central DB has additional columns:');
                        centralOnly.forEach(col => console.log(`     - ${col}`));
                    }
                    
                    if (calculatorOnly.length > 0) {
                        console.log('\n   Calculator DB has additional columns:');
                        calculatorOnly.forEach(col => console.log(`     - ${col}`));
                    }
                    
                    // Check professional foodservice products in both databases
                    console.log('\n🔍 CHECKING PROFESSIONAL FOODSERVICE PRODUCTS:');
                    
                    // Central DB query (using correct column names)
                    centralDb.all(`
                        SELECT name, brand, imageUrl, descriptionShort, specifications
                        FROM products 
                        WHERE category = 'professional-foodservice'
                        LIMIT 5
                    `, [], (err, centralProducts) => {
                        if (err) {
                            console.log('❌ Central DB query error:', err.message);
                        } else {
                            console.log(`   Central DB: ${centralProducts.length} products (showing first 5)`);
                            centralProducts.forEach((product, index) => {
                                console.log(`     ${index + 1}. ${product.name} (${product.brand})`);
                                console.log(`        Image: ${product.imageUrl ? 'Yes' : 'No'}`);
                                console.log(`        Description: ${product.descriptionShort ? 'Yes' : 'No'}`);
                            });
                        }
                        
                        // Calculator DB query (using correct column names)
                        calculatorDb.all(`
                            SELECT name, brand, image_url, description, specifications
                            FROM products 
                            WHERE category = 'professional-foodservice'
                            LIMIT 5
                        `, [], (err, calculatorProducts) => {
                            if (err) {
                                console.log('❌ Calculator DB query error:', err.message);
                            } else {
                                console.log(`\n   Calculator DB: ${calculatorProducts.length} products (showing first 5)`);
                                calculatorProducts.forEach((product, index) => {
                                    console.log(`     ${index + 1}. ${product.name} (${product.brand})`);
                                    console.log(`        Image: ${product.image_url ? 'Yes' : 'No'}`);
                                    console.log(`        Description: ${product.description ? 'Yes' : 'No'}`);
                                });
                            }
                            
                            centralDb.close();
                            calculatorDb.close();
                            resolve({
                                centralColumns: centralColumns.length,
                                calculatorColumns: calculatorColumns.length,
                                commonColumns: commonColumns.length,
                                centralOnly: centralOnly.length,
                                calculatorOnly: calculatorOnly.length
                            });
                        });
                    });
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error checking schemas:', error);
        return { error: error.message };
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    try {
        console.log('🚀 Starting Schema Analysis...\n');
        
        const result = await checkSchemas();
        
        if (result.error) {
            console.log('\n❌ SCHEMA CHECK FAILED!');
            console.log(`   Error: ${result.error}`);
        } else {
            console.log('\n✅ SCHEMA ANALYSIS COMPLETE!');
            console.log(`   Central DB columns: ${result.centralColumns}`);
            console.log(`   Calculator DB columns: ${result.calculatorColumns}`);
            console.log(`   Common columns: ${result.commonColumns}`);
            console.log(`   Central-only columns: ${result.centralOnly}`);
            console.log(`   Calculator-only columns: ${result.calculatorOnly}`);
        }
        
    } catch (error) {
        console.error('❌ Error during schema check:', error);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    checkSchemas
};



















