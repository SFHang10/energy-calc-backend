@echo off
echo ============================================
echo Cursor Cache Cleaner
echo ============================================
echo.
echo Make sure Cursor is COMPLETELY CLOSED first!
echo (Check Task Manager to be sure)
echo.
pause

echo.
echo Clearing caches...

if exist "%APPDATA%\Cursor\Cache" (
    rmdir /s /q "%APPDATA%\Cursor\Cache" 2>nul
    echo [OK] Cleared Cache folder
)

if exist "%APPDATA%\Cursor\Code Cache" (
    rmdir /s /q "%APPDATA%\Cursor\Code Cache" 2>nul
    echo [OK] Cleared Code Cache folder
)

if exist "%APPDATA%\Cursor\GPUCache" (
    rmdir /s /q "%APPDATA%\Cursor\GPUCache" 2>nul
    echo [OK] Cleared GPU Cache folder
)

echo.
echo ============================================
echo Done! Now:
echo 1. Restart Cursor
echo 2. Press Ctrl+Alt+' to open chat history
echo    OR click the history icon in the chat panel
echo ============================================
echo.
pause




