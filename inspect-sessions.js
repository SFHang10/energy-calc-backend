/**
 * Inspect the actual content of interactive.sessions
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const CURSOR_USER = path.join(APPDATA, 'Cursor', 'User');
const GLOBAL_STORAGE = path.join(CURSOR_USER, 'globalStorage');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  console.error('❌ better-sqlite3 not installed');
  process.exit(1);
}

console.log('🔍 Inspecting interactive.sessions Content\n');
console.log('='.repeat(60) + '\n');

function inspectSessions(dbPath, label) {
  if (!fs.existsSync(dbPath)) {
    console.log(`   ❌ ${label}: Database not found\n`);
    return null;
  }

  const db = new Database(dbPath, { readonly: true });
  
  try {
    const sessions = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").all();
    
    if (sessions.length === 0) {
      console.log(`   ⚠️  ${label}: No interactive.sessions found\n`);
      return null;
    }
    
    const item = sessions[0];
    let value = item.value;
    
    try {
      value = JSON.parse(value);
    } catch (e) {
      // Not JSON
    }
    
    console.log(`   📊 ${label}:`);
    console.log(`      Key: ${item.key}`);
    console.log(`      Timestamp: ${item.timestamp || 'N/A'}`);
    console.log(`      Value type: ${typeof value}`);
    
    if (typeof value === 'object' && value !== null) {
      const keys = Object.keys(value);
      console.log(`      Number of session entries: ${keys.length}`);
      
      if (keys.length > 0) {
        console.log(`      First few session IDs: ${keys.slice(0, 5).join(', ')}`);
        
        // Check first session structure
        const firstKey = keys[0];
        const firstSession = value[firstKey];
        if (firstSession && typeof firstSession === 'object') {
          console.log(`      First session keys: ${Object.keys(firstSession).join(', ')}`);
        }
      }
    } else if (typeof value === 'string') {
      console.log(`      Value length: ${value.length} characters`);
      if (value.length < 500) {
        console.log(`      Value preview: ${value.substring(0, 200)}...`);
      }
    }
    
    console.log('');
    
    return { item, value, parsed: typeof value === 'object' };
  } finally {
    db.close();
  }
}

// Check current
console.log('📂 Current Global Storage:\n');
const current = inspectSessions(path.join(GLOBAL_STORAGE, 'state.vscdb'), 'Current');

// Check backup
console.log('📂 Backup Global Storage:\n');
const backup = inspectSessions(path.join(GLOBAL_STORAGE, 'state.vscdb.backup'), 'Backup');

// Compare
if (current && backup) {
  console.log('='.repeat(60));
  console.log('\n📊 COMPARISON\n');
  
  if (typeof current.value === 'object' && typeof backup.value === 'object') {
    const currentKeys = Object.keys(current.value);
    const backupKeys = Object.keys(backup.value);
    
    console.log(`Current sessions: ${currentKeys.length}`);
    console.log(`Backup sessions: ${backupKeys.length}`);
    
    const missingInCurrent = backupKeys.filter(k => !currentKeys.includes(k));
    const missingInBackup = currentKeys.filter(k => !backupKeys.includes(k));
    
    if (missingInCurrent.length > 0) {
      console.log(`\n⚠️  ${missingInCurrent.length} sessions in backup but NOT in current:`);
      console.log(`   ${missingInCurrent.slice(0, 10).join(', ')}${missingInCurrent.length > 10 ? '...' : ''}`);
      
      // Restore missing sessions
      console.log('\n🔄 Restoring missing sessions...');
      const currentDb = new Database(path.join(GLOBAL_STORAGE, 'state.vscdb'));
      const backupDb = new Database(path.join(GLOBAL_STORAGE, 'state.vscdb.backup'), { readonly: true });
      
      try {
        const backupItem = backupDb.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
        const currentItem = currentDb.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
        
        const backupValue = JSON.parse(backupItem.value);
        const currentValue = JSON.parse(currentItem.value);
        
        // Merge: add missing sessions from backup
        const merged = { ...currentValue };
        for (const key of missingInCurrent) {
          merged[key] = backupValue[key];
        }
        
        currentDb.prepare("UPDATE ItemTable SET value = ?, timestamp = ? WHERE key = 'interactive.sessions'")
          .run(JSON.stringify(merged), Date.now());
        
        console.log(`✅ Restored ${missingInCurrent.length} missing sessions!`);
        console.log('💡 Restart Cursor to see your chats\n');
      } finally {
        currentDb.close();
        backupDb.close();
      }
    } else if (missingInBackup.length > 0) {
      console.log(`\n✅ Current has ${missingInBackup.length} additional sessions not in backup`);
    } else {
      console.log('\n✅ Both databases have the same sessions');
      console.log('💡 If chats still don\'t appear, the issue might be:');
      console.log('   1. Cursor is filtering by account/user ID');
      console.log('   2. The session format changed after upgrade');
      console.log('   3. Cursor needs cache cleared');
    }
  } else {
    console.log('\n⚠️  Cannot compare - values are not objects');
  }
}













