@echo off
title Jiale Deploy

echo ============================================
echo   Jiale Local Life - Deploy
echo ============================================
echo.

echo Step 1: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
node -v
echo.

echo Step 2: Install pnpm and PM2
npm install -g pnpm pm2
echo.

echo Step 3: Install dependencies
pnpm install
echo.

echo Step 4: Build project
pnpm build
echo.

echo Step 5: Start service
pm2 start ecosystem.config.js --env production
echo.

echo ============================================
echo   Deploy Complete!
echo ============================================
echo.
echo Service running at: http://localhost:5000
echo.
pause
