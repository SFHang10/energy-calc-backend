/**
 * Link ALL chats to interactive.sessions
 * This includes chats with and without messages
 * Cursor might be trying to show them even if they're empty
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

console.log('🔗 Linking All Chats to interactive.sessions\n');
console.log('='.repeat(70) + '\n');

if (!fs.existsSync(globalDbPath)) {
  console.error('❌ Database not found');
  process.exit(1);
}

// Create backup
const backupPath = globalDbPath + '.backup-' + Date.now();
console.log('📦 Creating backup...');
fs.copyFileSync(globalDbPath, backupPath);
console.log(`✅ Backup created: ${path.basename(backupPath)}\n`);

const db = new Database(globalDbPath);

try {
  // Get ALL composerData entries (including empty ones)
  const allComposerData = db.prepare("SELECT key, value FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
  console.log(`📊 Found ${allComposerData.length} chat sessions in database\n`);
  
  // Get current interactive.sessions
  const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
  let currentSessions = {};
  
  if (sessionsItem) {
    try {
      currentSessions = JSON.parse(sessionsItem.value);
      console.log(`📊 Current interactive.sessions has ${Object.keys(currentSessions).length} entries\n`);
    } catch (e) {
      console.log('⚠️  Could not parse interactive.sessions, will rebuild\n');
    }
  }
  
  // Process each composerData entry
  const newSessions = { ...currentSessions };
  let added = 0;
  let updated = 0;
  
  allComposerData.forEach(row => {
    const sessionId = row.key.replace('composerData:', '');
    
    // Check message count
    const messageCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
    
    // Try to extract title from composerData
    let title = 'Chat';
    let createdAt = Date.now();
    
    try {
      const data = JSON.parse(row.value);
      
      // Try to get title from text
      if (data.text) {
        const lines = data.text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 0) {
          const firstLine = lines[0].trim();
          if (firstLine.length > 0 && firstLine.length < 100) {
            title = firstLine;
          }
        }
      }
      
      // Try to get creation date
      if (data.createdAt) {
        createdAt = data.createdAt;
      } else if (data.timestamp) {
        createdAt = data.timestamp;
      }
    } catch (e) {
      // Use defaults
    }
    
    // Add or update session
    if (!newSessions[sessionId]) {
      newSessions[sessionId] = {
        id: sessionId,
        title: title,
        createdAt: createdAt,
        updatedAt: Date.now()
      };
      added++;
      console.log(`➕ Adding: ${title.substring(0, 40)}... (${messageCount.count} messages)`);
    } else {
      // Update title if missing or update timestamp
      if (!newSessions[sessionId].title || newSessions[sessionId].title === 'Chat') {
        newSessions[sessionId].title = title;
      }
      newSessions[sessionId].updatedAt = Date.now();
      updated++;
      console.log(`🔄 Updating: ${newSessions[sessionId].title.substring(0, 40)}... (${messageCount.count} messages)`);
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   - Sessions to add: ${added}`);
  console.log(`   - Sessions to update: ${updated}`);
  console.log(`   - Total sessions: ${Object.keys(newSessions).length}\n`);
  
  // Update interactive.sessions
  if (added > 0 || updated > 0) {
    console.log('💾 Updating interactive.sessions...');
    
    db.prepare("DELETE FROM ItemTable WHERE key = 'interactive.sessions'").run();
    db.prepare("INSERT INTO ItemTable (key, value) VALUES (?, ?)").run(
      'interactive.sessions',
      JSON.stringify(newSessions)
    );
    
    console.log('✅ interactive.sessions updated!\n');
  } else {
    console.log('✅ All sessions are already in interactive.sessions\n');
  }
  
  // Verify
  const verifyItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
  if (verifyItem) {
    const verifySessions = JSON.parse(verifyItem.value);
    console.log(`✅ Verification: interactive.sessions now has ${Object.keys(verifySessions).length} entries\n`);
    
    // Show all sessions
    console.log('📋 All Sessions in interactive.sessions:\n');
    Object.keys(verifySessions).forEach((sessionId, i) => {
      const session = verifySessions[sessionId];
      console.log(`   ${i + 1}. ${session.title || 'Chat'}`);
      console.log(`      ID: ${sessionId.substring(0, 8)}...`);
      if (session.createdAt) {
        console.log(`      Created: ${new Date(session.createdAt).toLocaleString()}`);
      }
      console.log('');
    });
  }
  
  console.log('='.repeat(70));
  console.log('\n✅ Complete!\n');
  console.log('💡 Next steps:');
  console.log('   1. Close Cursor completely');
  console.log('   2. Run: node clear-cursor-cache.js');
  console.log('   3. Restart Cursor');
  console.log('   4. All chats should now be accessible\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\n💡 Restoring from backup...');
  try {
    fs.copyFileSync(backupPath, globalDbPath);
    console.log('✅ Database restored from backup');
  } catch (e) {
    console.error('❌ Could not restore backup:', e.message);
  }
  process.exit(1);
} finally {
  db.close();
}





