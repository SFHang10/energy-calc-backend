const fs = require('fs');
const path = require('path');

console.log('\n🔄 SAFE ROLLBACK SCRIPT');
console.log('='.repeat(70));
console.log('This will restore your database to a previous backup');
console.log('Calculator remains 100% unaffected\n');

// List all available backups
const backupFiles = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('FULL-DATABASE-5554-BACKUP-') && f.endsWith('.json'))
    .sort()
    .reverse(); // Most recent first

if (backupFiles.length === 0) {
    console.log('❌ No backup files found!');
    console.log('   Location:', __dirname);
    console.log('');
    process.exit(1);
}

console.log('📦 Available Backups:');
console.log('');
backupFiles.forEach((file, index) => {
    const stats = fs.statSync(path.join(__dirname, file));
    const size = (stats.size / 1024 / 1024).toFixed(2);
    const date = stats.mtime.toLocaleString();
    console.log(`   ${(index + 1).toString().padStart(2)}. ${file}`);
    console.log(`      Size: ${size} MB | Date: ${date}`);
    console.log('');
});

// Most recent backup is backupFiles[0]
const mostRecent = backupFiles[0];

console.log('🔍 Most Recent Backup:', mostRecent);
console.log('');
console.log('⚠️  This will:');
console.log('   ✓ Restore database to backup state');
console.log('   ✓ Keep calculator completely untouched');
console.log('   ✓ Keep all HTML files safe');
console.log('   ✓ Only modify FULL-DATABASE-5554.json');
console.log('');
console.log('Ready to rollback to most recent backup?');
console.log('');

// Create backup of current state first
console.log('💾 Creating backup of current state...');
const currentDb = path.join(__dirname, 'FULL-DATABASE-5554.json');
const emergencyBackup = path.join(__dirname, `FULL-DATABASE-5554-EMERGENCY-BACKUP-${Date.now()}.json`);

if (fs.existsSync(currentDb)) {
    fs.copyFileSync(currentDb, emergencyBackup);
    console.log('✅ Emergency backup created:', path.basename(emergencyBackup));
    console.log('');
}

// Perform rollback
console.log('🔄 Restoring from backup...');
const backupContent = fs.readFileSync(path.join(__dirname, mostRecent), 'utf8');
fs.writeFileSync(currentDb, backupContent);

console.log('✅ Rollback complete!');
console.log('');
console.log('📊 Summary:');
console.log(`   Restored from: ${mostRecent}`);
console.log(`   Current backup: ${path.basename(emergencyBackup)}`);
console.log('   Calculator: ✅ Untouched');
console.log('   HTML files: ✅ Untouched');
console.log('   Database: ✅ Restored');
console.log('');

// Verify the restore
try {
    const restored = JSON.parse(fs.readFileSync(currentDb, 'utf8'));
    console.log(`✅ Verification: Database contains ${restored.products.length} products`);
    console.log('');
    console.log('🎉 Rollback successful! Your calculator is safe.');
} catch (error) {
    console.log('❌ Error verifying restored database!');
    console.log('   You can restore from emergency backup:', path.basename(emergencyBackup));
}

console.log('');
console.log('✨ Done!');
console.log('');



const path = require('path');

console.log('\n🔄 SAFE ROLLBACK SCRIPT');
console.log('='.repeat(70));
console.log('This will restore your database to a previous backup');
console.log('Calculator remains 100% unaffected\n');

// List all available backups
const backupFiles = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('FULL-DATABASE-5554-BACKUP-') && f.endsWith('.json'))
    .sort()
    .reverse(); // Most recent first

if (backupFiles.length === 0) {
    console.log('❌ No backup files found!');
    console.log('   Location:', __dirname);
    console.log('');
    process.exit(1);
}

console.log('📦 Available Backups:');
console.log('');
backupFiles.forEach((file, index) => {
    const stats = fs.statSync(path.join(__dirname, file));
    const size = (stats.size / 1024 / 1024).toFixed(2);
    const date = stats.mtime.toLocaleString();
    console.log(`   ${(index + 1).toString().padStart(2)}. ${file}`);
    console.log(`      Size: ${size} MB | Date: ${date}`);
    console.log('');
});

// Most recent backup is backupFiles[0]
const mostRecent = backupFiles[0];

console.log('🔍 Most Recent Backup:', mostRecent);
console.log('');
console.log('⚠️  This will:');
console.log('   ✓ Restore database to backup state');
console.log('   ✓ Keep calculator completely untouched');
console.log('   ✓ Keep all HTML files safe');
console.log('   ✓ Only modify FULL-DATABASE-5554.json');
console.log('');
console.log('Ready to rollback to most recent backup?');
console.log('');

// Create backup of current state first
console.log('💾 Creating backup of current state...');
const currentDb = path.join(__dirname, 'FULL-DATABASE-5554.json');
const emergencyBackup = path.join(__dirname, `FULL-DATABASE-5554-EMERGENCY-BACKUP-${Date.now()}.json`);

if (fs.existsSync(currentDb)) {
    fs.copyFileSync(currentDb, emergencyBackup);
    console.log('✅ Emergency backup created:', path.basename(emergencyBackup));
    console.log('');
}

// Perform rollback
console.log('🔄 Restoring from backup...');
const backupContent = fs.readFileSync(path.join(__dirname, mostRecent), 'utf8');
fs.writeFileSync(currentDb, backupContent);

console.log('✅ Rollback complete!');
console.log('');
console.log('📊 Summary:');
console.log(`   Restored from: ${mostRecent}`);
console.log(`   Current backup: ${path.basename(emergencyBackup)}`);
console.log('   Calculator: ✅ Untouched');
console.log('   HTML files: ✅ Untouched');
console.log('   Database: ✅ Restored');
console.log('');

// Verify the restore
try {
    const restored = JSON.parse(fs.readFileSync(currentDb, 'utf8'));
    console.log(`✅ Verification: Database contains ${restored.products.length} products`);
    console.log('');
    console.log('🎉 Rollback successful! Your calculator is safe.');
} catch (error) {
    console.log('❌ Error verifying restored database!');
    console.log('   You can restore from emergency backup:', path.basename(emergencyBackup));
}

console.log('');
console.log('✨ Done!');
console.log('');





















