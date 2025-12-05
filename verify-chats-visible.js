/**
 * Verify if chats are visible/accessible in the database
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

console.log('✅ Verifying Chat Visibility\n');
console.log('='.repeat(60) + '\n');

const db = new Database(path.join(GLOBAL_STORAGE, 'state.vscdb'), { readonly: true });

try {
  // Check interactive.sessions
  const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
  let sessions = {};
  
  if (sessionsItem) {
    try {
      sessions = JSON.parse(sessionsItem.value);
    } catch (e) {}
  }
  
  console.log(`📊 interactive.sessions: ${Object.keys(sessions).length} sessions\n`);
  
  // Check composerData
  const composerData = db.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
  console.log(`📊 composerData entries: ${composerData.length}\n`);
  
  // Check bubbleId (messages)
  const bubbleIds = db.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'bubbleId:%'").all();
  console.log(`📊 bubbleId entries (messages): ${bubbleIds.length}\n`);
  
  // Get a sample chat to verify it has content
  if (composerData.length > 0) {
    console.log('📂 Sample Chat Content:\n');
    const sampleKey = composerData[0].key;
    const sampleData = db.prepare("SELECT * FROM cursorDiskKV WHERE key = ?").get(sampleKey);
    
    if (sampleData) {
      try {
        const parsed = JSON.parse(sampleData.value);
        const sessionId = sampleKey.replace('composerData:', '');
        
        console.log(`Session ID: ${sessionId}`);
        console.log(`Has text: ${!!parsed.text}`);
        console.log(`Has richText: ${!!parsed.richText}`);
        console.log(`Has messages: ${!!parsed.messages || !!parsed.conversationMap}`);
        
        if (parsed.text) {
          const preview = parsed.text.substring(0, 100).replace(/\n/g, ' ');
          console.log(`Text preview: ${preview}...\n`);
        }
        
        // Check if this session is in interactive.sessions
        if (sessions[sessionId]) {
          console.log(`✅ Session ${sessionId} is linked in interactive.sessions\n`);
        } else {
          console.log(`⚠️  Session ${sessionId} is NOT linked in interactive.sessions\n`);
        }
      } catch (e) {
        console.log(`Could not parse: ${e.message}\n`);
      }
    }
  }
  
  // Summary
  console.log('='.repeat(60));
  console.log('\n📊 SUMMARY\n');
  console.log(`✅ Chat sessions in database: ${composerData.length}`);
  console.log(`✅ Messages in database: ${bubbleIds.length}`);
  console.log(`✅ Sessions linked: ${Object.keys(sessions).length}`);
  
  if (composerData.length > 0 && Object.keys(sessions).length > 0) {
    console.log('\n✅ Chats are in the database and properly linked!');
    console.log('💡 If Cursor still doesn\'t show them, it might be:');
    console.log('   1. A cache issue - try clearing Cursor cache');
    console.log('   2. A version incompatibility - Cursor might need to migrate the data');
    console.log('   3. Account/user ID mismatch - chats might be tied to old account\n');
  } else if (composerData.length > 0 && Object.keys(sessions).length === 0) {
    console.log('\n⚠️  Chats are in database but not linked!');
    console.log('💡 Run link-sessions-to-composer.js to fix this\n');
  } else {
    console.log('\n❌ No chats found in database\n');
  }

} finally {
  db.close();
}

console.log('='.repeat(60));
console.log('\n✅ Verification complete!\n');












