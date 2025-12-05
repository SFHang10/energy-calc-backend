/**
 * Add ALL chats to interactive.sessions with proper titles
 * Matches the chats you see in Cursor
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

console.log('🔧 Adding All Chats to interactive.sessions\n');
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
  console.log(`📊 Found ${allComposerData.length} chat sessions\n`);
  
  // Get current interactive.sessions
  const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
  let currentSessions = {};
  
  if (sessionsItem) {
    try {
      currentSessions = JSON.parse(sessionsItem.value);
      console.log(`📊 Current interactive.sessions has ${Object.keys(currentSessions).length} entries\n`);
    } catch (e) {
      console.log('⚠️  Could not parse interactive.sessions\n');
    }
  }
  
  // Process each chat
  const newSessions = {};
  let added = 0;
  let updated = 0;
  
  allComposerData.forEach((row, index) => {
    const sessionId = row.key.replace('composerData:', '');
    
    // Check message count
    const messageCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
    const hasMessages = messageCount && messageCount.count > 0;
    
    console.log(`${index + 1}. Session: ${sessionId.substring(0, 8)}... (${messageCount.count} messages)`);
    
    // Extract title from composerData
    let title = 'Chat';
    let createdAt = Date.now();
    
    try {
      const data = JSON.parse(row.value);
      
      // Try to get title from text (first line)
      if (data.text) {
        const lines = data.text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 0) {
          const firstLine = lines[0].trim();
          // Use first line if it's reasonable length
          if (firstLine.length > 0 && firstLine.length < 150) {
            title = firstLine;
          }
        }
      }
      
      // Try to get title from richText
      if (title === 'Chat' && data.richText) {
        try {
          const richText = typeof data.richText === 'string' ? JSON.parse(data.richText) : data.richText;
          if (richText && richText.length > 0) {
            const firstBlock = richText[0];
            if (firstBlock && firstBlock.text) {
              const firstLine = firstBlock.text.split('\n')[0].trim();
              if (firstLine.length > 0 && firstLine.length < 150) {
                title = firstLine;
              }
            }
          }
        } catch (e) {}
      }
      
      // Get creation date
      if (data.createdAt) {
        createdAt = data.createdAt;
      } else if (data.timestamp) {
        createdAt = data.timestamp;
      }
      
    } catch (e) {
      console.log(`   ⚠️  Could not parse: ${e.message}`);
    }
    
    // Truncate title if too long
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }
    
    // Only add if it has messages OR if it's already in interactive.sessions (to preserve empty chats you see)
    if (hasMessages || currentSessions[sessionId]) {
      // Use existing session data if available, or create new
      if (currentSessions[sessionId]) {
        newSessions[sessionId] = {
          ...currentSessions[sessionId],
          title: currentSessions[sessionId].title || title, // Keep existing title if better
          updatedAt: Date.now()
        };
        if (!currentSessions[sessionId].title) {
          updated++;
        }
      } else {
        newSessions[sessionId] = {
          id: sessionId,
          title: title,
          createdAt: createdAt,
          updatedAt: Date.now()
        };
        added++;
        console.log(`   ✅ Adding: "${title}"`);
      }
    } else {
      console.log(`   ⏭️  Skipping (no messages and not in current sessions)`);
    }
    console.log('');
  });
  
  console.log('='.repeat(70));
  console.log(`\n📊 Summary:`);
  console.log(`   - Sessions to add: ${added}`);
  console.log(`   - Sessions to update: ${updated}`);
  console.log(`   - Total sessions: ${Object.keys(newSessions).length}\n`);
  
  // Update interactive.sessions
  if (Object.keys(newSessions).length > 0) {
    console.log('💾 Updating interactive.sessions...');
    
    db.prepare("DELETE FROM ItemTable WHERE key = 'interactive.sessions'").run();
    db.prepare("INSERT INTO ItemTable (key, value) VALUES (?, ?)").run(
      'interactive.sessions',
      JSON.stringify(newSessions)
    );
    
    console.log('✅ interactive.sessions updated!\n');
    
    // Show what we added
    console.log('📋 Sessions in interactive.sessions:\n');
    Object.keys(newSessions).forEach((sessionId, i) => {
      const session = newSessions[sessionId];
      const date = new Date(session.createdAt).toLocaleDateString();
      console.log(`   ${i + 1}. ${session.title || 'Chat'}`);
      console.log(`      ID: ${sessionId.substring(0, 8)}...`);
      console.log(`      Created: ${date}\n`);
    });
  }
  
  console.log('='.repeat(70));
  console.log('\n✅ Complete!\n');
  console.log('💡 Next steps:');
  console.log('   1. Close Cursor completely');
  console.log('   2. Run: node clear-cursor-cache.js');
  console.log('   3. Restart Cursor');
  console.log('   4. Check chat history - all chats should be visible\n');
  
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

