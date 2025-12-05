/**
 * Comprehensive search for ALL chats in ALL locations
 * Checks global storage, workspace storage, and all possible formats
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

console.log('🔍 Comprehensive Chat Search\n');
console.log('='.repeat(70) + '\n');

const allChats = [];

// 1. Check global storage
console.log('📂 Checking Global Storage...\n');
const globalDbPath = path.join(GLOBAL_STORAGE, 'state.vscdb');
if (fs.existsSync(globalDbPath)) {
  try {
    const db = new Database(globalDbPath, { readonly: true });
    
    // Check composerData
    const composerData = db.prepare("SELECT key, value FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
    console.log(`   Found ${composerData.length} composerData entries`);
    
    composerData.forEach(row => {
      const sessionId = row.key.replace('composerData:', '');
      const messageCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
      
      // Try to get title/preview
      let title = 'Chat';
      let preview = '';
      try {
        const data = JSON.parse(row.value);
        if (data.text) {
          const lines = data.text.split('\n').filter(l => l.trim().length > 0);
          if (lines.length > 0) {
            title = lines[0].substring(0, 50).trim();
            preview = lines[0].substring(0, 100);
          }
        }
      } catch (e) {}
      
      allChats.push({
        location: 'global',
        sessionId: sessionId,
        messageCount: messageCount.count,
        title: title,
        preview: preview
      });
    });
    
    // Check interactive.sessions for titles
    const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
    if (sessionsItem) {
      try {
        const sessions = JSON.parse(sessionsItem.value);
        console.log(`   Found ${Object.keys(sessions).length} sessions in interactive.sessions\n`);
        
        // Update titles from interactive.sessions
        Object.keys(sessions).forEach(sessionId => {
          const chat = allChats.find(c => c.sessionId === sessionId);
          if (chat && sessions[sessionId].title) {
            chat.title = sessions[sessionId].title;
            if (sessions[sessionId].createdAt) {
              chat.createdAt = sessions[sessionId].createdAt;
            }
          }
        });
      } catch (e) {}
    }
    
    db.close();
  } catch (e) {
    console.log(`   ⚠️  Error: ${e.message}\n`);
  }
}

// 2. Check ALL workspace storage databases
console.log('📂 Checking Workspace Storage...\n');
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
          console.log(`   📁 Workspace: ${workspace.name.substring(0, 30)}...`);
          console.log(`      Found ${composerData.length} chats\n`);
          
          composerData.forEach(row => {
            const sessionId = row.key.replace('composerData:', '');
            const messageCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
            
            let title = 'Chat';
            let preview = '';
            try {
              const data = JSON.parse(row.value);
              if (data.text) {
                const lines = data.text.split('\n').filter(l => l.trim().length > 0);
                if (lines.length > 0) {
                  title = lines[0].substring(0, 50).trim();
                  preview = lines[0].substring(0, 100);
                }
              }
            } catch (e) {}
            
            allChats.push({
              location: `workspace:${workspace.name.substring(0, 20)}`,
              sessionId: sessionId,
              messageCount: messageCount.count,
              title: title,
              preview: preview
            });
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
console.log('\n📊 COMPREHENSIVE SUMMARY\n');
console.log(`Total chats found: ${allChats.length}\n`);

if (allChats.length > 0) {
  console.log('All Chats Found:\n');
  allChats.forEach((chat, i) => {
    const dateStr = chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'Unknown';
    console.log(`${i + 1}. ${chat.title}`);
    console.log(`   Location: ${chat.location}`);
    console.log(`   Session ID: ${chat.sessionId.substring(0, 8)}...`);
    console.log(`   Messages: ${chat.messageCount}`);
    console.log(`   Created: ${dateStr}`);
    if (chat.preview) {
      console.log(`   Preview: ${chat.preview}...`);
    }
    console.log('');
  });
  
  const withMessages = allChats.filter(c => c.messageCount > 0);
  console.log(`\n✅ Chats with messages: ${withMessages.length}`);
  console.log(`⚠️  Chats without messages: ${allChats.length - withMessages.length}\n`);
  
  // Group by location
  const byLocation = {};
  allChats.forEach(chat => {
    if (!byLocation[chat.location]) byLocation[chat.location] = [];
    byLocation[chat.location].push(chat);
  });
  
  console.log('By Location:\n');
  Object.keys(byLocation).forEach(loc => {
    console.log(`   ${loc}: ${byLocation[loc].length} chats`);
  });
  console.log('');
} else {
  console.log('❌ No chats found in any location\n');
}

console.log('='.repeat(70));
console.log('\n💡 If Cursor shows more chats than we found:');
console.log('   - They might be in memory/cache (not yet saved)');
console.log('   - They might be in a different database format');
console.log('   - Cursor might be showing workspace-specific chats\n');





