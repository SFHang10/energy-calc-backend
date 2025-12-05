/**
 * Export Cursor chat history from databases
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
  console.error('❌ better-sqlite3 not installed. Please run: npm install better-sqlite3');
  process.exit(1);
}

console.log('📤 Exporting Cursor Chat History\n');
console.log('='.repeat(60) + '\n');

const allChats = {
  global: { current: [], backup: [] },
  workspaces: {}
};

function extractChats(dbPath, isBackup = false) {
  if (!fs.existsSync(dbPath)) {
    return [];
  }

  const db = new Database(dbPath, { readonly: true });
  const chats = [];

  try {
    // Check ItemTable
    try {
      const items = db.prepare("SELECT * FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%conversation%' OR key LIKE '%message%' OR value LIKE '%chat%' OR value LIKE '%conversation%' OR value LIKE '%message%'").all();
      
      for (const item of items) {
        try {
          let value = item.value;
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch (e) {
              // Not JSON, keep as string
            }
          }
          
          chats.push({
            key: item.key,
            value: value,
            timestamp: item.timestamp || null
          });
        } catch (e) {
          // Skip items we can't parse
        }
      }
    } catch (e) {
      // Table might not exist or have different structure
    }

    // Check cursorDiskKV
    try {
      const items = db.prepare("SELECT * FROM cursorDiskKV WHERE key LIKE '%chat%' OR key LIKE '%conversation%' OR key LIKE '%message%' OR value LIKE '%chat%' OR value LIKE '%conversation%' OR value LIKE '%message%'").all();
      
      for (const item of items) {
        try {
          let value = item.value;
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch (e) {
              // Not JSON, keep as string
            }
          }
          
          chats.push({
            key: item.key,
            value: value,
            timestamp: item.timestamp || null
          });
        } catch (e) {
          // Skip items we can't parse
        }
      }
    } catch (e) {
      // Table might not exist
    }

    // Also try to get ALL items and filter for chat-related content
    try {
      const allItems = db.prepare("SELECT * FROM ItemTable").all();
      
      for (const item of allItems) {
        const keyLower = (item.key || '').toLowerCase();
        const valueStr = typeof item.value === 'string' ? item.value : JSON.stringify(item.value || '');
        const valueLower = valueStr.toLowerCase();
        
        // Look for chat-related patterns
        if (keyLower.includes('chat') || 
            keyLower.includes('conversation') ||
            keyLower.includes('message') ||
            keyLower.includes('prompt') ||
            keyLower.includes('response') ||
            valueLower.includes('"role"') ||
            valueLower.includes('"content"') ||
            valueLower.includes('"messages"') ||
            valueLower.includes('"conversation"')) {
          
          try {
            let value = item.value;
            if (typeof value === 'string') {
              try {
                value = JSON.parse(value);
              } catch (e) {
                // Not JSON
              }
            }
            
            // Avoid duplicates
            const exists = chats.some(c => c.key === item.key);
            if (!exists) {
              chats.push({
                key: item.key,
                value: value,
                timestamp: item.timestamp || null
              });
            }
          } catch (e) {
            // Skip
          }
        }
      }
    } catch (e) {
      // Skip
    }

  } finally {
    db.close();
  }

  return chats;
}

// Extract from global storage
console.log('📂 Extracting from Global Storage...\n');

const globalCurrentPath = path.join(GLOBAL_STORAGE, 'state.vscdb');
const globalBackupPath = path.join(GLOBAL_STORAGE, 'state.vscdb.backup');

if (fs.existsSync(globalCurrentPath)) {
  console.log('   ✅ Current database...');
  allChats.global.current = extractChats(globalCurrentPath, false);
  console.log(`   Found ${allChats.global.current.length} chat items\n`);
}

if (fs.existsSync(globalBackupPath)) {
  console.log('   ✅ Backup database...');
  allChats.global.backup = extractChats(globalBackupPath, true);
  console.log(`   Found ${allChats.global.backup.length} chat items\n`);
}

// Extract from workspace storage
console.log('📂 Extracting from Workspace Storage...\n');

if (fs.existsSync(WORKSPACE_STORAGE)) {
  const workspaceDirs = fs.readdirSync(WORKSPACE_STORAGE, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  for (const workspaceId of workspaceDirs) {
    const workspacePath = path.join(WORKSPACE_STORAGE, workspaceId);
    const dbPath = path.join(workspacePath, 'state.vscdb');
    const backupPath = path.join(workspacePath, 'state.vscdb.backup');

    if (fs.existsSync(dbPath) || fs.existsSync(backupPath)) {
      console.log(`   📁 Workspace: ${workspaceId}`);
      
      allChats.workspaces[workspaceId] = { current: [], backup: [] };
      
      if (fs.existsSync(dbPath)) {
        allChats.workspaces[workspaceId].current = extractChats(dbPath, false);
        console.log(`      Current: ${allChats.workspaces[workspaceId].current.length} items`);
      }
      
      if (fs.existsSync(backupPath)) {
        allChats.workspaces[workspaceId].backup = extractChats(backupPath, true);
        console.log(`      Backup: ${allChats.workspaces[workspaceId].backup.length} items`);
      }
      
      console.log('');
    }
  }
}

// Export to JSON
const outputDir = path.join(__dirname, 'cursor-chat-recovery');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, `chat-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(outputFile, JSON.stringify(allChats, null, 2), 'utf8');

console.log('='.repeat(60));
console.log('\n📊 EXPORT SUMMARY\n');
console.log(`Global Storage - Current: ${allChats.global.current.length} items`);
console.log(`Global Storage - Backup: ${allChats.global.backup.length} items`);

let totalWorkspace = 0;
for (const [workspaceId, data] of Object.entries(allChats.workspaces)) {
  const currentCount = data.current.length;
  const backupCount = data.backup.length;
  totalWorkspace += currentCount + backupCount;
  if (currentCount > 0 || backupCount > 0) {
    console.log(`Workspace ${workspaceId} - Current: ${currentCount}, Backup: ${backupCount}`);
  }
}

console.log(`\nTotal workspace items: ${totalWorkspace}`);
console.log(`\n✅ Exported to: ${outputFile}\n`);

// Also create a human-readable summary
const summaryFile = path.join(outputDir, 'chat-summary.txt');
let summary = 'CURSOR CHAT RECOVERY SUMMARY\n';
summary += '='.repeat(60) + '\n\n';
summary += `Export Date: ${new Date().toISOString()}\n\n`;

summary += 'GLOBAL STORAGE\n';
summary += '-'.repeat(60) + '\n';
summary += `Current Database: ${allChats.global.current.length} chat items\n`;
summary += `Backup Database: ${allChats.global.backup.length} chat items\n\n`;

if (allChats.global.current.length > 0) {
  summary += 'Current Database Keys:\n';
  allChats.global.current.forEach((chat, i) => {
    summary += `  ${i + 1}. ${chat.key}\n`;
  });
  summary += '\n';
}

if (allChats.global.backup.length > 0) {
  summary += 'Backup Database Keys:\n';
  allChats.global.backup.forEach((chat, i) => {
    summary += `  ${i + 1}. ${chat.key}\n`;
  });
  summary += '\n';
}

summary += 'WORKSPACE STORAGE\n';
summary += '-'.repeat(60) + '\n';

for (const [workspaceId, data] of Object.entries(allChats.workspaces)) {
  if (data.current.length > 0 || data.backup.length > 0) {
    summary += `\nWorkspace: ${workspaceId}\n`;
    summary += `  Current: ${data.current.length} items\n`;
    summary += `  Backup: ${data.backup.length} items\n`;
    
    if (data.current.length > 0) {
      summary += '  Current Keys:\n';
      data.current.forEach((chat, i) => {
        summary += `    ${i + 1}. ${chat.key}\n`;
      });
    }
    
    if (data.backup.length > 0) {
      summary += '  Backup Keys:\n';
      data.backup.forEach((chat, i) => {
        summary += `    ${i + 1}. ${chat.key}\n`;
      });
    }
  }
}

fs.writeFileSync(summaryFile, summary, 'utf8');
console.log(`✅ Summary saved to: ${summaryFile}\n`);

console.log('💡 Next Steps:');
console.log('   1. Review the exported JSON file to see your chat data');
console.log('   2. Check the summary file for a quick overview');
console.log('   3. If chats are in backup files, we can restore them\n');














