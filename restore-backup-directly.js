/**
 * Restore the entire backup database directly (nuclear option)
 * This will replace the current database with the backup
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const CURSOR_USER = path.join(APPDATA, 'Cursor', 'User');
const GLOBAL_STORAGE = path.join(CURSOR_USER, 'globalStorage');

console.log('🔄 Direct Backup Restoration\n');
console.log('='.repeat(60) + '\n');
console.log('⚠️  WARNING: This will replace your current database with the backup!');
console.log('⚠️  Make sure Cursor is CLOSED!\n');
console.log('This will restore ALL data from the backup, including chats.\n');

const currentPath = path.join(GLOBAL_STORAGE, 'state.vscdb');
const backupPath = path.join(GLOBAL_STORAGE, 'state.vscdb.backup');
const backupPath2 = path.join(GLOBAL_STORAGE, 'state.vscdb.backup2');

if (!fs.existsSync(backupPath)) {
  console.log('❌ Backup file not found!\n');
  process.exit(1);
}

// Create a backup of current first
if (fs.existsSync(currentPath)) {
  console.log('📦 Creating backup of current database...');
  fs.copyFileSync(currentPath, backupPath2);
  console.log(`✅ Current database backed up to: ${backupPath2}\n`);
}

// Copy backup to current
console.log('🔄 Restoring backup database...');
fs.copyFileSync(backupPath, currentPath);
console.log('✅ Backup restored!\n');

console.log('='.repeat(60));
console.log('\n✅ Restoration complete!');
console.log('💡 Restart Cursor to see your chats');
console.log(`💡 If something goes wrong, your current database is backed up at: ${backupPath2}\n`);












