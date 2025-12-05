/**
 * Cursor Chat Auto-Backup Script
 * Automatically backs up Cursor chat history daily
 * Run via Windows Task Scheduler
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Configuration
const CURSOR_DATA_PATH = path.join(process.env.APPDATA, 'Cursor', 'User');
const BACKUP_DIR = path.join(__dirname, 'cursor-chat-backups');
const MAX_BACKUPS = 30; // Keep last 30 days of backups

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

function extractFromDatabase(dbPath) {
    const items = [];
    
    if (!fs.existsSync(dbPath)) {
        return items;
    }
    
    try {
        const db = new Database(dbPath, { readonly: true });
        
        // Get all items from ItemTable
        const rows = db.prepare('SELECT key, value FROM ItemTable').all();
        
        for (const row of rows) {
            // Look for chat-related keys
            if (row.key && (
                row.key.includes('chat') || 
                row.key.includes('composer') ||
                row.key.includes('aichat') ||
                row.key.includes('conversation')
            )) {
                items.push({
                    key: row.key,
                    value: row.value,
                    size: row.value ? row.value.length : 0
                });
            }
        }
        
        db.close();
    } catch (error) {
        log(`  ⚠️ Error reading ${dbPath}: ${error.message}`);
    }
    
    return items;
}

function runBackup() {
    log('🔄 Starting Cursor Chat Backup...');
    
    const backupData = {
        timestamp: new Date().toISOString(),
        hostname: require('os').hostname(),
        globalStorage: {
            current: [],
            backup: []
        },
        workspaceStorage: {}
    };
    
    // Backup Global Storage
    log('📂 Backing up Global Storage...');
    const globalPath = path.join(CURSOR_DATA_PATH, 'globalStorage');
    
    const globalCurrent = path.join(globalPath, 'state.vscdb');
    const globalBackup = path.join(globalPath, 'state.vscdb.backup');
    
    backupData.globalStorage.current = extractFromDatabase(globalCurrent);
    backupData.globalStorage.backup = extractFromDatabase(globalBackup);
    
    log(`   Current: ${backupData.globalStorage.current.length} items`);
    log(`   Backup: ${backupData.globalStorage.backup.length} items`);
    
    // Backup Workspace Storage
    log('📂 Backing up Workspace Storage...');
    const workspacePath = path.join(CURSOR_DATA_PATH, 'workspaceStorage');
    
    if (fs.existsSync(workspacePath)) {
        const workspaces = fs.readdirSync(workspacePath).filter(f => {
            const stat = fs.statSync(path.join(workspacePath, f));
            return stat.isDirectory();
        });
        
        for (const workspace of workspaces) {
            const wsCurrent = path.join(workspacePath, workspace, 'state.vscdb');
            const wsBackup = path.join(workspacePath, workspace, 'state.vscdb.backup');
            
            const currentItems = extractFromDatabase(wsCurrent);
            const backupItems = extractFromDatabase(wsBackup);
            
            if (currentItems.length > 0 || backupItems.length > 0) {
                backupData.workspaceStorage[workspace] = {
                    current: currentItems,
                    backup: backupItems
                };
                log(`   ${workspace}: ${currentItems.length} current, ${backupItems.length} backup`);
            }
        }
    }
    
    // Calculate totals
    let totalItems = backupData.globalStorage.current.length + backupData.globalStorage.backup.length;
    for (const ws of Object.values(backupData.workspaceStorage)) {
        totalItems += ws.current.length + ws.backup.length;
    }
    
    // Save backup
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const backupFile = path.join(BACKUP_DIR, `chat-backup-${date}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    log(`✅ Backup saved: ${backupFile}`);
    log(`📊 Total items backed up: ${totalItems}`);
    
    // Clean up old backups
    cleanOldBackups();
    
    // Create a latest.json symlink/copy for easy access
    const latestFile = path.join(BACKUP_DIR, 'latest.json');
    fs.copyFileSync(backupFile, latestFile);
    
    log('✅ Backup complete!');
    
    return { success: true, totalItems, backupFile };
}

function cleanOldBackups() {
    log('🧹 Cleaning old backups...');
    
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('chat-backup-') && f.endsWith('.json'))
        .map(f => ({
            name: f,
            path: path.join(BACKUP_DIR, f),
            time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // Newest first
    
    // Delete backups older than MAX_BACKUPS
    if (files.length > MAX_BACKUPS) {
        const toDelete = files.slice(MAX_BACKUPS);
        for (const file of toDelete) {
            fs.unlinkSync(file.path);
            log(`   Deleted old backup: ${file.name}`);
        }
    }
}

// Run the backup
try {
    const result = runBackup();
    process.exit(0);
} catch (error) {
    log(`❌ Backup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
}





