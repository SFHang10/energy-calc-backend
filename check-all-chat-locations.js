/**
 * Check all possible locations where Cursor stores chats
 * Including workspace storage and global storage
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

console.log('🔍 Checking All Chat Locations\n');
console.log('='.repeat(70) + '\n');

const allChats = [];

// 1. Check global storage
console.log('📂 Checking Global Storage...\n');
const globalDbPath = path.join(GLOBAL_STORAGE, 'state.vscdb');
if (fs.existsSync(globalDbPath)) {
  try {
    const db = new Database(globalDbPath, { readonly: true });
    const composerData = db.prepare("SELECT key, value FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
    
    console.log(`   Found ${composerData.length} chats in global storage`);
    
    composerData.forEach(row => {
      const sessionId = row.key.replace('composerData:', '');
      try {
        const data = JSON.parse(row.value);
        const messageCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
        
        allChats.push({
          location: 'global',
          sessionId: sessionId,
          hasMessages: messageCount.count > 0,
          messageCount: messageCount.count,
          preview: data.text ? data.text.substring(0, 50).replace(/\n/g, ' ') : 'No text'
        });
      } catch (e) {
        allChats.push({
          location: 'global',
          sessionId: sessionId,
          hasMessages: false,
          messageCount: 0,
          preview: 'Could not parse'
        });
      }
    });
    
    db.close();
  } catch (e) {
    console.log(`   ⚠️  Error: ${e.message}`);
  }
} else {
  console.log('   ❌ Global database not found');
}

// 2. Check workspace storage
console.log('\n📂 Checking Workspace Storage...\n');
if (fs.existsSync(WORKSPACE_STORAGE)) {
  const workspaces = fs.readdirSync(WORKSPACE_STORAGE, { withFileTypes: true })
    .filter(d => d.isDirectory());
  
  console.log(`   Found ${workspaces.length} workspaces\n`);
  
  workspaces.forEach(workspace => {
    const wsDbPath = path.join(WORKSPACE_STORAGE, workspace.name, 'state.vscdb');
    if (fs.existsSync(wsDbPath)) {
      try {
        const db = new Database(wsDbPath, { readonly: true });
        const composerData = db.prepare("SELECT key, value FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
        
        if (composerData.length > 0) {
          console.log(`   📁 Workspace: ${workspace.name.substring(0, 20)}...`);
          console.log(`      Found ${composerData.length} chats\n`);
          
          composerData.forEach(row => {
            const sessionId = row.key.replace('composerData:', '');
            try {
              const data = JSON.parse(row.value);
              const messageCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
              
              allChats.push({
                location: `workspace:${workspace.name.substring(0, 20)}`,
                sessionId: sessionId,
                hasMessages: messageCount.count > 0,
                messageCount: messageCount.count,
                preview: data.text ? data.text.substring(0, 50).replace(/\n/g, ' ') : 'No text'
              });
            } catch (e) {
              allChats.push({
                location: `workspace:${workspace.name.substring(0, 20)}`,
                sessionId: sessionId,
                hasMessages: false,
                messageCount: 0,
                preview: 'Could not parse'
              });
            }
          });
        }
        
        db.close();
      } catch (e) {
        // Skip if can't read
      }
    }
  });
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n📊 SUMMARY\n');
console.log(`Total chats found: ${allChats.length}\n`);

if (allChats.length > 0) {
  console.log('Chat Details:\n');
  allChats.forEach((chat, i) => {
    console.log(`${i + 1}. Location: ${chat.location}`);
    console.log(`   Session ID: ${chat.sessionId.substring(0, 8)}...`);
    console.log(`   Messages: ${chat.messageCount}`);
    console.log(`   Preview: ${chat.preview}...`);
    console.log('');
  });
  
  const withMessages = allChats.filter(c => c.hasMessages);
  console.log(`\n✅ Chats with messages: ${withMessages.length}`);
  console.log(`⚠️  Chats without messages: ${allChats.length - withMessages.length}\n`);
} else {
  console.log('❌ No chats found in any location\n');
}

console.log('='.repeat(70));
console.log('\n💡 If you see 4 chats in Cursor but we only found ' + allChats.length + ',');
console.log('   they might be stored in a different format or location.\n');











