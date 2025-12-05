@echo off
echo Backing up Energy Audit Widget files...
echo.

set BACKUP_DIR=energy-widget-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%

mkdir "%BACKUP_DIR%" 2>nul

echo Copying key files...
copy "energy-audit-widget.html" "%BACKUP_DIR%\" >nul
copy "ENERGY_AUDIT_WIDGET_GUIDE.md" "%BACKUP_DIR%\" >nul
copy "ENERGY_AUDIT_WIDGET_STATUS.md" "%BACKUP_DIR%\" >nul
copy "routes\product-widget.js" "%BACKUP_DIR%\" >nul
copy "routes\members.js" "%BACKUP_DIR%\" >nul
copy "routes\wix-integration.js" "%BACKUP_DIR%\" >nul

echo.
echo ✅ Backup complete!
echo Saved to folder: %BACKUP_DIR%
echo.
echo Key files backed up:
echo - energy-audit-widget.html
echo - ENERGY_AUDIT_WIDGET_GUIDE.md  
echo - ENERGY_AUDIT_WIDGET_STATUS.md
echo - Core route files
echo.
pause















