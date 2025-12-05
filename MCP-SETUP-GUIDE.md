# 🚀 Wix MCP Quick Setup Guide

## Problem
MCP tools not available in Cursor conversations, requiring manual troubleshooting every time.

## Solution
Use the automated setup scripts to quickly establish MCP connection.

## Quick Start

### Option 1: Batch Script (Windows)
```bash
# Run this in your project directory
setup-mcp.bat
```

### Option 2: PowerShell Script
```powershell
# Run this in PowerShell
.\setup-mcp.ps1
```

### Option 3: Manual Commands
```bash
# 1. Start MCP server
npx -y @wix/mcp-remote https://mcp.wix.com/sse

# 2. Wait 5 seconds, then start new Cursor conversation
```

## What the Scripts Do

1. **Check MCP Configuration** - Ensures `~/.cursor/mcp.json` exists with correct settings
2. **Start MCP Server** - Launches the Wix MCP server in background
3. **Wait for Initialization** - Gives server time to connect
4. **Provide Next Steps** - Clear instructions for what to do next

## MCP Configuration
The scripts ensure this configuration in `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "wix-mcp-remote": {
      "command": "npx",
      "args": [
        "-y",
        "@wix/mcp-remote",
        "https://mcp.wix.com/sse"
      ]
    }
  }
}
```

## Troubleshooting

### If MCP tools still not available:
1. **Restart Cursor** completely
2. **Start new conversation** (don't continue old ones)
3. **Check if MCP server is running** in background
4. **Run setup script again**

### If you get errors:
- Make sure you have Node.js installed
- Check your internet connection
- Try running the script as administrator

## Success Indicators
When MCP is working, you should see these tools available:
- `mcp_wix-mcp-remote_WixREADME`
- `mcp_wix-mcp-remote_SearchWixWDSDocumentation`
- `mcp_wix-mcp-remote_SearchWixRESTDocumentation`
- `mcp_wix-mcp-remote_CallWixSiteAPI`
- `mcp_wix-mcp-remote_ListWixSites`
- And more...

## Pro Tips
- **Always run setup script** before starting new Cursor conversations
- **Keep MCP server running** in background during development
- **Use new conversations** for MCP-dependent tasks
- **Bookmark this guide** for quick reference

---
*Created to solve recurring MCP connection issues* 🎯











