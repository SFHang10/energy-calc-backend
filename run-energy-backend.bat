@echo off
setlocal EnableExtensions
title Energy Calculator Backend

cd /d "%~dp0"

echo.
echo  Energy Calculator Backend
echo  -------------------------
echo  Server:  http://localhost:4000
echo  Health:  http://localhost:4000/health
echo.
echo  Live Music (local test):
echo    Hub:  http://localhost:4000/HTMLS%%20GWM%%20GWB/live-music-hub-render.html
echo    Map:  http://localhost:4000/HTMLS%%20GWM%%20GWB/live-music-finder.html
echo.
echo  Press Ctrl+C to stop the server.
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found. Install Node or add it to PATH.
  pause
  exit /b 1
)

REM Open key pages after a short delay (server still starting)
start "" cmd /c "timeout /t 4 /nobreak >nul && start "" "http://localhost:4000/health" && start "" "http://localhost:4000/HTMLS%%20GWM%%20GWB/live-music-hub-render.html""

npm start
pause
