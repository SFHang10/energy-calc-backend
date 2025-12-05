/**
 * Deep search for ALL chats in all possible locations and formats
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

console.log('🔍 Deep Search for ALL Chats\n');
console.log('='.repeat(70) + '\n');

const allFoundChats = [];

// 1. Check global storage thoroughly
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
      let createdAt = null;
      try {
        const data = JSON.parse(row.value);
        if (data.text) {
          const firstLine = data.text.split('\n')[0].trim();
          if (firstLine.length > 0 && firstLine.length < 100) {
            title = firstLine;
          }
        }
        if (data.createdAt) createdAt = data.createdAt;
      } catch (e) {}
      
      allFoundChats.push({
        location: 'global',
        sessionId: sessionId,
        title: title,
        messageCount: messageCount.count,
        createdAt: createdAt
      });
    });
    
    // Check interactive.sessions for titles
    const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
    if (sessionsItem) {
      try {
        const sessions = JSON.parse(sessionsItem.value);
        console.log(`   Found ${Object.keys(sessions).length} sessions in interactive.sessions`);
        
        // Update titles from interactive.sessions
        Object.keys(sessions).forEach(sessionId => {
          const chat = allFoundChats.find(c => c.sessionId === sessionId);
          if (chat && sessions[sessionId].title) {
            chat.title = sessions[sessionId].title;
            if (sessions[sessionId].createdAt) chat.createdAt = sessions[sessionId].createdAt;
          }
        });
      } catch (e) {}
    }
    
    db.close();
  } catch (e) {
    console.log(`   ⚠️  Error: ${e.message}`);
  }
}

// 2. Check ALL workspace storage databases
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
          console.log(`   📁 Workspace: ${workspace.name.substring(0, 30)}...`);
          console.log(`      Found ${composerData.length} chats\n`);
          
          composerData.forEach(row => {
            const sessionId = row.key.replace('composerData:', '');
            const messageCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
            
            // Try to get title
            let title = 'Chat';
            let createdAt = null;
            try {
              const data = JSON.parse(row.value);
              if (data.text) {
                const firstLine = data.text.split('\n')[0].trim();
                if (firstLine.length > 0 && firstLine.length < 100) {
                  title = firstLine;
                }
              }
              if (data.createdAt) createdAt = data.createdAt;
            } catch (e) {}
            
            allFoundChats.push({
              location: `workspace:${workspace.name.substring(0, 20)}`,
              sessionId: sessionId,
              title: title,
              messageCount: messageCount.count,
              createdAt: createdAt
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

// 3. Check for chats in ItemTable (different format)
console.log('\n📂 Checking ItemTable for chat data...\n');
if (fs.existsSync(globalDbPath)) {
  try {
    const db = new Database(globalDbPath, { readonly: true });
    
    // Look for any keys that might contain chat data
    const chatKeys = db.prepare("SELECT key FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%session%' OR key LIKE '%conversation%' OR key LIKE '%composer%' OR key LIKE '%interactive%'").all();
    
    // Check for session data in ItemTable
    const sessionKeys = chatKeys.filter(k => k.key.includes('session') || k.key.includes('interactive'));
    console.log(`   Found ${sessionKeys.length} session-related keys in ItemTable\n`);
    
    db.close();
  } catch (e) {}
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n📊 SUMMARY\n');
console.log(`Total chats found: ${allFoundChats.length}\n`);

if (allFoundChats.length > 0) {
  console.log('All Chats Found:\n');
  allFoundChats.forEach((chat, i) => {
    const dateStr = chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'Unknown';
    console.log(`${i + 1}. ${chat.title}`);
    console.log(`   Location: ${chat.location}`);
    console.log(`   Session ID: ${chat.sessionId.substring(0, 8)}...`);
    console.log(`   Messages: ${chat.messageCount}`);
    console.log(`   Created: ${dateStr}`);
    console.log('');
  });
  
  // Group by location
  const byLocation = {};
  allFoundChats.forEach(chat => {
    if (!byLocation[chat.location]) byLocation[chat.location] = [];
    byLocation[chat.location].push(chat);
  });
  
  console.log('By Location:\n');
  Object.keys(byLocation).forEach(loc => {
    console.log(`   ${loc}: ${byLocation[loc].length} chat(s)`);
  });
  console.log('');
  
  // Check if we need to add missing ones to interactive.sessions
  if (fs.existsSync(globalDbPath)) {
    const db = new Database(globalDbPath, { readonly: true });
    const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
    let currentSessions = {};
    
    if (sessionsItem) {
      try {
        currentSessions = JSON.parse(sessionsItem.value);
      } catch (e) {}
    }
    
    const globalChats = allFoundChats.filter(c => c.location === 'global' && c.messageCount > 0);
    const missing = globalChats.filter(c => !currentSessions[c.sessionId]);
    
    if (missing.length > 0) {
      console.log(`⚠️  Found ${missing.length} chat(s) with data but NOT in interactive.sessions:\n`);
      missing.forEach(chat => {
        console.log(`   - ${chat.title} (${chat.messageCount} messages)`);
      });
      console.log('\n💡 These need to be added to interactive.sessions\n');
    }
    
    db.close();
  }
} else {
  console.log('❌ No chats found in any location\n');
}

console.log('='.repeat(70));
console.log('\n💡 If you see 5 chats in Cursor but we found ' + allFoundChats.length + ',');
console.log('   they might be stored in a format we haven\'t checked yet.\n');

