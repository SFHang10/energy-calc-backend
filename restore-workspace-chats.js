/**
 * Restore workspace-specific chat databases
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const CURSOR_USER = path.join(APPDATA, 'Cursor', 'User');
const WORKSPACE_STORAGE = path.join(CURSOR_USER, 'workspaceStorage');

console.log('🔄 Restoring Workspace Chat Databases\n');
console.log('='.repeat(60) + '\n');
console.log('⚠️  Make sure Cursor is CLOSED!\n');

if (!fs.existsSync(WORKSPACE_STORAGE)) {
  console.log('❌ Workspace storage folder not found!\n');
  process.exit(1);
}

const workspaceDirs = fs.readdirSync(WORKSPACE_STORAGE, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name);

let restored = 0;

for (const workspaceId of workspaceDirs) {
  const workspacePath = path.join(WORKSPACE_STORAGE, workspaceId);
  const dbPath = path.join(workspacePath, 'state.vscdb');
  const backupPath = path.join(workspacePath, 'state.vscdb.backup');
  const backupPath2 = path.join(workspacePath, 'state.vscdb.backup2');

  if (fs.existsSync(backupPath)) {
    console.log(`📂 Restoring workspace: ${workspaceId}...`);
    
    // Backup current first
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath2);
      console.log(`   📦 Backed up current to: ${backupPath2}`);
    }
    
    // Restore backup
    fs.copyFileSync(backupPath, dbPath);
    console.log(`   ✅ Restored from backup\n`);
    restored++;
  }
}

console.log('='.repeat(60));
console.log(`\n✅ Restored ${restored} workspace databases!`);
console.log('💡 Restart Cursor to see your chats\n');












