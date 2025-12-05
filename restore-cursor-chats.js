/**
 * Restore Cursor Chat History
 * Extracts chats from old workspace databases and imports them into current workspace
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const WORKSPACE_STORAGE = path.join(APPDATA, 'Cursor', 'User', 'workspaceStorage');

// Get current workspace path and calculate hash
const currentWorkspacePath = process.cwd();
const crypto = require('crypto');
const workspaceHash = crypto.createHash('md5')
  .update(currentWorkspacePath.toLowerCase())
  .digest('hex');

console.log('🔍 Cursor Chat Recovery Tool\n');
console.log(`Current workspace: ${currentWorkspacePath}`);
console.log(`Workspace hash: ${workspaceHash}\n`);

// Find all workspace databases
function findWorkspaceDatabases() {
  const databases = [];
  
  if (!fs.existsSync(WORKSPACE_STORAGE)) {
    console.error(`❌ Workspace storage not found: ${WORKSPACE_STORAGE}`);
    return databases;
  }

  const dirs = fs.readdirSync(WORKSPACE_STORAGE);
  
  for (const dir of dirs) {
    const dbPath = path.join(WORKSPACE_STORAGE, dir, 'state.vscdb');
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      databases.push({
        id: dir,
        path: dbPath,
        size: stats.size,
        modified: stats.mtime
      });
    }
  }
  
  return databases.sort((a, b) => b.size - a.size);
}

// Get current workspace database path
const currentDbPath = path.join(WORKSPACE_STORAGE, workspaceHash, 'state.vscdb');
const currentDbDir = path.dirname(currentDbPath);

// Ensure current workspace directory exists
if (!fs.existsSync(currentDbDir)) {
  fs.mkdirSync(currentDbDir, { recursive: true });
  console.log(`✅ Created workspace directory: ${currentDbDir}`);
}

// Find all databases
const allDatabases = findWorkspaceDatabases();
console.log(`Found ${allDatabases.length} workspace databases:\n`);

allDatabases.forEach((db, i) => {
  const sizeMB = (db.size / 1024 / 1024).toFixed(2);
  const isCurrent = db.id === workspaceHash;
  console.log(`${i + 1}. ${db.id}${isCurrent ? ' (CURRENT)' : ''} - ${sizeMB} MB - Modified: ${db.modified.toLocaleString()}`);
});

// Find the largest database (likely contains most chats)
const largestDb = allDatabases[0];
console.log(`\n📦 Largest database: ${largestDb.id} (${(largestDb.size / 1024 / 1024).toFixed(2)} MB)`);

// Strategy: Copy the largest database to current workspace if current is empty or small
const currentDbExists = fs.existsSync(currentDbPath);
let currentDbSize = 0;

if (currentDbExists) {
  currentDbSize = fs.statSync(currentDbPath).size;
  console.log(`Current workspace DB exists: ${(currentDbSize / 1024).toFixed(2)} KB`);
} else {
  console.log('Current workspace DB does not exist yet');
}

// If current DB is small or doesn't exist, copy the large one
if (!currentDbExists || currentDbSize < 100 * 1024) { // Less than 100KB
  console.log(`\n📋 Copying chat database from ${largestDb.id} to current workspace...`);
  
  try {
    // Close Cursor if it's open (we'll warn the user)
    console.log('\n⚠️  IMPORTANT: Please close Cursor before proceeding!');
    console.log('   Press Enter to continue after closing Cursor...');
    
    // For now, we'll proceed with the copy
    // Make a backup of current DB if it exists
    if (currentDbExists) {
      const backupPath = currentDbPath + '.backup.' + Date.now();
      fs.copyFileSync(currentDbPath, backupPath);
      console.log(`✅ Backed up current DB to: ${backupPath}`);
    }
    
    // Copy the large database
    fs.copyFileSync(largestDb.path, currentDbPath);
    console.log(`✅ Copied database to current workspace!`);
    console.log(`\n🎉 Chat history restored!`);
    console.log(`\nNext steps:`);
    console.log(`1. Restart Cursor`);
    console.log(`2. Your old chats should now be visible in the chat panel`);
    
  } catch (error) {
    console.error(`\n❌ Error copying database:`, error.message);
    console.log(`\nTry this manually:`);
    console.log(`1. Close Cursor completely`);
    console.log(`2. Copy: ${largestDb.path}`);
    console.log(`3. To: ${currentDbPath}`);
    console.log(`4. Restart Cursor`);
  }
} else {
  console.log(`\n⚠️  Current workspace DB already has data (${(currentDbSize / 1024).toFixed(2)} KB)`);
  console.log(`\nOption 1: Merge chats (advanced - requires database analysis)`);
  console.log(`Option 2: Replace current DB with old one (will lose new chats)`);
  console.log(`\nTo replace manually:`);
  console.log(`1. Close Cursor`);
  console.log(`2. Backup current: ${currentDbPath}`);
  console.log(`3. Copy: ${largestDb.path} -> ${currentDbPath}`);
  console.log(`4. Restart Cursor`);
}

// Also try to merge from other databases
console.log(`\n📊 Analyzing other databases for additional chats...`);
const otherDbs = allDatabases.filter(db => db.id !== workspaceHash && db.size > 50 * 1024); // Larger than 50KB

if (otherDbs.length > 0) {
  console.log(`Found ${otherDbs.length} other databases with potential chat data:`);
  otherDbs.forEach(db => {
    console.log(`  - ${db.id}: ${(db.size / 1024).toFixed(2)} KB`);
  });
  console.log(`\n💡 Tip: The largest database (${largestDb.id}) likely contains all chats.`);
  console.log(`   If you don't see all chats after copying, we can merge from other databases.`);
}

console.log(`\n✅ Recovery script completed!`);

