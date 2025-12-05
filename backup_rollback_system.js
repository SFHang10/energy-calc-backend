const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🛡️ COMPREHENSIVE BACKUP & ROLLBACK SYSTEM\n');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CENTRAL_DB_PATH = path.join(__dirname, 'database', 'energy_calculator_central.db');
const CALCULATOR_DB_PATH = path.join(__dirname, 'database', 'energy_calculator.db');
const JSON_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const BACKUP_DIR = path.join(__dirname, 'database', 'backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// ============================================================================
// BACKUP FUNCTIONS
// ============================================================================

/**
 * Create comprehensive backup of all critical files
 * @returns {Object} Backup information
 */
function createComprehensiveBackup() {
    try {
        console.log('📦 Creating comprehensive backup...');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupSessionDir = path.join(BACKUP_DIR, `backup_session_${timestamp}`);
        
        // Create backup session directory
        fs.mkdirSync(backupSessionDir, { recursive: true });
        
        const backupInfo = {
            timestamp,
            backupDir: backupSessionDir,
            files: {}
        };
        
        // Backup Central DB
        if (fs.existsSync(CENTRAL_DB_PATH)) {
            const centralBackup = path.join(backupSessionDir, 'energy_calculator_central.db');
            fs.copyFileSync(CENTRAL_DB_PATH, centralBackup);
            backupInfo.files.centralDb = centralBackup;
            console.log(`✅ Central DB backed up to: ${centralBackup}`);
        }
        
        // Backup Calculator DB
        if (fs.existsSync(CALCULATOR_DB_PATH)) {
            const calculatorBackup = path.join(backupSessionDir, 'energy_calculator.db');
            fs.copyFileSync(CALCULATOR_DB_PATH, calculatorBackup);
            backupInfo.files.calculatorDb = calculatorBackup;
            console.log(`✅ Calculator DB backed up to: ${calculatorBackup}`);
        }
        
        // Backup JSON file
        if (fs.existsSync(JSON_PATH)) {
            const jsonBackup = path.join(backupSessionDir, 'FULL-DATABASE-5554.json');
            fs.copyFileSync(JSON_PATH, jsonBackup);
            backupInfo.files.json = jsonBackup;
            console.log(`✅ JSON file backed up to: ${jsonBackup}`);
        }
        
        // Create backup manifest
        const manifestPath = path.join(backupSessionDir, 'backup_manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(backupInfo, null, 2));
        console.log(`✅ Backup manifest created: ${manifestPath}`);
        
        console.log(`\n🎯 Backup session created: ${backupSessionDir}`);
        console.log(`   Timestamp: ${timestamp}`);
        console.log(`   Files backed up: ${Object.keys(backupInfo.files).length}`);
        
        return backupInfo;
        
    } catch (error) {
        console.error('❌ Error creating comprehensive backup:', error);
        throw error;
    }
}

/**
 * List all available backups
 * @returns {Array} List of backup sessions
 */
function listAvailableBackups() {
    try {
        console.log('📋 Listing available backups...');
        
        if (!fs.existsSync(BACKUP_DIR)) {
            console.log('   No backup directory found');
            return [];
        }
        
        const backupSessions = fs.readdirSync(BACKUP_DIR)
            .filter(item => item.startsWith('backup_session_'))
            .map(session => {
                const sessionPath = path.join(BACKUP_DIR, session);
                const manifestPath = path.join(sessionPath, 'backup_manifest.json');
                
                if (fs.existsSync(manifestPath)) {
                    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    return {
                        session,
                        timestamp: manifest.timestamp,
                        backupDir: sessionPath,
                        files: manifest.files
                    };
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log(`✅ Found ${backupSessions.length} backup sessions:`);
        backupSessions.forEach((session, index) => {
            console.log(`   ${index + 1}. ${session.session}`);
            console.log(`      Timestamp: ${session.timestamp}`);
            console.log(`      Files: ${Object.keys(session.files).join(', ')}`);
        });
        
        return backupSessions;
        
    } catch (error) {
        console.error('❌ Error listing backups:', error);
        return [];
    }
}

/**
 * Restore from a specific backup session
 * @param {string} sessionName - Name of the backup session
 * @returns {Object} Restore information
 */
function restoreFromBackup(sessionName) {
    try {
        console.log(`🔄 Restoring from backup session: ${sessionName}`);
        
        const sessionPath = path.join(BACKUP_DIR, sessionName);
        const manifestPath = path.join(sessionPath, 'backup_manifest.json');
        
        if (!fs.existsSync(manifestPath)) {
            throw new Error(`Backup manifest not found: ${manifestPath}`);
        }
        
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const restoreInfo = {
            sessionName,
            timestamp: manifest.timestamp,
            restoredFiles: {}
        };
        
        // Restore Central DB
        if (manifest.files.centralDb && fs.existsSync(manifest.files.centralDb)) {
            fs.copyFileSync(manifest.files.centralDb, CENTRAL_DB_PATH);
            restoreInfo.restoredFiles.centralDb = CENTRAL_DB_PATH;
            console.log(`✅ Central DB restored from: ${manifest.files.centralDb}`);
        }
        
        // Restore Calculator DB
        if (manifest.files.calculatorDb && fs.existsSync(manifest.files.calculatorDb)) {
            fs.copyFileSync(manifest.files.calculatorDb, CALCULATOR_DB_PATH);
            restoreInfo.restoredFiles.calculatorDb = CALCULATOR_DB_PATH;
            console.log(`✅ Calculator DB restored from: ${manifest.files.calculatorDb}`);
        }
        
        // Restore JSON file
        if (manifest.files.json && fs.existsSync(manifest.files.json)) {
            fs.copyFileSync(manifest.files.json, JSON_PATH);
            restoreInfo.restoredFiles.json = JSON_PATH;
            console.log(`✅ JSON file restored from: ${manifest.files.json}`);
        }
        
        console.log(`\n✅ Restore complete!`);
        console.log(`   Session: ${sessionName}`);
        console.log(`   Timestamp: ${manifest.timestamp}`);
        console.log(`   Files restored: ${Object.keys(restoreInfo.restoredFiles).length}`);
        
        return restoreInfo;
        
    } catch (error) {
        console.error('❌ Error restoring from backup:', error);
        throw error;
    }
}

// ============================================================================
// VERIFICATION FUNCTIONS
// ============================================================================

/**
 * Verify database integrity after restore
 * @returns {Object} Verification results
 */
function verifyDatabaseIntegrity() {
    try {
        console.log('🔍 Verifying database integrity...');
        
        const results = {
            centralDb: { exists: false, products: 0, professionalFoodservice: 0 },
            calculatorDb: { exists: false, products: 0, professionalFoodservice: 0 },
            json: { exists: false, products: 0, professionalFoodservice: 0 }
        };
        
        // Verify Central DB
        if (fs.existsSync(CENTRAL_DB_PATH)) {
            results.centralDb.exists = true;
            
            const centralDb = new sqlite3.Database(CENTRAL_DB_PATH);
            
            return new Promise((resolve, reject) => {
                centralDb.all("SELECT COUNT(*) as count FROM products", [], (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    results.centralDb.products = rows[0].count;
                    
                    centralDb.all("SELECT COUNT(*) as count FROM products WHERE category = 'professional-foodservice'", [], (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        
                        results.centralDb.professionalFoodservice = rows[0].count;
                        
                        // Verify Calculator DB
                        if (fs.existsSync(CALCULATOR_DB_PATH)) {
                            results.calculatorDb.exists = true;
                            
                            const calculatorDb = new sqlite3.Database(CALCULATOR_DB_PATH);
                            
                            calculatorDb.all("SELECT COUNT(*) as count FROM products", [], (err, rows) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                
                                results.calculatorDb.products = rows[0].count;
                                
                                calculatorDb.all("SELECT COUNT(*) as count FROM products WHERE category = 'professional-foodservice'", [], (err, rows) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }
                                    
                                    results.calculatorDb.professionalFoodservice = rows[0].count;
                                    
                                    // Verify JSON file
                                    if (fs.existsSync(JSON_PATH)) {
                                        results.json.exists = true;
                                        
                                        try {
                                            const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
                                            results.json.products = jsonData.products ? jsonData.products.length : 0;
                                            results.json.professionalFoodservice = jsonData.products ? 
                                                jsonData.products.filter(p => p.category === 'professional-foodservice').length : 0;
                                        } catch (jsonError) {
                                            console.warn('⚠️ JSON file exists but could not be parsed');
                                        }
                                    }
                                    
                                    centralDb.close();
                                    calculatorDb.close();
                                    
                                    console.log('\n📊 Database Integrity Report:');
                                    console.log(`   Central DB: ${results.centralDb.exists ? '✅' : '❌'} (${results.centralDb.products} products, ${results.centralDb.professionalFoodservice} professional-foodservice)`);
                                    console.log(`   Calculator DB: ${results.calculatorDb.exists ? '✅' : '❌'} (${results.calculatorDb.products} products, ${results.calculatorDb.professionalFoodservice} professional-foodservice)`);
                                    console.log(`   JSON File: ${results.json.exists ? '✅' : '❌'} (${results.json.products} products, ${results.json.professionalFoodservice} professional-foodservice)`);
                                    
                                    resolve(results);
                                });
                            });
                        } else {
                            centralDb.close();
                            resolve(results);
                        }
                    });
                });
            });
        } else {
            return Promise.resolve(results);
        }
        
    } catch (error) {
        console.error('❌ Error verifying database integrity:', error);
        throw error;
    }
}

// ============================================================================
// ROLLBACK COMMANDS
// ============================================================================

/**
 * Interactive rollback menu
 */
function showRollbackMenu() {
    console.log('\n🛡️ ROLLBACK MENU:');
    console.log('   1. Create new backup');
    console.log('   2. List available backups');
    console.log('   3. Restore from backup');
    console.log('   4. Verify database integrity');
    console.log('   5. Exit');
    console.log('');
    console.log('💡 Usage examples:');
    console.log('   node backup_rollback_system.js backup');
    console.log('   node backup_rollback_system.js list');
    console.log('   node backup_rollback_system.js restore backup_session_2024-01-15T10-30-00-000Z');
    console.log('   node backup_rollback_system.js verify');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    try {
        const command = process.argv[2];
        
        switch (command) {
            case 'backup':
                console.log('🚀 Creating comprehensive backup...\n');
                const backupInfo = createComprehensiveBackup();
                console.log('\n✅ Backup completed successfully!');
                console.log(`   Session: ${backupInfo.timestamp}`);
                console.log(`   Location: ${backupInfo.backupDir}`);
                break;
                
            case 'list':
                console.log('🚀 Listing available backups...\n');
                const backups = listAvailableBackups();
                if (backups.length === 0) {
                    console.log('   No backups found. Run "node backup_rollback_system.js backup" to create one.');
                }
                break;
                
            case 'restore':
                const sessionName = process.argv[3];
                if (!sessionName) {
                    console.log('❌ Please specify a backup session name');
                    console.log('   Usage: node backup_rollback_system.js restore <session_name>');
                    process.exit(1);
                }
                
                console.log('🚀 Restoring from backup...\n');
                const restoreInfo = restoreFromBackup(sessionName);
                console.log('\n✅ Restore completed successfully!');
                console.log(`   Session: ${restoreInfo.sessionName}`);
                console.log(`   Timestamp: ${restoreInfo.timestamp}`);
                break;
                
            case 'verify':
                console.log('🚀 Verifying database integrity...\n');
                const verification = await verifyDatabaseIntegrity();
                console.log('\n✅ Verification completed!');
                break;
                
            default:
                showRollbackMenu();
                break;
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    createComprehensiveBackup,
    listAvailableBackups,
    restoreFromBackup,
    verifyDatabaseIntegrity
};



















