@echo off
chcp 65001 >nul
title 佳乐本地生活服务 - 一键部署

echo ============================================
echo   佳乐本地生活服务 - Windows 一键部署
echo ============================================
echo.
echo 本脚本将自动完成以下操作：
echo   1. 检查并安装 Node.js
echo   2. 安装 pnpm 和 PM2
echo   3. 安装项目依赖
echo   4. 构建项目
echo   5. 创建桌面快捷方式
echo   6. 启动服务
echo.
echo 按任意键开始部署...
pause >nul

:: 检查 Node.js
echo [1/6] 检查 Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo *** 未检测到 Node.js ***
    echo.
    echo 请先安装 Node.js 24：
    echo   1. 访问 https://nodejs.org/
    echo   2. 下载 LTS 版本
    echo   3. 双击安装
    echo   4. 重新运行此脚本
    echo.
    pause
    exit /b 1
)
echo    Node.js 已安装：
node -v
echo.

:: 检查 pnpm
echo [2/6] 检查 pnpm...
where pnpm >nul 2>nul
if errorlevel 1 (
    echo    正在安装 pnpm...
    npm install -g pnpm
) else (
    echo    pnpm 已安装
)
echo.

:: 检查 PM2
echo [3/6] 检查 PM2...
where pm2 >nul 2>nul
if errorlevel 1 (
    echo    正在安装 PM2...
    npm install -g pm2
) else (
    echo    PM2 已安装
)
echo.

:: 安装依赖
echo [4/6] 安装项目依赖...
cd /d "%~dp0"
call pnpm install
echo.

:: 构建项目
echo [5/6] 构建项目...
call pnpm build
echo.

:: 创建桌面快捷方式
echo [6/6] 创建桌面快捷方式...
set DESKTOP=%USERPROFILE%\Desktop

:: 启动脚本
(
echo @echo off
echo chcp 65001 ^>nul
echo title 佳乐本地生活服务
echo cd /d "%~dp0.."
echo echo 正在启动服务...
echo pm2 describe jiale-local-life ^>nul 2^>^&1
echo if errorlevel 1 ^(
echo     call pnpm build
echo     call pm2 start ecosystem.config.js --env production
echo     call pm2 save
echo ^)
echo echo.
echo echo ==========================================
echo echo   服务已启动！
echo echo   访问地址：http://localhost:5000
echo echo ==========================================
echo echo.
echo echo 按任意键打开浏览器...
echo pause ^>nul
echo start http://localhost:5000
) > "%DESKTOP%\启动佳乐本地生活.bat"

:: 管理脚本
(
echo @echo off
echo chcp 65001 ^>nul
echo title 佳乐本地生活 - 管理菜单
echo cd /d "%~dp0.."
echo :menu
echo cls
echo echo ==========================================
echo echo   佳乐本地生活服务 - 管理菜单
echo echo ==========================================
echo echo.
echo echo   1. 查看服务状态
echo echo   2. 查看实时日志
echo echo   3. 重启服务
echo echo   4. 停止服务
echo echo   5. 打开浏览器
echo echo   6. 退出
echo echo.
echo set /p choice=请选择操作 ^(1-6^)：
echo if "%%choice%%"=="1" pm2 status
echo if "%%choice%%"=="2" pm2 logs jiale-local-life
echo if "%%choice%%"=="3" ^( pm2 restart jiale-local-life ^& echo 服务已重启 ^)
echo if "%%choice%%"=="4" ^( pm2 stop jiale-local-life ^& echo 服务已停止 ^)
echo if "%%choice%%"=="5" start http://localhost:5000
echo if "%%choice%%"=="6" exit
echo echo.
echo pause
echo goto menu
) > "%DESKTOP%\管理佳乐本地生活.bat"

echo.
echo ============================================
echo   部署完成！
echo ============================================
echo.
echo 桌面已生成：
echo   - 启动佳乐本地生活.bat
echo   - 管理佳乐本地生活.bat
echo.
echo 下一步：
echo   1. 在项目目录创建 .env.production 文件
echo   2. 填入 Supabase 配置
echo   3. 双击桌面的「启动佳乐本地生活.bat」
echo.
echo 按任意键打开部署文档...
pause >nul
start COMPUTER_DEPLOY.md
