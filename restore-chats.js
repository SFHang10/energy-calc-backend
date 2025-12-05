/**
 * Restore Cursor chat history from backup databases
 * This script will merge chat data from backup files into current databases
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const CURSOR_USER = path.join(APPDATA, 'Cursor', 'User');
const GLOBAL_STORAGE = path.join(CURSOR_USER, 'globalStorage');
const WORKSPACE_STORAGE = path.join(CURSOR_USER, 'workspaceStorage');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  console.error('❌ better-sqlite3 not installed. Please run: npm install better-sqlite3');
  process.exit(1);
}

console.log('🔄 Restoring Cursor Chat History from Backups\n');
console.log('='.repeat(60) + '\n');
console.log('⚠️  WARNING: This will modify your Cursor databases!');
console.log('⚠️  Make sure Cursor is CLOSED before running this script!\n');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

function restoreFromBackup(currentPath, backupPath, label) {
  if (!fs.existsSync(backupPath)) {
    console.log(`   ⚠️  No backup found for ${label}`);
    return { restored: 0, skipped: 0 };
  }

  if (!fs.existsSync(currentPath)) {
    console.log(`   ⚠️  Current database doesn't exist for ${label}`);
    return { restored: 0, skipped: 0 };
  }

  console.log(`\n📂 Restoring ${label}...`);

  // Open both databases
  const backupDb = new Database(backupPath, { readonly: true });
  const currentDb = new Database(currentPath);

  let restored = 0;
  let skipped = 0;

  try {
    // Get all items from backup
    let backupItems = [];
    
    try {
      backupItems = backupDb.prepare("SELECT * FROM ItemTable").all();
    } catch (e) {
      console.log(`   ⚠️  Could not read ItemTable from backup: ${e.message}`);
    }

    // Get all items from current
    let currentItems = [];
    try {
      currentItems = currentDb.prepare("SELECT key FROM ItemTable").all();
      const currentKeys = new Set(currentItems.map(item => item.key));
      
      // Restore items from backup that don't exist in current
      for (const item of backupItems) {
        if (!currentKeys.has(item.key)) {
          try {
            currentDb.prepare("INSERT INTO ItemTable (key, value, timestamp) VALUES (?, ?, ?)")
              .run(item.key, item.value, item.timestamp || Date.now());
            restored++;
          } catch (e) {
            console.log(`   ⚠️  Could not restore item ${item.key}: ${e.message}`);
            skipped++;
          }
        } else {
          skipped++;
        }
      }
    } catch (e) {
      console.log(`   ⚠️  Error processing ItemTable: ${e.message}`);
    }

    // Also check cursorDiskKV table
    try {
      const backupKV = backupDb.prepare("SELECT * FROM cursorDiskKV").all();
      const currentKV = currentDb.prepare("SELECT key FROM cursorDiskKV").all();
      const currentKVKeys = new Set(currentKV.map(item => item.key));

      for (const item of backupKV) {
        if (!currentKVKeys.has(item.key)) {
          try {
            currentDb.prepare("INSERT INTO cursorDiskKV (key, value, timestamp) VALUES (?, ?, ?)")
              .run(item.key, item.value, item.timestamp || Date.now());
            restored++;
          } catch (e) {
            skipped++;
          }
        } else {
          skipped++;
        }
      }
    } catch (e) {
      // Table might not exist
    }

  } finally {
    backupDb.close();
    currentDb.close();
  }

  console.log(`   ✅ Restored ${restored} items, skipped ${skipped} existing items`);
  return { restored, skipped };
}

function runRestore() {
  // Restore global storage
  console.log('🔍 Checking Global Storage...\n');

  const globalCurrentPath = path.join(GLOBAL_STORAGE, 'state.vscdb');
  const globalBackupPath = path.join(GLOBAL_STORAGE, 'state.vscdb.backup');

  let totalRestored = 0;
  let totalSkipped = 0;

  if (fs.existsSync(globalBackupPath)) {
    const result = restoreFromBackup(globalCurrentPath, globalBackupPath, 'Global Storage');
    totalRestored += result.restored;
    totalSkipped += result.skipped;
    console.log(`\n   Summary: ${result.restored} items restored, ${result.skipped} skipped\n`);
  } else {
    console.log('   ⚠️  No global backup found\n');
  }

  // Restore workspace storage
  console.log('🔍 Checking Workspace Storage...\n');

  if (fs.existsSync(WORKSPACE_STORAGE)) {
    const workspaceDirs = fs.readdirSync(WORKSPACE_STORAGE, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name);

    for (const workspaceId of workspaceDirs) {
      const workspacePath = path.join(WORKSPACE_STORAGE, workspaceId);
      const dbPath = path.join(workspacePath, 'state.vscdb');
      const backupPath = path.join(workspacePath, 'state.vscdb.backup');

      if (fs.existsSync(backupPath)) {
        const result = restoreFromBackup(dbPath, backupPath, `Workspace ${workspaceId}`);
        totalRestored += result.restored;
        totalSkipped += result.skipped;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESTORATION SUMMARY\n');
    console.log(`Total items restored: ${totalRestored}`);
    console.log(`Total items skipped (already exist): ${totalSkipped}`);
    console.log('\n✅ Restoration complete!');
    console.log('💡 Restart Cursor to see your restored chats\n');
  } else {
    console.log('   ⚠️  Workspace storage folder not found\n');
  }
}

// Wait 5 seconds then run
setTimeout(() => {
  runRestore();
}, 5000);
