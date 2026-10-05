#!/bin/bash
set -e

echo "========================================="
echo "  佳乐本地生活服务 - 本地部署脚本"
echo "========================================="

# 检查 Node.js 版本
echo "检查 Node.js 版本..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 24 ]; then
    echo "❌ 错误：需要 Node.js 24 或更高版本"
    echo "当前版本：$(node -v)"
    echo "请使用 nvm 升级：nvm install 24"
    exit 1
fi
echo "✅ Node.js 版本：$(node -v)"

# 检查 pnpm
echo "检查 pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误：未找到 pnpm"
    echo "请安装：npm install -g pnpm"
    exit 1
fi
echo "✅ pnpm 版本：$(pnpm -v)"

# 安装依赖
echo ""
echo "安装依赖..."
pnpm install --frozen-lockfile

# 构建项目
echo ""
echo "构建项目..."
pnpm build

# 检查 PM2
echo ""
echo "检查 PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "️  PM2 未安装，正在安装..."
    npm install -g pm2
fi
echo "✅ PM2 版本：$(pm2 -v)"

# 配置环境变量
echo ""
echo "========================================="
echo "  配置环境变量"
echo "========================================="
echo ""
echo "请编辑 .env.production 文件，配置以下环境变量："
echo "  - COZE_SUPABASE_URL"
echo "  - COZE_SUPABASE_ANON_KEY"
echo "  - COZE_SUPABASE_SERVICE_ROLE_KEY"
echo "  - ADMIN_PASSWORD"
echo ""

if [ ! -f .env.production ]; then
    echo "创建 .env.production 模板..."
    cat > .env.production << 'EOF'
# Supabase 配置（必需）
COZE_SUPABASE_URL=your_supabase_url
COZE_SUPABASE_ANON_KEY=your_supabase_anon_key
COZE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 管理员密码（可选）
ADMIN_PASSWORD=jiale-admin-2026

# 服务配置
PORT=5000
HOSTNAME=0.0.0.0
NODE_ENV=production
EOF
    echo "✅ 已创建 .env.production 模板"
    echo "⚠️  请编辑 .env.production 文件填入实际值"
    exit 0
fi

# 启动服务
echo ""
echo "========================================="
echo "  启动服务"
echo "========================================="
echo ""

# 检查是否已运行
if pm2 describe jiale-local-life > /dev/null 2>&1; then
    echo "服务已在运行，正在重启..."
    pm2 restart jiale-local-life
else
    echo "首次启动服务..."
    pm2 start ecosystem.config.js --env production
fi

# 保存 PM2 配置
pm2 save

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "服务状态：pm2 status"
echo "查看日志：pm2 logs jiale-local-life"
echo "重启服务：pm2 restart jiale-local-life"
echo "停止服务：pm2 stop jiale-local-life"
echo ""
echo "访问地址：http://localhost:5000"
echo ""
