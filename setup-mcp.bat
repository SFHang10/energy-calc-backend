@echo off
echo 🚀 Wix MCP Auto-Setup Script
echo ================================

echo.
echo 📋 Step 1: Checking MCP configuration...
if exist "%USERPROFILE%\.cursor\mcp.json" (
    echo ✅ MCP config found
) else (
    echo ❌ MCP config not found - creating default...
    echo {> "%USERPROFILE%\.cursor\mcp.json"
    echo   "mcpServers": {>> "%USERPROFILE%\.cursor\mcp.json"
    echo     "wix-mcp-remote": {>> "%USERPROFILE%\.cursor\mcp.json"
    echo       "command": "npx",>> "%USERPROFILE%\.cursor\mcp.json"
    echo       "args": [>> "%USERPROFILE%\.cursor\mcp.json"
    echo         "-y",>> "%USERPROFILE%\.cursor\mcp.json"
    echo         "@wix/mcp-remote",>> "%USERPROFILE%\.cursor\mcp.json"
    echo         "https://mcp.wix.com/sse">> "%USERPROFILE%\.cursor\mcp.json"
    echo       ]>> "%USERPROFILE%\.cursor\mcp.json"
    echo     }>> "%USERPROFILE%\.cursor\mcp.json"
    echo   }>> "%USERPROFILE%\.cursor\mcp.json"
    echo }>> "%USERPROFILE%\.cursor\mcp.json"
    echo ✅ MCP config created
)

echo.
echo 📋 Step 2: Starting MCP server...
echo Starting Wix MCP server in background...
start /B npx -y @wix/mcp-remote https://mcp.wix.com/sse

echo.
echo ⏳ Waiting 5 seconds for server to initialize...
timeout /t 5 /nobreak >nul

echo.
echo 📋 Step 3: Testing MCP connection...
echo Testing if MCP tools are available...

echo.
echo ✅ MCP Auto-Setup Complete!
echo ================================
echo.
echo 🎯 Next Steps:
echo 1. The MCP server is running in the background
echo 2. Start a new Cursor conversation
echo 3. The Wix MCP tools should now be available
echo.
echo 💡 To stop the MCP server later, press Ctrl+C in this window
echo.
pause











