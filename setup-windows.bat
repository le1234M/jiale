@echo off
chcp 65001 >nul
echo =========================================
echo   佳乐本地生活服务 - Windows 部署
echo =========================================
echo.

:: 获取桌面路径
set DESKTOP=%USERPROFILE%\Desktop

:: 创建启动快捷方式
echo 创建桌面快捷方式...

:: 创建启动脚本
(
echo @echo off
echo chcp 65001 ^>nul
echo echo 正在启动佳乐本地生活服务...
echo echo 访问地址：http://localhost:5000
echo echo.
echo echo 按 Ctrl+C 停止服务
echo echo.
echo cd /d "%%~dp0.."
echo.
echo :: 检查 PM2 是否运行
echo pm2 describe jiale-local-life ^>nul 2^>^&1
echo if errorlevel 1 ^(
echo     echo 首次启动，正在构建...
echo     call pnpm install
echo     call pnpm build
echo     call pm2 start ecosystem.config.js --env production
echo     call pm2 save
echo     echo 服务已启动
echo ^) else ^(
echo     echo 服务已在运行
echo ^)
echo.
echo echo 打开浏览器...
echo start http://localhost:5000
echo.
echo pause
) > "%DESKTOP%\启动佳乐本地生活.bat"

:: 创建管理脚本
(
echo @echo off
echo chcp 65001 ^>nul
echo cd /d "%%~dp0.."
echo echo =========================================
echo echo   佳乐本地生活服务 - 管理菜单
echo echo =========================================
echo echo.
echo echo 1^) 查看服务状态
echo echo 2^) 查看日志
echo echo 3^) 重启服务
echo echo 4^) 停止服务
echo echo 5^) 启动服务
echo echo 6^) 打开浏览器
echo echo 7^) 退出
echo echo.
echo set /p choice=请选择操作 [1-7]: 
echo.
echo if "%%choice%%"=="1" pm2 status ^& pause
echo if "%%choice%%"=="2" pm2 logs jiale-local-life --lines 50 ^& pause
echo if "%%choice%%"=="3" pm2 restart jiale-local-life ^& echo 服务已重启 ^& pause
echo if "%%choice%%"=="4" pm2 stop jiale-local-life ^& echo 服务已停止 ^& pause
echo if "%%choice%%"=="5" pm2 start jiale-local-life ^& echo 服务已启动 ^& pause
echo if "%%choice%%"=="6" start http://localhost:5000
echo if "%%choice%%"=="7" exit
) > "%DESKTOP%\管理佳乐本地生活.bat"

echo.
echo ✅ 已在桌面创建快捷方式：
echo    - 启动佳乐本地生活.bat
echo    - 管理佳乐本地生活.bat
echo.
echo 双击「启动佳乐本地生活.bat」即可启动服务并打开浏览器
echo.
pause
