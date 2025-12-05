# Setup Cursor Chat Backup Scheduled Task
# Run this script as Administrator to create a daily backup task

$TaskName = "CursorChatBackup"
$ScriptPath = Join-Path $PSScriptRoot "cursor-chat-backup.js"
$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source

if (-not $NodePath) {
    Write-Host "[ERROR] Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "[SETUP] Setting up Cursor Chat Backup Task..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Task Name: $TaskName"
Write-Host "  Script: $ScriptPath"
Write-Host "  Node: $NodePath"
Write-Host "  Schedule: Daily at 9:00 AM"
Write-Host ""

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "[WARNING] Task already exists. Removing old task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create the action
$Action = New-ScheduledTaskAction -Execute $NodePath -Argument "`"$ScriptPath`"" -WorkingDirectory $PSScriptRoot

# Create trigger - daily at 9 AM
$Trigger = New-ScheduledTaskTrigger -Daily -At 9am

# Create settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false

# Create principal (run as current user)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

# Register the task
try {
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Description "Daily backup of Cursor AI chat history"
    
    Write-Host ""
    Write-Host "[SUCCESS] Scheduled task created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The backup will run:" -ForegroundColor Cyan
    Write-Host "  - Every day at 9:00 AM"
    Write-Host "  - Backups stored in: $PSScriptRoot\cursor-chat-backups\"
    Write-Host "  - Keeps last 30 days of backups"
    Write-Host ""
    Write-Host "To run a backup now:" -ForegroundColor Yellow
    Write-Host "  node cursor-chat-backup.js"
    Write-Host ""
    Write-Host "To view/manage the task:" -ForegroundColor Yellow
    Write-Host "  Open Task Scheduler and look for '$TaskName'"
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "Failed to create scheduled task: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running PowerShell as Administrator and run this script again." -ForegroundColor Yellow
}

