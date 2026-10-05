@echo off
chcp 65001 >nul
title Jiale Local Life - One Click Deploy

echo ============================================
echo   Jiale Local Life - One Click Deploy
echo ============================================
echo.

REM Check Node.js
echo [1/6] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

node -v
echo Node.js OK!
echo.

REM Check pnpm
echo [2/6] Checking pnpm...
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing pnpm...
    npm install -g pnpm
)

pnpm -v
echo pnpm OK!
echo.

REM Check PM2
echo [3/6] Checking PM2...
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing PM2...
    npm install -g pm2
)

pm2 -v
echo PM2 OK!
echo.

REM Install dependencies
echo [4/6] Installing dependencies...
call pnpm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies OK!
echo.

REM Build project
echo [5/6] Building project...
call pnpm build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Build OK!
echo.

REM Create desktop shortcuts
echo [6/6] Creating desktop shortcuts...

set "DESKTOP=%USERPROFILE%\Desktop"

REM Create start script
(
echo @echo off
echo chcp 65001 ^>nul
echo title Jiale Local Life
echo.
echo echo Starting service...
echo cd /d "%~dp0.."
echo set DEPLOY_RUN_PORT=5000
echo pm2 start ecosystem.config.js --env production
echo.
echo echo Service started! Opening browser...
echo timeout /t 3 /nobreak ^>nul
echo start http://localhost:5000
echo.
echo echo.
echo echo Service is running at: http://localhost:5000
echo echo Close this window to stop the service.
echo echo.
echo pause
) > "%DESKTOP%\Start-Jiale.bat"

REM Create manage script
(
echo @echo off
echo chcp 65001 ^>nul
echo title Jiale Local Life - Manager
echo.
echo :menu
echo echo ============================================
echo echo   Jiale Local Life - Manager
echo echo ============================================
echo echo.
echo echo 1. View Status
echo echo 2. View Logs
echo echo 3. Restart Service
echo echo 4. Stop Service
echo echo 5. Exit
echo echo.
echo set /p choice=Please select (1-5): 
echo.
echo if "%%choice%%"=="1" goto status
echo if "%%choice%%"=="2" goto logs
echo if "%%choice%%"=="3" goto restart
echo if "%%choice%%"=="4" goto stop
echo if "%%choice%%"=="5" goto exit
echo goto menu
echo.
echo :status
echo pm2 status
echo pause
echo goto menu
echo.
echo :logs
echo pm2 logs jiale-local-life --lines 50
echo pause
echo goto menu
echo.
echo :restart
echo pm2 restart jiale-local-life
echo pause
echo goto menu
echo.
echo :stop
echo pm2 stop jiale-local-life
echo pause
echo goto menu
echo.
echo :exit
echo exit
) > "%DESKTOP%\Manage-Jiale.bat"

echo.
echo ============================================
echo   Deploy Complete!
echo ============================================
echo.
echo Desktop shortcuts created:
echo   - Start-Jiale.bat
echo   - Manage-Jiale.bat
echo.
echo Next steps:
echo   1. Create .env.production file with your Supabase config
echo   2. Double-click Start-Jiale.bat on desktop
echo.
echo ============================================
echo.
pause
