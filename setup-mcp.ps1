# Wix MCP Auto-Setup Script (PowerShell)
Write-Host "🚀 Wix MCP Auto-Setup Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host "`n📋 Step 1: Checking MCP configuration..." -ForegroundColor Yellow
$mcpConfigPath = "$env:USERPROFILE\.cursor\mcp.json"

if (Test-Path $mcpConfigPath) {
    Write-Host "✅ MCP config found" -ForegroundColor Green
} else {
    Write-Host "❌ MCP config not found - creating default..." -ForegroundColor Red
    $mcpConfig = @{
        mcpServers = @{
            "wix-mcp-remote" = @{
                command = "npx"
                args = @("-y", "@wix/mcp-remote", "https://mcp.wix.com/sse")
            }
        }
    }
    $mcpConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath $mcpConfigPath -Encoding UTF8
    Write-Host "✅ MCP config created" -ForegroundColor Green
}

Write-Host "`n📋 Step 2: Starting MCP server..." -ForegroundColor Yellow
Write-Host "Starting Wix MCP server in background..." -ForegroundColor Cyan
Start-Process -FilePath "npx" -ArgumentList @("-y", "@wix/mcp-remote", "https://mcp.wix.com/sse") -WindowStyle Hidden

Write-Host "`n⏳ Waiting 5 seconds for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n✅ MCP Auto-Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. The MCP server is running in the background" -ForegroundColor White
Write-Host "2. Start a new Cursor conversation" -ForegroundColor White
Write-Host "3. The Wix MCP tools should now be available" -ForegroundColor White
Write-Host "`n💡 To stop the MCP server later, use Task Manager or restart Cursor" -ForegroundColor Yellow
Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")











