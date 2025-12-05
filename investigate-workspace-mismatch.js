/**
 * Investigate why chats are associated with different workspace context
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const globalDbPath = path.join(APPDATA, 'Cursor', 'User', 'globalStorage', 'state.vscdb');
const WORKSPACE_STORAGE = path.join(APPDATA, 'Cursor', 'User', 'workspaceStorage');

console.log('🔍 Investigating Workspace Context Mismatch\n');

// Current workspace info
const currentWorkspacePath = process.cwd();
const currentWorkspaceHash = crypto.createHash('md5')
  .update(currentWorkspacePath.toLowerCase())
  .digest('hex');

console.log('📂 Current Workspace:');
console.log(`  Path: ${currentWorkspacePath}`);
console.log(`  Hash: ${currentWorkspaceHash}\n`);

// The conversation ID from chats
const chatConversationId = '12a35db3-caec-4775-90dd-94e45151e9ba';
console.log(`💬 Chat Conversation ID: ${chatConversationId}\n`);

// Check if this conversation ID matches any workspace hash
console.log('🔍 Checking if conversation ID matches any workspace...\n');

if (fs.existsSync(WORKSPACE_STORAGE)) {
  const workspaceDirs = fs.readdirSync(WORKSPACE_STORAGE, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
  
  console.log(`Found ${workspaceDirs.length} workspace directories:\n`);
  
  if (workspaceDirs.includes(chatConversationId)) {
    console.log(`✅ Found workspace directory matching conversation ID: ${chatConversationId}\n`);
    
    // Check what's in that workspace
    const workspaceDbPath = path.join(WORKSPACE_STORAGE, chatConversationId, 'state.vscdb');
    if (fs.existsSync(workspaceDbPath)) {
      console.log('📊 Checking workspace database...\n');
      try {
        const db = new Database(workspaceDbPath, { readonly: true });
        const itemRows = db.prepare(`SELECT * FROM ItemTable WHERE key LIKE '%workspace%' OR key LIKE '%path%' OR key LIKE '%folder%'`).all();
        
        if (itemRows.length > 0) {
          console.log('Found workspace-related keys:\n');
          itemRows.forEach(row => {
            console.log(`  ${row.key}: ${row.value.substring(0, 200)}`);
          });
        }
        
        db.close();
      } catch (e) {
        console.log(`  Could not read workspace database: ${e.message}`);
      }
    }
  } else {
    console.log(`❌ No workspace directory found matching conversation ID\n`);
  }
  
  // List all workspace directories and their sizes
  console.log('\n📋 All workspace directories:\n');
  workspaceDirs.forEach(dir => {
    const dbPath = path.join(WORKSPACE_STORAGE, dir, 'state.vscdb');
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      const isCurrent = dir === currentWorkspaceHash;
      const isChatConversation = dir === chatConversationId;
      const marker = isCurrent ? '👉 CURRENT' : isChatConversation ? '💬 CHAT CONVERSATION' : '';
      console.log(`  ${dir} ${marker} - ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    }
  });
}

// Check globalStorage for any workspace path references
console.log('\n🔍 Checking globalStorage for workspace path references...\n');
try {
  const db = new Database(globalDbPath, { readonly: true });
  
  // Look for any keys that might contain workspace paths
  const allRows = db.prepare(`SELECT * FROM cursorDiskKV`).all();
  const pathReferences = allRows.filter(row => {
    const value = (row.value || '').toLowerCase();
    return value.includes('energy-cal-backend') || 
           value.includes('documents') ||
           value.includes('workspace') ||
           value.includes('file:///');
  });
  
  if (pathReferences.length > 0) {
    console.log(`Found ${pathReferences.length} rows with path references:\n`);
    pathReferences.slice(0, 10).forEach(row => {
      console.log(`  Key: ${row.key}`);
      const value = row.value || '';
      // Extract potential paths
      const pathMatches = value.match(/[c-z]:[\\\/][^"'\s]+/gi);
      if (pathMatches) {
        pathMatches.slice(0, 3).forEach(p => {
          console.log(`    Path: ${p}`);
        });
      }
      console.log('');
    });
  }
  
  // Check ItemTable for workspace info
  const itemRows = db.prepare(`SELECT * FROM ItemTable WHERE key LIKE '%workspace%' OR key LIKE '%folder%' OR key LIKE '%path%'`).all();
  if (itemRows.length > 0) {
    console.log('\n📋 ItemTable workspace references:\n');
    itemRows.forEach(row => {
      console.log(`  ${row.key}: ${row.value.substring(0, 300)}`);
    });
  }
  
  db.close();
} catch (e) {
  console.log(`Error: ${e.message}`);
}

// Try to reverse-engineer what workspace path the conversation ID might correspond to
console.log('\n🔍 Attempting to find original workspace path...\n');

// Check if there are any clues in the chat data itself
try {
  const db = new Database(globalDbPath, { readonly: true });
  
  // Get a sample chat bubble and look for file paths
  const sampleBubble = db.prepare(`SELECT * FROM cursorDiskKV WHERE key LIKE ? LIMIT 5`).all(`bubbleId:${chatConversationId}:%`);
  
  const foundPaths = new Set();
  sampleBubble.forEach(bubble => {
    try {
      const value = JSON.parse(bubble.value);
      const valueStr = JSON.stringify(value);
      
      // Look for file paths
      const pathMatches = valueStr.match(/[c-z]:[\\\/][^"'\s}]+/gi);
      if (pathMatches) {
        pathMatches.forEach(p => {
          // Normalize path
          const normalized = p.replace(/\\/g, '/').toLowerCase();
          if (normalized.includes('energy') || normalized.includes('documents')) {
            foundPaths.add(p);
          }
        });
      }
    } catch (e) {
      // Not JSON
    }
  });
  
  if (foundPaths.size > 0) {
    console.log('Found file paths in chat data:\n');
    Array.from(foundPaths).slice(0, 10).forEach(p => {
      console.log(`  ${p}`);
      
      // Try to extract workspace root
      const parts = p.split(/[\\\/]/);
      const energyIndex = parts.findIndex(part => part.toLowerCase().includes('energy'));
      if (energyIndex > 0) {
        const workspaceRoot = parts.slice(0, energyIndex + 1).join(path.sep);
        console.log(`    Possible workspace root: ${workspaceRoot}`);
        
        // Calculate hash for this path
        const hash = crypto.createHash('md5')
          .update(workspaceRoot.toLowerCase())
          .digest('hex');
        console.log(`    Hash: ${hash}`);
        if (hash === chatConversationId) {
          console.log(`    ✅ MATCH! This might be the original workspace path.`);
        }
      }
    });
  }
  
  db.close();
} catch (e) {
  console.log(`Error: ${e.message}`);
}

// Check if workspace hash calculation method might have changed
console.log('\n🔍 Testing workspace hash calculation methods...\n');

const testPaths = [
  currentWorkspacePath,
  currentWorkspacePath.toLowerCase(),
  currentWorkspacePath.toUpperCase(),
  currentWorkspacePath.replace(/\\/g, '/'),
  currentWorkspacePath.replace(/\//g, '\\'),
];

testPaths.forEach(testPath => {
  const hash = crypto.createHash('md5')
    .update(testPath.toLowerCase())
    .digest('hex');
  console.log(`  Path: ${testPath}`);
  console.log(`  Hash: ${hash}`);
  if (hash === chatConversationId) {
    console.log(`  ✅ MATCH! This path format produces the conversation ID hash.`);
  }
  console.log('');
});

console.log('✅ Investigation complete!');
















