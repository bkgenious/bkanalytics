@echo off
echo ============================================
echo   Stopping Portfolio Development Processes
echo ============================================
echo.

:: Stop any Node.js processes running on port 3000
echo Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Stopping process with PID: %%a
    taskkill /F /PID %%a 2>nul
)

:: Kill any remaining node processes related to next
echo.
echo Stopping any remaining Node.js processes...
taskkill /F /IM node.exe 2>nul

echo.
echo ============================================
echo   All processes stopped successfully!
echo ============================================
echo.
pause
