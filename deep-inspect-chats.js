/**
 * Deep inspection of chat data structure
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

console.log('🔍 Deep Inspection of Chat Data\n');
console.log('='.repeat(60) + '\n');

const currentDb = new Database(path.join(GLOBAL_STORAGE, 'state.vscdb'), { readonly: true });
const backupDb = new Database(path.join(GLOBAL_STORAGE, 'state.vscdb.backup'), { readonly: true });

try {
  // Check interactive.sessions in both
  console.log('📂 Checking interactive.sessions...\n');
  
  const currentSessions = currentDb.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
  const backupSessions = backupDb.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
  
  let currentSessionsObj = {};
  let backupSessionsObj = {};
  
  if (currentSessions) {
    try {
      currentSessionsObj = JSON.parse(currentSessions.value);
    } catch (e) {}
  }
  
  if (backupSessions) {
    try {
      backupSessionsObj = JSON.parse(backupSessions.value);
    } catch (e) {}
  }
  
  console.log(`Current interactive.sessions: ${Object.keys(currentSessionsObj).length} entries`);
  console.log(`Backup interactive.sessions: ${Object.keys(backupSessionsObj).length} entries\n`);
  
  // Check composerData in both
  console.log('📂 Checking composerData...\n');
  
  const currentComposer = currentDb.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
  const backupComposer = backupDb.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
  
  console.log(`Current composerData: ${currentComposer.length} entries`);
  console.log(`Backup composerData: ${backupComposer.length} entries\n`);
  
  // Get session IDs from composerData
  const currentSessionIds = new Set(currentComposer.map(item => {
    const match = item.key.match(/^composerData:(.+)$/);
    return match ? match[1] : null;
  }).filter(id => id !== null));
  
  const backupSessionIds = new Set(backupComposer.map(item => {
    const match = item.key.match(/^composerData:(.+)$/);
    return match ? match[1] : null;
  }).filter(id => id !== null));
  
  console.log(`Current session IDs: ${currentSessionIds.size}`);
  console.log(`Backup session IDs: ${backupSessionIds.size}\n`);
  
  // Check which sessions are in backup but not in current
  const missingInCurrent = [...backupSessionIds].filter(id => !currentSessionIds.has(id));
  const missingInSessions = [...backupSessionIds].filter(id => !currentSessionsObj[id]);
  
  console.log(`Sessions in backup but not in current composerData: ${missingInCurrent.length}`);
  console.log(`Sessions in backup but not in interactive.sessions: ${missingInSessions.length}\n`);
  
  if (missingInCurrent.length > 0) {
    console.log('⚠️  Missing composerData entries!');
    console.log(`   First few: ${missingInCurrent.slice(0, 5).join(', ')}\n`);
  }
  
  if (missingInSessions.length > 0) {
    console.log('⚠️  Missing interactive.sessions entries!');
    console.log(`   First few: ${missingInSessions.slice(0, 5).join(', ')}\n`);
  }
  
  // Check a sample composerData entry structure
  if (backupComposer.length > 0) {
    console.log('📂 Sample composerData structure from backup...\n');
    const sampleKey = backupComposer[0].key;
    const sampleData = backupDb.prepare("SELECT * FROM cursorDiskKV WHERE key = ?").get(sampleKey);
    
    if (sampleData) {
      try {
        const parsed = JSON.parse(sampleData.value);
        console.log(`Key: ${sampleKey}`);
        console.log(`Structure keys: ${Object.keys(parsed).join(', ')}`);
        if (parsed.messages) {
          console.log(`Messages count: ${parsed.messages.length}`);
        }
        if (parsed.sessionId) {
          console.log(`Session ID: ${parsed.sessionId}`);
        }
        console.log('');
      } catch (e) {
        console.log(`Could not parse: ${e.message}\n`);
      }
    }
  }
  
  // Check if there's a difference in the actual data
  console.log('📂 Comparing data sizes...\n');
  
  const currentComposerData = currentDb.prepare("SELECT * FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
  const backupComposerData = backupDb.prepare("SELECT * FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
  
  const currentKeys = new Set(currentComposerData.map(item => item.key));
  const backupKeys = new Set(backupComposerData.map(item => item.key));
  
  const missingKeys = [...backupKeys].filter(k => !currentKeys.has(k));
  
  if (missingKeys.length > 0) {
    console.log(`⚠️  Found ${missingKeys.length} composerData entries in backup that are NOT in current!`);
    console.log(`   First few: ${missingKeys.slice(0, 5).join(', ')}\n`);
  } else {
    console.log('✅ All composerData keys exist in current\n');
  }
  
  // Check data size differences
  for (const key of [...backupKeys].slice(0, 5)) {
    const backupItem = backupComposerData.find(item => item.key === key);
    const currentItem = currentComposerData.find(item => item.key === key);
    
    if (backupItem && currentItem) {
      if (backupItem.value.length !== currentItem.value.length) {
        console.log(`⚠️  Size difference for ${key}:`);
        console.log(`   Backup: ${backupItem.value.length} bytes`);
        console.log(`   Current: ${currentItem.value.length} bytes\n`);
      }
    }
  }

} finally {
  currentDb.close();
  backupDb.close();
}

console.log('='.repeat(60));
console.log('\n✅ Inspection complete!\n');












