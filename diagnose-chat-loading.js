/**
 * Diagnose why Cursor chats are not loading
 * Checks database, cache, workspace associations, and account IDs
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const CURSOR_DIR = path.join(APPDATA, 'Cursor');
const CURSOR_USER = path.join(CURSOR_DIR, 'User');
const GLOBAL_STORAGE = path.join(CURSOR_USER, 'globalStorage');
const WORKSPACE_STORAGE = path.join(CURSOR_USER, 'workspaceStorage');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  console.error('❌ better-sqlite3 not installed. Run: npm install better-sqlite3');
  process.exit(1);
}

console.log('🔍 Diagnosing Cursor Chat Loading Issues\n');
console.log('='.repeat(70) + '\n');

const issues = [];
const fixes = [];

// 1. Check if database exists
const globalDbPath = path.join(GLOBAL_STORAGE, 'state.vscdb');
if (!fs.existsSync(globalDbPath)) {
  issues.push('❌ Global database not found at: ' + globalDbPath);
} else {
  console.log('✅ Global database found\n');
  
  try {
    const db = new Database(globalDbPath, { readonly: true });
    
    // Check interactive.sessions
    const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
    let sessions = {};
    
    if (sessionsItem) {
      try {
        sessions = JSON.parse(sessionsItem.value);
      } catch (e) {
        issues.push('⚠️  interactive.sessions exists but cannot be parsed');
      }
    } else {
      issues.push('❌ interactive.sessions key not found in database');
      fixes.push('Run: node link-sessions-to-composer.js');
    }
    
    console.log(`📊 Sessions linked: ${Object.keys(sessions).length}`);
    
    // Check composerData
    const composerData = db.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
    console.log(`📊 Chat sessions in database: ${composerData.length}`);
    
    if (composerData.length === 0) {
      issues.push('❌ No chat sessions found in database');
    } else if (Object.keys(sessions).length === 0) {
      issues.push('⚠️  Chat sessions exist but are not linked to interactive.sessions');
      fixes.push('Run: node link-sessions-to-composer.js');
    }
    
    // Check bubbleId (messages)
    const bubbleIds = db.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'bubbleId:%'").all();
    console.log(`📊 Messages in database: ${bubbleIds.length}\n`);
    
    // Check account/user IDs
    console.log('🔍 Checking account/user IDs...\n');
    const accountKeys = db.prepare("SELECT key FROM ItemTable WHERE key LIKE '%account%' OR key LIKE '%user%' OR key LIKE '%auth%'").all();
    if (accountKeys.length > 0) {
      console.log(`Found ${accountKeys.length} account-related keys`);
      accountKeys.slice(0, 5).forEach(row => {
        console.log(`  - ${row.key}`);
      });
      if (accountKeys.length > 5) {
        console.log(`  ... and ${accountKeys.length - 5} more`);
      }
      console.log('');
    }
    
    db.close();
  } catch (e) {
    issues.push('❌ Error reading database: ' + e.message);
  }
}

// 2. Check cache directories
console.log('🔍 Checking cache directories...\n');
const cacheDirs = [
  path.join(CURSOR_DIR, 'Cache'),
  path.join(CURSOR_DIR, 'Code Cache'),
  path.join(CURSOR_DIR, 'GPUCache'),
];

let cacheSize = 0;
for (const cacheDir of cacheDirs) {
  if (fs.existsSync(cacheDir)) {
    try {
      const stats = fs.statSync(cacheDir);
      const files = fs.readdirSync(cacheDir, { withFileTypes: true });
      cacheSize += files.length;
    } catch (e) {
      // Skip if can't read
    }
  }
}

if (cacheSize > 1000) {
  issues.push('⚠️  Large cache detected (' + cacheSize + ' files) - may need clearing');
  fixes.push('Run: node clear-cursor-cache.js (make sure Cursor is closed first)');
}

console.log(`📊 Cache files: ${cacheSize}\n`);

// 3. Check workspace storage
console.log('🔍 Checking workspace storage...\n');
if (fs.existsSync(WORKSPACE_STORAGE)) {
  const workspaces = fs.readdirSync(WORKSPACE_STORAGE, { withFileTypes: true })
    .filter(d => d.isDirectory());
  
  console.log(`📊 Workspaces found: ${workspaces.length}`);
  
  let workspaceChats = 0;
  for (const workspace of workspaces) {
    const wsDbPath = path.join(WORKSPACE_STORAGE, workspace.name, 'state.vscdb');
    if (fs.existsSync(wsDbPath)) {
      try {
        const wsDb = new Database(wsDbPath, { readonly: true });
        const wsComposer = wsDb.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
        if (wsComposer.length > 0) {
          workspaceChats += wsComposer.length;
          console.log(`  - ${workspace.name}: ${wsComposer.length} chats`);
        }
        wsDb.close();
      } catch (e) {
        // Skip if can't read
      }
    }
  }
  
  if (workspaceChats > 0) {
    console.log(`📊 Total workspace chats: ${workspaceChats}\n`);
  } else {
    console.log('📊 No chats found in workspace storage\n');
  }
} else {
  issues.push('⚠️  Workspace storage directory not found');
}

// 4. Check if Cursor is running
console.log('🔍 Checking if Cursor is running...\n');
try {
  const { execSync } = require('child_process');
  const processes = execSync('tasklist /FI "IMAGENAME eq Cursor.exe" /FO CSV', { encoding: 'utf8' });
  if (processes.includes('Cursor.exe')) {
    issues.push('⚠️  Cursor appears to be running - close it before running fixes');
    fixes.push('Close Cursor completely before running cache clearing or database fixes');
  } else {
    console.log('✅ Cursor is not running (good for running fixes)\n');
  }
} catch (e) {
  console.log('⚠️  Could not check if Cursor is running\n');
}

// Summary
console.log('='.repeat(70));
console.log('\n📊 DIAGNOSIS SUMMARY\n');

if (issues.length === 0) {
  console.log('✅ No obvious issues found!');
  console.log('\n💡 If chats still don\'t load, try:');
  console.log('   1. Clear cache: node clear-cursor-cache.js');
  console.log('   2. Restart Cursor');
  console.log('   3. Check chat history panel (Alt+Ctrl+\')');
  console.log('   4. Try opening a different workspace');
} else {
  console.log(`Found ${issues.length} potential issue(s):\n`);
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });
  
  if (fixes.length > 0) {
    console.log('\n🔧 RECOMMENDED FIXES:\n');
    fixes.forEach((fix, i) => {
      console.log(`${i + 1}. ${fix}`);
    });
  }
}

console.log('\n' + '='.repeat(70));
console.log('\n💡 Next Steps:');
console.log('   1. Review the issues above');
console.log('   2. Run the recommended fixes');
console.log('   3. Restart Cursor after fixes');
console.log('   4. Check chat history panel (Alt+Ctrl+\')');
console.log('   5. If still not working, contact Cursor support\n');











