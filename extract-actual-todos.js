/**
 * Extract actual todos/tasks from chat conversations
 * Focuses on real todos set in conversations, not data structure noise
 */

const fs = require('fs');
const path = require('path');

const chatExportPath = path.join(__dirname, 'cursor-chat-recovery', 'chat-export-2025-11-09T17-29-48-429Z.json');

console.log('📋 Extracting Actual Todos from Chat Conversations\n');
console.log('='.repeat(60) + '\n');

if (!fs.existsSync(chatExportPath)) {
  console.log('❌ Chat export file not found!');
  process.exit(1);
}

// Load chat data
const chatData = JSON.parse(fs.readFileSync(chatExportPath, 'utf8'));

const allTodos = [];

// Function to extract todos from conversation text
function extractTodosFromConversation(text) {
  const todos = [];
  
  if (!text || typeof text !== 'string') return todos;
  
  // Look for actual todo patterns in conversation text
  const todoPatterns = [
    // Markdown todos
    /- \[ \] (.+?)(?:\n|$)/g,
    /- \[x\] (.+?)(?:\n|$)/gi,
    /- \[X\] (.+?)(?:\n|$)/g,
    // TODO patterns
    /TODO:?\s*(.+?)(?:\n|$)/gi,
    /TASK:?\s*(.+?)(?:\n|$)/gi,
    /To-Do:?\s*(.+?)(?:\n|$)/gi,
    // Numbered task lists (only if they look like tasks)
    /\d+\.\s*(.+?)(?:\n|$)/g,
    // Bullet points that look like tasks (must have action words)
    /[-*]\s+(.+?)(?:\n|$)/g,
  ];
  
  // Action words that indicate a task
  const actionWords = ['create', 'add', 'update', 'fix', 'implement', 'build', 'write', 'make', 'do', 'complete', 'finish', 'test', 'check', 'verify', 'install', 'configure', 'set', 'change', 'modify', 'remove', 'delete', 'deploy', 'run', 'execute'];
  
  for (const pattern of todoPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const task = match[1]?.trim();
      if (task && task.length > 5 && task.length < 200) { // Reasonable length
        // Check if it looks like a task (has action word or is in todo format)
        const lowerTask = task.toLowerCase();
        const isTask = actionWords.some(word => lowerTask.startsWith(word)) || 
                      pattern.source.includes('TODO') || 
                      pattern.source.includes('TASK') ||
                      pattern.source.includes('\\[ \\]') ||
                      pattern.source.includes('\\[x\\]');
        
        if (isTask) {
          const isChecked = pattern.source.includes('\\[x\\]') || pattern.source.includes('\\[X\\]');
          todos.push({
            task: task,
            checked: isChecked,
            pattern: pattern.source
          });
        }
      }
    }
  }
  
  return todos;
}

// Function to search for todos in conversation messages
function searchConversationForTodos(value, source = 'unknown') {
  const todos = [];
  
  if (typeof value === 'string') {
    const extracted = extractTodosFromConversation(value);
    extracted.forEach(todo => {
      todos.push({
        ...todo,
        source: source
      });
    });
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => {
      todos.push(...searchConversationForTodos(item, `${source}[${index}]`));
    });
  } else if (value && typeof value === 'object') {
    // Look for message content, text, or conversation data
    const messageKeys = ['text', 'content', 'message', 'messages', 'conversation', 'result', 'response', 'output'];
    
    for (const [key, val] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      
      // If this looks like message content, extract todos
      if (messageKeys.some(mk => lowerKey.includes(mk))) {
        todos.push(...searchConversationForTodos(val, `${source}.${key}`));
      } else {
        // Recursively search
        todos.push(...searchConversationForTodos(val, `${source}.${key}`));
      }
    }
  }
  
  return todos;
}

// Process all chat data
console.log('📂 Processing chat conversations...\n');

// Process global storage
if (chatData.global && chatData.global.current) {
  chatData.global.current.forEach((item, index) => {
    const todos = searchConversationForTodos(item.value, `Global.Current[${index}]`);
    todos.forEach(todo => {
      allTodos.push({
        ...todo,
        location: 'Global Storage (Current)',
        key: item.key,
        timestamp: item.timestamp || null
      });
    });
  });
}

if (chatData.global && chatData.global.backup) {
  chatData.global.backup.forEach((item, index) => {
    const todos = searchConversationForTodos(item.value, `Global.Backup[${index}]`);
    todos.forEach(todo => {
      allTodos.push({
        ...todo,
        location: 'Global Storage (Backup)',
        key: item.key,
        timestamp: item.timestamp || null
      });
    });
  });
}

// Process workspace storage
if (chatData.workspaces) {
  for (const [workspaceId, workspaceData] of Object.entries(chatData.workspaces)) {
    if (workspaceData.current) {
      workspaceData.current.forEach((item, index) => {
        const todos = searchConversationForTodos(item.value, `Workspace.${workspaceId}.Current[${index}]`);
        todos.forEach(todo => {
          allTodos.push({
            ...todo,
            location: `Workspace ${workspaceId} (Current)`,
            key: item.key,
            timestamp: item.timestamp || null
          });
        });
      });
    }
    
    if (workspaceData.backup) {
      workspaceData.backup.forEach((item, index) => {
        const todos = searchConversationForTodos(item.value, `Workspace.${workspaceId}.Backup[${index}]`);
        todos.forEach(todo => {
          allTodos.push({
            ...todo,
            location: `Workspace ${workspaceId} (Backup)`,
            key: item.key,
            timestamp: item.timestamp || null
          });
        });
      });
    }
  }
}

// Remove duplicates (same task text)
const uniqueTodos = [];
const seenTasks = new Set();

allTodos.forEach(todo => {
  const taskKey = todo.task.toLowerCase().trim();
  if (!seenTasks.has(taskKey)) {
    seenTasks.add(taskKey);
    uniqueTodos.push(todo);
  }
});

// Sort by checked status (unchecked first)
uniqueTodos.sort((a, b) => {
  if (a.checked === b.checked) return 0;
  return a.checked ? 1 : -1;
});

console.log(`✅ Found ${uniqueTodos.length} unique todos\n`);

// Create output file
const outputPath = path.join(__dirname, 'CHAT_TODOS_LIST.md');
let output = '# All Todos from Chat History\n\n';
output += `**Extracted on:** ${new Date().toISOString()}\n`;
output += `**Total unique todos:** ${uniqueTodos.length}\n\n`;
output += '---\n\n';

// Group by location
const todosByLocation = {};
uniqueTodos.forEach(todo => {
  if (!todosByLocation[todo.location]) {
    todosByLocation[todo.location] = [];
  }
  todosByLocation[todo.location].push(todo);
});

// Write todos organized by location
for (const [location, todos] of Object.entries(todosByLocation)) {
  output += `## ${location}\n\n`;
  output += `**Count:** ${todos.length} todos\n\n`;
  
  // Separate checked and unchecked
  const unchecked = todos.filter(t => !t.checked);
  const checked = todos.filter(t => t.checked);
  
  if (unchecked.length > 0) {
    output += `### ⏳ Pending (${unchecked.length})\n\n`;
    unchecked.forEach((todo, index) => {
      output += `${index + 1}. ${todo.task}\n`;
      if (todo.source) {
        output += `   - Source: ${todo.source}\n`;
      }
      output += '\n';
    });
  }
  
  if (checked.length > 0) {
    output += `### ✅ Completed (${checked.length})\n\n`;
    checked.forEach((todo, index) => {
      output += `${index + 1}. ${todo.task}\n`;
      if (todo.source) {
        output += `   - Source: ${todo.source}\n`;
      }
      output += '\n';
    });
  }
  
  output += '---\n\n';
}

// Also create a simple checklist version
const checklistPath = path.join(__dirname, 'CHAT_TODOS_CHECKLIST.md');
let checklist = '# Chat Todos - Checklist\n\n';
checklist += `**Total todos:** ${uniqueTodos.length}\n\n`;
checklist += '---\n\n';

uniqueTodos.forEach((todo, index) => {
  const checkbox = todo.checked ? '[x]' : '[ ]';
  checklist += `${index + 1}. ${checkbox} ${todo.task}\n`;
  if (todo.location) {
    checklist += `   (From: ${todo.location})\n`;
  }
  checklist += '\n';
});

// Write files
fs.writeFileSync(outputPath, output, 'utf8');
fs.writeFileSync(checklistPath, checklist, 'utf8');

console.log('='.repeat(60));
console.log('\n✅ Extraction complete!\n');
console.log(`📄 Detailed todos: ${outputPath}`);
console.log(`📄 Checklist format: ${checklistPath}\n`);
console.log(`📊 Summary:`);
console.log(`   - Total todos found: ${uniqueTodos.length}`);
console.log(`   - Pending: ${uniqueTodos.filter(t => !t.checked).length}`);
console.log(`   - Completed: ${uniqueTodos.filter(t => t.checked).length}`);
console.log(`   - Locations: ${Object.keys(todosByLocation).length}\n`);











