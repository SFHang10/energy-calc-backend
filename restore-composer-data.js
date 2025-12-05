/**
 * Restore composerData (actual chat conversations) from backup
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

console.log('🔄 Restoring Composer Chat Data from Backup\n');
console.log('='.repeat(60) + '\n');
console.log('⚠️  Make sure Cursor is CLOSED!\n');

function restoreComposerData(currentPath, backupPath, label) {
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
    // Get all composerData keys from backup
    const backupComposerData = backupDb.prepare("SELECT * FROM ItemTable WHERE key LIKE 'composerData:%'").all();
    console.log(`   📊 Found ${backupComposerData.length} composerData entries in backup`);

    // Get all composerData keys from current
    const currentComposerData = currentDb.prepare("SELECT key FROM ItemTable WHERE key LIKE 'composerData:%'").all();
    const currentKeys = new Set(currentComposerData.map(item => item.key));
    console.log(`   📊 Found ${currentComposerData.length} composerData entries in current`);

    // Restore missing composerData
    for (const item of backupComposerData) {
      if (!currentKeys.has(item.key)) {
        try {
          currentDb.prepare("INSERT INTO ItemTable (key, value, timestamp) VALUES (?, ?, ?)")
            .run(item.key, item.value, item.timestamp || Date.now());
          restored++;
        } catch (e) {
          console.log(`   ⚠️  Could not restore ${item.key}: ${e.message}`);
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    // Also restore bubbleId keys (chat message bubbles)
    const backupBubbles = backupDb.prepare("SELECT * FROM ItemTable WHERE key LIKE 'bubbleId:%'").all();
    const currentBubbles = currentDb.prepare("SELECT key FROM ItemTable WHERE key LIKE 'bubbleId:%'").all();
    const currentBubbleKeys = new Set(currentBubbles.map(item => item.key));
    
    console.log(`   📊 Found ${backupBubbles.length} bubbleId entries in backup`);
    console.log(`   📊 Found ${currentBubbles.length} bubbleId entries in current`);

    for (const item of backupBubbles) {
      if (!currentBubbleKeys.has(item.key)) {
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

    // Also restore messageRequestContext keys
    const backupContexts = backupDb.prepare("SELECT * FROM ItemTable WHERE key LIKE 'messageRequestContext:%'").all();
    const currentContexts = currentDb.prepare("SELECT key FROM ItemTable WHERE key LIKE 'messageRequestContext:%'").all();
    const currentContextKeys = new Set(currentContexts.map(item => item.key));
    
    console.log(`   📊 Found ${backupContexts.length} messageRequestContext entries in backup`);

    for (const item of backupContexts) {
      if (!currentContextKeys.has(item.key)) {
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

    // Also restore any other chat-related keys
    const backupChatKeys = backupDb.prepare("SELECT * FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%conversation%' OR key LIKE '%session%'").all();
    const currentAllKeys = new Set(currentDb.prepare("SELECT key FROM ItemTable").all().map(i => i.key));

    for (const item of backupChatKeys) {
      if (!currentAllKeys.has(item.key)) {
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
  const result = restoreComposerData(globalCurrentPath, globalBackupPath, 'Global Storage');
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
      const result = restoreComposerData(dbPath, backupPath, `Workspace ${workspaceId}`);
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













