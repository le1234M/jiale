# Jiale Local Life - One Click Deploy
# Run this script in PowerShell

Write-Host "============================================" -ForegroundColor Green
Write-Host "  Jiale Local Life - Deploy" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# Step 1: Check Node.js
Write-Host "Step 1: Check Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Please download from: https://nodejs.org/" -ForegroundColor Red
    pause
    exit
}

# Step 2: Install pnpm and PM2
Write-Host ""
Write-Host "Step 2: Install pnpm and PM2..." -ForegroundColor Yellow
npm install -g pnpm pm2

# Step 3: Install dependencies
Write-Host ""
Write-Host "Step 3: Install dependencies..." -ForegroundColor Yellow
pnpm install

# Step 4: Build project
Write-Host ""
Write-Host "Step 4: Build project..." -ForegroundColor Yellow
pnpm build

# Step 5: Create desktop shortcuts
Write-Host ""
Write-Host "Step 5: Create desktop shortcuts..." -ForegroundColor Yellow
$desktop = [Environment]::GetFolderPath("Desktop")

# Start script
$startScript = @"
@echo off
cd /d "%~dp0"
pm2 start ecosystem.config.js --env production
start http://localhost:5000
echo Service started!
pause
"@
$startScript | Out-File -FilePath "$desktop\Start-Jiale.bat" -Encoding ASCII

# Manage script
$manageScript = @"
@echo off
:menu
cls
echo ============================================
echo   Jiale Service Manager
echo ============================================
echo.
echo 1. View Status
echo 2. View Logs
echo 3. Restart
echo 4. Stop
echo 5. Exit
echo.
set /p choice=Enter your choice (1-5): 
if "%choice%"=="1" pm2 status
if "%choice%"=="2" pm2 logs jiale-local-life --lines 50
if "%choice%"=="3" pm2 restart jiale-local-life
if "%choice%"=="4" pm2 stop jiale-local-life
if "%choice%"=="5" exit
goto menu
"@
$manageScript | Out-File -FilePath "$desktop\Manage-Jiale.bat" -Encoding ASCII

Write-Host "Desktop shortcuts created!" -ForegroundColor Green

# Step 6: Start service
Write-Host ""
Write-Host "Step 6: Start service..." -ForegroundColor Yellow
pm2 start ecosystem.config.js --env production

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Deploy Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Service running at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Desktop shortcuts:" -ForegroundColor Yellow
Write-Host "  - Start-Jiale.bat (Start service)" -ForegroundColor Yellow
Write-Host "  - Manage-Jiale.bat (Manage service)" -ForegroundColor Yellow
Write-Host ""
pause
