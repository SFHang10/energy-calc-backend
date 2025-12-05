/**
 * Restore database from the most recent backup
 * This will help recover if something went wrong
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const GLOBAL_STORAGE = path.join(APPDATA, 'Cursor', 'User', 'globalStorage');
const globalDbPath = path.join(GLOBAL_STORAGE, 'state.vscdb');

console.log('🔄 Restoring from Backup\n');
console.log('='.repeat(70) + '\n');

// Find all backup files
const backupFiles = fs.readdirSync(GLOBAL_STORAGE)
  .filter(f => f.startsWith('state.vscdb.backup-'))
  .map(f => ({
    name: f,
    path: path.join(GLOBAL_STORAGE, f),
    time: parseInt(f.replace('state.vscdb.backup-', ''))
  }))
  .sort((a, b) => b.time - a.time); // Most recent first

if (backupFiles.length === 0) {
  console.log('❌ No backup files found!');
  console.log('   Looking in: ' + GLOBAL_STORAGE + '\n');
  process.exit(1);
}

console.log(`📦 Found ${backupFiles.length} backup file(s):\n`);
backupFiles.forEach((backup, i) => {
  const date = new Date(backup.time);
  console.log(`   ${i + 1}. ${backup.name}`);
  console.log(`      Created: ${date.toLocaleString()}\n`);
});

// Use the most recent backup
const mostRecent = backupFiles[0];
console.log(`📥 Restoring from: ${mostRecent.name}\n`);
console.log(`   Created: ${new Date(mostRecent.time).toLocaleString()}\n`);

// Create a backup of current state first
if (fs.existsSync(globalDbPath)) {
  const currentBackup = globalDbPath + '.before-restore-' + Date.now();
  console.log('📦 Backing up current database...');
  fs.copyFileSync(globalDbPath, currentBackup);
  console.log(`✅ Current state backed up to: ${path.basename(currentBackup)}\n`);
}

// Restore
console.log('💾 Restoring database...');
try {
  fs.copyFileSync(mostRecent.path, globalDbPath);
  console.log('✅ Database restored!\n');
  
  console.log('='.repeat(70));
  console.log('\n✅ Restore complete!\n');
  console.log('💡 Next steps:');
  console.log('   1. Close Cursor completely');
  console.log('   2. Restart Cursor');
  console.log('   3. Check if chats are visible\n');
  
} catch (error) {
  console.error('\n❌ Error restoring:', error.message);
  process.exit(1);
}





