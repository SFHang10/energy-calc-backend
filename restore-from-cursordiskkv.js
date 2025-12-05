/**
 * Restore chat data from cursorDiskKV table
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
  console.error('❌ better-sqlite3 not installed');
  process.exit(1);
}

console.log('🔄 Restoring Chat Data from cursorDiskKV Table\n');
console.log('='.repeat(60) + '\n');
console.log('⚠️  Make sure Cursor is CLOSED!\n');

function restoreFromCursorDiskKV(currentPath, backupPath, label) {
  if (!fs.existsSync(backupPath)) {
    console.log(`   ⚠️  No backup found for ${label}\n`);
    return { restored: 0, skipped: 0 };
  }

  if (!fs.existsSync(currentPath)) {
    console.log(`   ⚠️  Current database doesn't exist for ${label}\n`);
    return { restored: 0, skipped: 0 };
  }

  console.log(`\n📂 Restoring ${label}...`);

  const backupDb = new Database(backupPath, { readonly: true });
  const currentDb = new Database(currentPath);

  let restored = 0;
  let skipped = 0;

  try {
    // Check if cursorDiskKV table exists
    let hasCursorDiskKV = false;
    try {
      const tables = backupDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='cursorDiskKV'").all();
      hasCursorDiskKV = tables.length > 0;
    } catch (e) {
      // Table doesn't exist
    }

    if (hasCursorDiskKV) {
      // Get all composerData from cursorDiskKV
      const backupComposerData = backupDb.prepare("SELECT * FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
      console.log(`   📊 Found ${backupComposerData.length} composerData entries in backup (cursorDiskKV)`);

      // Get current keys
      let currentKeys = new Set();
      try {
        const currentComposerData = currentDb.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
        currentKeys = new Set(currentComposerData.map(item => item.key));
        console.log(`   📊 Found ${currentComposerData.length} composerData entries in current (cursorDiskKV)`);
      } catch (e) {
        // Table might not exist in current
        console.log(`   ⚠️  cursorDiskKV table might not exist in current: ${e.message}`);
      }

      // Restore missing composerData
      for (const item of backupComposerData) {
        if (!currentKeys.has(item.key)) {
          try {
            currentDb.prepare("INSERT INTO cursorDiskKV (key, value, timestamp) VALUES (?, ?, ?)")
              .run(item.key, item.value, item.timestamp || Date.now());
            restored++;
          } catch (e) {
            // Table might not exist, try creating it
            try {
              currentDb.prepare("CREATE TABLE IF NOT EXISTS cursorDiskKV (key TEXT PRIMARY KEY, value TEXT, timestamp INTEGER)").run();
              currentDb.prepare("INSERT INTO cursorDiskKV (key, value, timestamp) VALUES (?, ?, ?)")
                .run(item.key, item.value, item.timestamp || Date.now());
              restored++;
            } catch (e2) {
              console.log(`   ⚠️  Could not restore ${item.key}: ${e2.message}`);
              skipped++;
            }
          }
        } else {
          skipped++;
        }
      }

      // Also restore bubbleId keys
      const backupBubbles = backupDb.prepare("SELECT * FROM cursorDiskKV WHERE key LIKE 'bubbleId:%'").all();
      console.log(`   📊 Found ${backupBubbles.length} bubbleId entries in backup (cursorDiskKV)`);

      for (const item of backupBubbles) {
        if (!currentKeys.has(item.key)) {
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

      // Also restore messageRequestContext
      const backupContexts = backupDb.prepare("SELECT * FROM cursorDiskKV WHERE key LIKE 'messageRequestContext:%'").all();
      console.log(`   📊 Found ${backupContexts.length} messageRequestContext entries in backup (cursorDiskKV)`);

      for (const item of backupContexts) {
        if (!currentKeys.has(item.key)) {
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

      // Restore ALL chat-related keys from cursorDiskKV
      const backupChatKeys = backupDb.prepare("SELECT * FROM cursorDiskKV WHERE key LIKE '%chat%' OR key LIKE '%conversation%' OR key LIKE '%session%' OR key LIKE '%composer%' OR key LIKE '%bubble%' OR key LIKE '%message%'").all();
      
      let currentAllKeys = new Set();
      try {
        const currentAll = currentDb.prepare("SELECT key FROM cursorDiskKV").all();
        currentAllKeys = new Set(currentAll.map(i => i.key));
      } catch (e) {
        // Table might not exist
      }

      for (const item of backupChatKeys) {
        if (!currentAllKeys.has(item.key)) {
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
    } else {
      console.log(`   ⚠️  cursorDiskKV table not found in backup`);
    }

    // Also check ItemTable for composerData (in case it's there)
    const backupItemComposer = backupDb.prepare("SELECT * FROM ItemTable WHERE key LIKE 'composerData:%' OR key LIKE 'bubbleId:%' OR key LIKE 'messageRequestContext:%'").all();
    console.log(`   📊 Found ${backupItemComposer.length} chat entries in backup (ItemTable)`);

    let currentItemKeys = new Set();
    try {
      const currentItems = currentDb.prepare("SELECT key FROM ItemTable").all();
      currentItemKeys = new Set(currentItems.map(i => i.key));
    } catch (e) {
      // Table might not exist
    }

    for (const item of backupItemComposer) {
      if (!currentItemKeys.has(item.key)) {
        try {
          currentDb.prepare("INSERT INTO ItemTable (key, value, timestamp) VALUES (?, ?, ?)")
            .run(item.key, item.value, item.timestamp || Date.now());
          restored++;
        } catch (e) {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

  } finally {
    backupDb.close();
    currentDb.close();
  }

  console.log(`   ✅ Restored ${restored} items, skipped ${skipped} existing items\n`);
  return { restored, skipped };
}

// Restore global storage
console.log('🔍 Restoring Global Storage...\n');
const globalCurrentPath = path.join(GLOBAL_STORAGE, 'state.vscdb');
const globalBackupPath = path.join(GLOBAL_STORAGE, 'state.vscdb.backup');

let totalRestored = 0;
let totalSkipped = 0;

if (fs.existsSync(globalBackupPath)) {
  const result = restoreFromCursorDiskKV(globalCurrentPath, globalBackupPath, 'Global Storage');
  totalRestored += result.restored;
  totalSkipped += result.skipped;
} else {
  console.log('   ⚠️  No global backup found\n');
}

// Restore workspace storage
console.log('🔍 Restoring Workspace Storage...\n');

if (fs.existsSync(WORKSPACE_STORAGE)) {
  const workspaceDirs = fs.readdirSync(WORKSPACE_STORAGE, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  for (const workspaceId of workspaceDirs) {
    const workspacePath = path.join(WORKSPACE_STORAGE, workspaceId);
    const dbPath = path.join(workspacePath, 'state.vscdb');
    const backupPath = path.join(workspacePath, 'state.vscdb.backup');

    if (fs.existsSync(backupPath)) {
      const result = restoreFromCursorDiskKV(dbPath, backupPath, `Workspace ${workspaceId}`);
      totalRestored += result.restored;
      totalSkipped += result.skipped;
    }
  }
}

console.log('='.repeat(60));
console.log('\n📊 RESTORATION SUMMARY\n');
console.log(`Total items restored: ${totalRestored}`);
console.log(`Total items skipped (already exist): ${totalSkipped}`);
console.log('\n✅ Restoration complete!');
console.log('💡 Restart Cursor to see your chats\n');













