/**
 * Extract all todos/tasks from recovered chat data
 */

const fs = require('fs');
const path = require('path');

const chatExportPath = path.join(__dirname, 'cursor-chat-recovery', 'chat-export-2025-11-09T17-29-48-429Z.json');

console.log('📋 Extracting Todos from Chat History\n');
console.log('='.repeat(60) + '\n');

if (!fs.existsSync(chatExportPath)) {
  console.log('❌ Chat export file not found!');
  console.log(`   Looking for: ${chatExportPath}\n`);
  process.exit(1);
}

// Load chat data
const chatData = JSON.parse(fs.readFileSync(chatExportPath, 'utf8'));

const allTodos = [];

// Function to extract todos from text
function extractTodosFromText(text, source = 'unknown') {
  const todos = [];
  
  if (!text || typeof text !== 'string') return todos;
  
  // Look for various todo patterns
  const todoPatterns = [
    /- \[ \] (.+)/g,  // Markdown unchecked: - [ ] task
    /- \[x\] (.+)/gi,  // Markdown checked: - [x] task
    /- \[X\] (.+)/g,  // Markdown checked: - [X] task
    /TODO: (.+)/gi,   // TODO: task
    /TASK: (.+)/gi,   // TASK: task
    /To-Do: (.+)/gi,  // To-Do: task
    /To Do: (.+)/gi,  // To Do: task
    /\d+\. (.+)/g,    // Numbered list: 1. task
    /- (.+)/g,        // Bullet list: - task
    /\* (.+)/g,       // Bullet list: * task
  ];
  
  for (const pattern of todoPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const task = match[1]?.trim();
      if (task && task.length > 3) { // Filter out very short matches
        todos.push({
          task: task,
          source: source,
          pattern: pattern.source
        });
      }
    }
  }
  
  return todos;
}

// Function to search for todos in a value object
function searchForTodos(value, source = 'unknown', depth = 0) {
  const todos = [];
  
  if (depth > 10) return todos; // Prevent infinite recursion
  
  if (typeof value === 'string') {
    todos.push(...extractTodosFromText(value, source));
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => {
      todos.push(...searchForTodos(item, `${source}[${index}]`, depth + 1));
    });
  } else if (value && typeof value === 'object') {
    // Check for common todo-related keys
    const todoKeys = ['todo', 'todos', 'task', 'tasks', 'to-do', 'toDo', 'items', 'checklist'];
    
    for (const [key, val] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      
      // If key suggests todos, extract them
      if (todoKeys.some(tk => lowerKey.includes(tk))) {
        if (Array.isArray(val)) {
          val.forEach((item, index) => {
            if (typeof item === 'string') {
              todos.push({
                task: item,
                source: `${source}.${key}[${index}]`,
                type: 'array_item'
              });
            } else if (item && typeof item === 'object') {
              // Check for common todo object structures
              const taskText = item.task || item.text || item.content || item.title || item.name || JSON.stringify(item);
              if (taskText) {
                todos.push({
                  task: typeof taskText === 'string' ? taskText : JSON.stringify(taskText),
                  source: `${source}.${key}[${index}]`,
                  type: 'todo_object',
                  checked: item.checked || item.completed || item.done || false,
                  priority: item.priority || item.importance || null
                });
              }
            }
          });
        } else if (typeof val === 'string') {
          todos.push(...extractTodosFromText(val, `${source}.${key}`));
        } else {
          todos.push(...searchForTodos(val, `${source}.${key}`, depth + 1));
        }
      } else {
        // Recursively search other keys
        todos.push(...searchForTodos(val, `${source}.${key}`, depth + 1));
      }
    }
  }
  
  return todos;
}

// Process global storage chats
console.log('📂 Processing Global Storage chats...\n');

if (chatData.global && chatData.global.current) {
  chatData.global.current.forEach((item, index) => {
    const todos = searchForTodos(item.value, `Global.Current[${index}].${item.key}`);
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
    const todos = searchForTodos(item.value, `Global.Backup[${index}].${item.key}`);
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

// Process workspace storage chats
console.log('📂 Processing Workspace Storage chats...\n');

if (chatData.workspaces) {
  for (const [workspaceId, workspaceData] of Object.entries(chatData.workspaces)) {
    if (workspaceData.current) {
      workspaceData.current.forEach((item, index) => {
        const todos = searchForTodos(item.value, `Workspace.${workspaceId}.Current[${index}].${item.key}`);
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
        const todos = searchForTodos(item.value, `Workspace.${workspaceId}.Backup[${index}].${item.key}`);
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
    seenTasks.has(taskKey);
    uniqueTodos.push(todo);
  }
});

console.log(`✅ Found ${uniqueTodos.length} unique todos\n`);

// Create output file
const outputPath = path.join(__dirname, 'ALL_CHAT_TODOS.md');
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
  
  todos.forEach((todo, index) => {
    output += `### ${index + 1}. ${todo.task}\n\n`;
    output += `- **Source:** ${todo.source}\n`;
    if (todo.checked !== undefined) {
      output += `- **Status:** ${todo.checked ? '✅ Completed' : '⏳ Pending'}\n`;
    }
    if (todo.priority) {
      output += `- **Priority:** ${todo.priority}\n`;
    }
    if (todo.timestamp) {
      output += `- **Timestamp:** ${new Date(todo.timestamp).toISOString()}\n`;
    }
    output += `- **Key:** ${todo.key}\n\n`;
  });
  
  output += '---\n\n';
}

// Also create a simple list version
const simpleListPath = path.join(__dirname, 'CHAT_TODOS_SIMPLE_LIST.md');
let simpleList = '# Chat Todos - Simple List\n\n';
simpleList += `**Total todos:** ${uniqueTodos.length}\n\n`;
simpleList += '---\n\n';

uniqueTodos.forEach((todo, index) => {
  const status = todo.checked ? '✅' : '⏳';
  simpleList += `${index + 1}. ${status} ${todo.task}\n`;
  simpleList += `   (From: ${todo.location})\n\n`;
});

// Write files
fs.writeFileSync(outputPath, output, 'utf8');
fs.writeFileSync(simpleListPath, simpleList, 'utf8');

console.log('='.repeat(60));
console.log('\n✅ Extraction complete!\n');
console.log(`📄 Detailed todos: ${outputPath}`);
console.log(`📄 Simple list: ${simpleListPath}\n`);
console.log(`📊 Summary:`);
console.log(`   - Total todos found: ${uniqueTodos.length}`);
console.log(`   - Locations: ${Object.keys(todosByLocation).length}\n`);











