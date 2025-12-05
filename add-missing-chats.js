/**
 * Add any missing chat sessions to interactive.sessions
 * This ensures all chats with data are properly linked
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

console.log('🔧 Adding Missing Chat Sessions\n');
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
  // Get all composerData entries
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
  
  // Check each composerData entry
  const newSessions = { ...currentSessions };
  let added = 0;
  let updated = 0;
  
  allComposerData.forEach(row => {
    const sessionId = row.key.replace('composerData:', '');
    
    // Check if it has messages
    const messageCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
    
    if (messageCount && messageCount.count > 0) {
      // Check if session exists in interactive.sessions
      if (!newSessions[sessionId]) {
        // Try to extract title from composerData
        let title = 'Chat';
        try {
          const data = JSON.parse(row.value);
          if (data.text) {
            // Use first line of text as title
            const firstLine = data.text.split('\n')[0].trim();
            if (firstLine.length > 0 && firstLine.length < 100) {
              title = firstLine;
            }
          }
        } catch (e) {
          // Use default title
        }
        
        // Create new session entry
        newSessions[sessionId] = {
          id: sessionId,
          title: title,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        added++;
        console.log(`➕ Adding session: ${sessionId.substring(0, 8)}... (${messageCount.count} messages)`);
      } else {
        // Update existing session
        if (!newSessions[sessionId].updatedAt || newSessions[sessionId].updatedAt < Date.now() - 86400000) {
          newSessions[sessionId].updatedAt = Date.now();
          updated++;
        }
      }
    } else {
      console.log(`⚠️  Session ${sessionId.substring(0, 8)}... has no messages, skipping`);
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   - Sessions to add: ${added}`);
  console.log(`   - Sessions to update: ${updated}`);
  console.log(`   - Total sessions: ${Object.keys(newSessions).length}\n`);
  
  if (added > 0 || updated > 0) {
    // Update interactive.sessions
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
  }
  
  console.log('='.repeat(70));
  console.log('\n✅ Complete!\n');
  console.log('💡 Next steps:');
  console.log('   1. Close Cursor completely');
  console.log('   2. Run: node clear-cursor-cache.js');
  console.log('   3. Restart Cursor');
  console.log('   4. Check chat history panel\n');
  
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











