/**
 * Check for chats in different formats/locations
 * Including ItemTable, different key formats, etc.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const GLOBAL_STORAGE = path.join(APPDATA, 'Cursor', 'User', 'globalStorage');
const globalDbPath = path.join(GLOBAL_STORAGE, 'state.vscdb');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  console.error('❌ better-sqlite3 not installed');
  process.exit(1);
}

console.log('🔍 Checking All Chat Formats and Locations\n');
console.log('='.repeat(70) + '\n');

if (!fs.existsSync(globalDbPath)) {
  console.error('❌ Database not found');
  process.exit(1);
}

const db = new Database(globalDbPath, { readonly: true });

try {
  // 1. Check interactive.sessions (what Cursor uses to display chats)
  console.log('📊 Checking interactive.sessions...\n');
  const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
  if (sessionsItem) {
    try {
      const sessions = JSON.parse(sessionsItem.value);
      console.log(`   Found ${Object.keys(sessions).length} sessions in interactive.sessions\n`);
      
      Object.keys(sessions).forEach((sessionId, i) => {
        const session = sessions[sessionId];
        console.log(`   ${i + 1}. Session: ${sessionId.substring(0, 8)}...`);
        if (session.title) console.log(`      Title: ${session.title}`);
        if (session.createdAt) console.log(`      Created: ${new Date(session.createdAt).toLocaleString()}`);
        console.log('');
      });
    } catch (e) {
      console.log('   ⚠️  Could not parse interactive.sessions\n');
    }
  } else {
    console.log('   ❌ interactive.sessions not found\n');
  }
  
  // 2. Check composerData (actual chat content)
  console.log('📝 Checking composerData entries...\n');
  const composerData = db.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
  console.log(`   Found ${composerData.length} composerData entries\n`);
  
  // 3. Check for other chat-related keys in ItemTable
  console.log('🔍 Checking ItemTable for chat-related keys...\n');
  const itemTableKeys = db.prepare("SELECT key FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%session%' OR key LIKE '%conversation%' OR key LIKE '%composer%'").all();
  if (itemTableKeys.length > 0) {
    console.log(`   Found ${itemTableKeys.length} chat-related keys in ItemTable:\n`);
    itemTableKeys.forEach(row => {
      console.log(`   - ${row.key}`);
    });
    console.log('');
  } else {
    console.log('   No additional chat keys found in ItemTable\n');
  }
  
  // 4. Check cursorDiskKV for any chat-like patterns
  console.log('🔍 Checking cursorDiskKV for all chat patterns...\n');
  const allChatKeys = db.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE '%chat%' OR key LIKE '%session%' OR key LIKE '%conversation%' OR key LIKE '%composer%' OR key LIKE '%bubble%'").all();
  console.log(`   Found ${allChatKeys.length} chat-related keys in cursorDiskKV\n`);
  
  // Group by pattern
  const patterns = {};
  allChatKeys.forEach(row => {
    const pattern = row.key.split(':')[0];
    if (!patterns[pattern]) patterns[pattern] = [];
    patterns[pattern].push(row.key);
  });
  
  Object.keys(patterns).sort().forEach(pattern => {
    console.log(`   ${pattern}: ${patterns[pattern].length} entries`);
  });
  console.log('');
  
  // 5. Check for any recent/active sessions
  console.log('🔍 Checking for active/current sessions...\n');
  const activeKeys = db.prepare("SELECT key FROM ItemTable WHERE key LIKE '%active%' OR key LIKE '%current%' OR key LIKE '%recent%'").all();
  if (activeKeys.length > 0) {
    console.log(`   Found ${activeKeys.length} active/recent keys:\n`);
    activeKeys.forEach(row => {
      console.log(`   - ${row.key}`);
    });
    console.log('');
  }
  
  // Summary
  console.log('='.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log(`interactive.sessions entries: ${sessionsItem ? Object.keys(JSON.parse(sessionsItem.value)).length : 0}`);
  console.log(`composerData entries: ${composerData.length}`);
  console.log(`Total chat-related keys: ${allChatKeys.length}\n`);
  
  console.log('💡 If Cursor shows 4 chats but we found different numbers:');
  console.log('   - Cursor might be showing the current active chat + history');
  console.log('   - Some chats might be in a different format');
  console.log('   - Cursor might cache chats in memory\n');
  
} finally {
  db.close();
}











