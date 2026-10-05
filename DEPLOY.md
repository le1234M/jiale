# 佳乐本地生活服务 - 部署指南

## 部署到自己的服务器

### 系统要求

- **Node.js** >= 20（推荐 24）
- **pnpm** >= 9
- **Linux / macOS** 服务器

### 1. 环境变量

在服务器上设置以下环境变量：

```bash
# 端口（默认 5000）
export PORT=5000

# Supabase 数据库连接（联系服务商获取）
export COZE_SUPABASE_URL=https://br-snug-dog-xxxxxxxx.supabase.co
export COZE_SUPABASE_ANON_KEY=xxxxx
export COZE_SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### 2. 部署步骤

```bash
# 上传项目到服务器
# 进入项目目录
cd /path/to/jiale-local-life

# 安装依赖
pnpm install

# 构建生产版本
pnpm run build

# 启动服务（守护进程建议使用 pm2）
PORT=5000 node dist/server.js
```

### 3. 使用 PM2 守护进程（推荐）

```bash
npm install -g pm2

# 启动
PORT=5000 pm2 start dist/server.js --name jiale-local-life

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs jiale-local-life

# 重启
pm2 restart jiale-local-life
```

### 4. Nginx 反向代理 + 域名（www.jlbdsh.top）

```nginx
server {
    listen 80;
    server_name www.jlbdsh.top jlbdsh.top;

    # HTTPS 配置（推荐用 certbot 自动申请）
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/www.jlbdsh.top/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/www.jlbdsh.top/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        # SSE 支持（流式输出需要）
        proxy_buffering off;
        proxy_cache off;
    }
}
```

### 5. 一键部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash
set -e

echo "=== 开始部署佳乐本地生活服务 ==="

# 拉取最新代码
# git pull origin main

# 安装依赖
pnpm install

# 构建
pnpm run build

# 重启服务
pm2 restart jiale-local-life || PORT=5000 pm2 start dist/server.js --name jiale-local-life

echo "=== 部署完成 ==="
pm2 status
```

### 6. 文件结构说明

```
.
├── dist/
│   └── server.js          # 生产服务端入口（已构建）
├── .next/                  # Next.js 构建产物
├── public/                 # 静态资源
├── package.json            # 依赖配置
├── DEPLOY.md               # 本部署指南
└── scripts/
    ├── build.sh            # 构建脚本
    └── start.sh            # 启动脚本
```

### 重要说明

- **Supabase 凭据**：需要联系管理员获取数据库连接信息
- **端口**：默认 5000，可在环境变量中修改
- **管理员密码**：`jiale-admin-2026`（可在 auth-manager.ts 中修改）
- **首次使用**：启动后访问 `http://你的IP:5000`，用管理员密码登录后台即可创建商家