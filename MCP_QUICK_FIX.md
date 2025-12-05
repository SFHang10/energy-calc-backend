# 🔧 Quick Fix: Getting MCP Tools Working

## Current Status
- ✅ MCP configuration file exists: `~/.cursor/mcp.json`
- ✅ MCP server setup script ran
- ❌ MCP tools not yet available in this conversation

## Solution: Restart Cursor

MCP tools need Cursor to be restarted to load properly. Here's what to do:

### Step 1: Restart Cursor
1. **Completely close Cursor** (not just the window)
   - On Windows: Right-click Cursor in taskbar → Quit
   - Or: File → Exit
2. **Wait 5 seconds**
3. **Reopen Cursor**

### Step 2: Start New Conversation
1. Click "New Agent" (or "New Chat")
2. MCP tools should now be available

### Step 3: Test MCP Tools
In the new conversation, try asking:
- "What MCP tools are available?"
- "Use MCP tools to fetch hand dryers from Wix"

## Alternative: Use API Script

If MCP still doesn't work after restart, you can use the direct API approach:

1. **Create `.env` file** in project root:
   ```
   WIX_API_KEY=your_api_key_here
   ```

2. **Run the fetch script**:
   ```bash
   node fetch-hand-dryers-from-wix.js
   ```

3. **Then run enrichment**:
   ```bash
   node enrich-hand-dryers-WITH-MCP-DATA.js --test
   ```

## Expected MCP Tools

When MCP is working, you should see:
- `mcp_wix-mcp-remote_CallWixSiteAPI`
- `mcp_wix-mcp-remote_ListWixSites`
- `mcp_wix-mcp-remote_SearchWixWDSDocumentation`
- And more...

---

**Next Step**: Restart Cursor and start a new conversation! 🚀

