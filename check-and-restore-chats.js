/**
 * Check what's missing and restore chat sessions specifically
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

console.log('🔍 Checking Chat Sessions in Databases\n');
console.log('='.repeat(60) + '\n');

function checkChatSessions(dbPath, label) {
  if (!fs.existsSync(dbPath)) {
    console.log(`   ❌ ${label}: Database not found`);
    return { sessions: [], count: 0 };
  }

  const db = new Database(dbPath, { readonly: true });
  const sessions = [];

  try {
    // Look for interactive.sessions key
    const interactiveSessions = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").all();
    
    for (const item of interactiveSessions) {
      try {
        let value = item.value;
        if (typeof value === 'string') {
          value = JSON.parse(value);
        }
        sessions.push({ key: item.key, value: value });
      } catch (e) {
        // Not JSON
      }
    }

    // Also look for any chat-related keys
    const chatKeys = db.prepare("SELECT key FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%session%' OR key LIKE '%conversation%' OR key LIKE '%interactive%'").all();
    
    console.log(`   📊 ${label}: Found ${chatKeys.length} chat-related keys`);
    if (interactiveSessions.length > 0) {
      console.log(`   ✅ Found interactive.sessions key`);
    }
  } catch (e) {
    console.log(`   ⚠️  Error reading ${label}: ${e.message}`);
  } finally {
    db.close();
  }

  return { sessions, count: sessions.length };
}

// Check current global storage
console.log('📂 Checking Current Global Storage...\n');
const globalCurrentPath = path.join(GLOBAL_STORAGE, 'state.vscdb');
const globalCurrent = checkChatSessions(globalCurrentPath, 'Current Global');

// Check backup global storage
console.log('\n📂 Checking Backup Global Storage...\n');
const globalBackupPath = path.join(GLOBAL_STORAGE, 'state.vscdb.backup');
const globalBackup = checkChatSessions(globalBackupPath, 'Backup Global');

// Compare and restore
console.log('\n' + '='.repeat(60));
console.log('\n📊 COMPARISON\n');
console.log(`Current: ${globalCurrent.count} interactive.sessions entries`);
console.log(`Backup: ${globalBackup.count} interactive.sessions entries`);

if (globalBackup.count > globalCurrent.count) {
  console.log('\n⚠️  Backup has more chat sessions! Restoring...\n');
  
  // Restore from backup
  const backupDb = new Database(globalBackupPath, { readonly: true });
  const currentDb = new Database(globalCurrentPath);
  
  try {
    // Get interactive.sessions from backup
    const backupSessions = backupDb.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").all();
    
    // Check what's in current
    const currentSessions = currentDb.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").all();
    
    if (backupSessions.length > 0 && currentSessions.length === 0) {
      // Current has no sessions, restore from backup
      console.log('   🔄 Restoring interactive.sessions from backup...');
      const backupItem = backupSessions[0];
      currentDb.prepare("INSERT INTO ItemTable (key, value, timestamp) VALUES (?, ?, ?)")
        .run(backupItem.key, backupItem.value, backupItem.timestamp || Date.now());
      console.log('   ✅ Restored interactive.sessions!');
    } else if (backupSessions.length > 0 && currentSessions.length > 0) {
      // Both have sessions, check if backup has more data
      try {
        const backupValue = JSON.parse(backupSessions[0].value);
        const currentValue = JSON.parse(currentSessions[0].value);
        
        if (typeof backupValue === 'object' && typeof currentValue === 'object') {
          // Merge: backup might have more sessions
          const backupKeys = Object.keys(backupValue);
          const currentKeys = Object.keys(currentValue);
          
          const missingKeys = backupKeys.filter(k => !currentKeys.includes(k));
          
          if (missingKeys.length > 0) {
            console.log(`   🔄 Found ${missingKeys.length} missing sessions in backup, merging...`);
            
            // Merge the values
            const merged = { ...currentValue, ...backupValue };
            currentDb.prepare("UPDATE ItemTable SET value = ?, timestamp = ? WHERE key = 'interactive.sessions'")
              .run(JSON.stringify(merged), Date.now());
            console.log(`   ✅ Merged ${missingKeys.length} sessions!`);
          } else {
            console.log('   ℹ️  Current has all sessions from backup');
          }
        } else {
          // Replace if backup seems more complete
          if (backupSessions[0].value.length > currentSessions[0].value.length) {
            console.log('   🔄 Backup has more data, replacing...');
            currentDb.prepare("UPDATE ItemTable SET value = ?, timestamp = ? WHERE key = 'interactive.sessions'")
              .run(backupSessions[0].value, backupSessions[0].timestamp || Date.now());
            console.log('   ✅ Replaced with backup data!');
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Could not parse session data: ${e.message}`);
        // Try replacing anyway if backup is larger
        if (backupSessions[0].value.length > currentSessions[0].value.length) {
          currentDb.prepare("UPDATE ItemTable SET value = ?, timestamp = ? WHERE key = 'interactive.sessions'")
            .run(backupSessions[0].value, backupSessions[0].timestamp || Date.now());
          console.log('   ✅ Replaced with backup data!');
        }
      }
    }
    
    // Also restore any other chat-related items from backup that are missing
    const allBackupItems = backupDb.prepare("SELECT * FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%session%' OR key LIKE '%conversation%' OR key LIKE '%interactive%'").all();
    const currentKeys = new Set(currentDb.prepare("SELECT key FROM ItemTable").all().map(i => i.key));
    
    let restoredCount = 0;
    for (const item of allBackupItems) {
      if (!currentKeys.has(item.key)) {
        try {
          currentDb.prepare("INSERT INTO ItemTable (key, value, timestamp) VALUES (?, ?, ?)")
            .run(item.key, item.value, item.timestamp || Date.now());
          restoredCount++;
        } catch (e) {
          // Skip
        }
      }
    }
    
    if (restoredCount > 0) {
      console.log(`   ✅ Restored ${restoredCount} additional chat-related items!`);
    }
    
  } finally {
    backupDb.close();
    currentDb.close();
  }
  
  console.log('\n✅ Restoration complete!');
  console.log('💡 Restart Cursor to see your chats\n');
} else {
  console.log('\n✅ Current database has all sessions (or backup has none)');
  console.log('💡 If chats still don\'t appear, try checking workspace storage\n');
}

// Also check workspace storage
console.log('\n📂 Checking Workspace Storage...\n');

if (fs.existsSync(WORKSPACE_STORAGE)) {
  const workspaceDirs = fs.readdirSync(WORKSPACE_STORAGE, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  for (const workspaceId of workspaceDirs) {
    const workspacePath = path.join(WORKSPACE_STORAGE, workspaceId);
    const dbPath = path.join(workspacePath, 'state.vscdb');
    const backupPath = path.join(workspacePath, 'state.vscdb.backup');

    if (fs.existsSync(dbPath) || fs.existsSync(backupPath)) {
      console.log(`\n   📁 Workspace: ${workspaceId}`);
      const current = checkChatSessions(dbPath, 'Current');
      const backup = checkChatSessions(backupPath, 'Backup');
      
      // Restore if needed
      if (backup.count > current.count && fs.existsSync(backupPath) && fs.existsSync(dbPath)) {
        console.log('   🔄 Restoring from backup...');
        const backupDb = new Database(backupPath, { readonly: true });
        const currentDb = new Database(dbPath);
        
        try {
          const backupSessions = backupDb.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").all();
          const currentSessions = currentDb.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").all();
          
          if (backupSessions.length > 0 && currentSessions.length === 0) {
            const backupItem = backupSessions[0];
            currentDb.prepare("INSERT INTO ItemTable (key, value, timestamp) VALUES (?, ?, ?)")
              .run(backupItem.key, backupItem.value, backupItem.timestamp || Date.now());
            console.log('   ✅ Restored!');
          } else if (backupSessions.length > 0 && currentSessions.length > 0) {
            // Merge
            try {
              const backupValue = JSON.parse(backupSessions[0].value);
              const currentValue = JSON.parse(currentSessions[0].value);
              const merged = { ...currentValue, ...backupValue };
              currentDb.prepare("UPDATE ItemTable SET value = ?, timestamp = ? WHERE key = 'interactive.sessions'")
                .run(JSON.stringify(merged), Date.now());
              console.log('   ✅ Merged!');
            } catch (e) {
              if (backupSessions[0].value.length > currentSessions[0].value.length) {
                currentDb.prepare("UPDATE ItemTable SET value = ?, timestamp = ? WHERE key = 'interactive.sessions'")
                  .run(backupSessions[0].value, backupSessions[0].timestamp || Date.now());
                console.log('   ✅ Replaced!');
              }
            }
          }
        } finally {
          backupDb.close();
          currentDb.close();
        }
      }
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n✅ Check and restore complete!\n');













