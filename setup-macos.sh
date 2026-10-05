#!/bin/bash
# macOS 桌面快捷方式创建脚本

echo "========================================="
echo "  佳乐本地生活服务 - macOS 部署"
echo "========================================="

# 获取桌面路径
DESKTOP_PATH="$HOME/Desktop"

# 创建应用启动脚本
cat > "$DESKTOP_PATH/启动佳乐本地生活.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/.."
echo "正在启动佳乐本地生活服务..."
echo "访问地址：http://localhost:5000"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 检查 PM2 是否运行
if command -v pm2 &> /dev/null && pm2 describe jiale-local-life > /dev/null 2>&1; then
    echo "服务已在运行，打开浏览器..."
    open http://localhost:5000
else
    echo "首次启动，正在构建..."
    pnpm install
    pnpm build
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo "服务已启动，打开浏览器..."
    open http://localhost:5000
fi
EOF

chmod +x "$DESKTOP_PATH/启动佳乐本地生活.sh"

# 创建管理脚本
cat > "$DESKTOP_PATH/管理佳乐本地生活.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/.."

echo "========================================="
echo "  佳乐本地生活服务 - 管理菜单"
echo "========================================="
echo ""
echo "1) 查看服务状态"
echo "2) 查看日志"
echo "3) 重启服务"
echo "4) 停止服务"
echo "5) 启动服务"
echo "6) 打开浏览器"
echo "7) 退出"
echo ""
read -p "请选择操作 [1-7]: " choice

case $choice in
    1)
        echo ""
        pm2 status
        read -p "按回车继续..."
        ;;
    2)
        echo ""
        pm2 logs jiale-local-life --lines 50
        read -p "按回车继续..."
        ;;
    3)
        echo ""
        pm2 restart jiale-local-life
        echo "服务已重启"
        read -p "按回车继续..."
        ;;
    4)
        echo ""
        pm2 stop jiale-local-life
        echo "服务已停止"
        read -p "按回车继续..."
        ;;
    5)
        echo ""
        pm2 start jiale-local-life
        echo "服务已启动"
        read -p "按回车继续..."
        ;;
    6)
        open http://localhost:5000
        ;;
    7)
        exit 0
        ;;
    *)
        echo "无效选择"
        ;;
esac
EOF

chmod +x "$DESKTOP_PATH/管理佳乐本地生活.sh"

echo "✅ 已在桌面创建快捷方式："
echo "   - 启动佳乐本地生活.sh"
echo "   - 管理佳乐本地生活.sh"
echo ""
echo "双击「启动佳乐本地生活.sh」即可启动服务并打开浏览器"
