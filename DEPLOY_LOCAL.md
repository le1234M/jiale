# 佳乐本地生活服务 - 本地服务器部署指南

## 系统要求

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Node.js**: 24.x
- **包管理器**: pnpm 9.0+
- **进程管理**: PM2
- **反向代理**: Nginx（可选，用于生产环境）
- **数据库**: Supabase（云端）或 PostgreSQL 14+

## 快速部署

### 1. 安装依赖环境

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl git nginx

# 安装 Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2
npm install -g pm2
```

### 2. 克隆项目

```bash
git clone <项目地址>
cd <项目目录>
```

### 3. 运行部署脚本

```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. 配置环境变量

编辑 `.env.production` 文件：

```bash
nano .env.production
```

填入以下配置：

```env
# Supabase 配置（必需）
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
COZE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 管理员密码
ADMIN_PASSWORD=your-secure-password

# 服务配置
PORT=5000
HOSTNAME=0.0.0.0
NODE_ENV=production
```

### 5. 创建数据库表

在 Supabase SQL Editor 中执行以下建表语句：

```sql
-- 商家表
CREATE TABLE IF NOT EXISTS merchants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  quota_total INTEGER,
  quota_used INTEGER DEFAULT 0,
  note TEXT,
  disabled BOOLEAN DEFAULT false,
  category_l1 TEXT,
  category_l2 TEXT,
  store_name TEXT,
  selling_points TEXT,
  price_range TEXT,
  audience TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 账号表
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT DEFAULT 'douyin',
  account_id TEXT,
  is_default BOOLEAN DEFAULT false,
  form_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 内容日历表
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  notes TEXT,
  account_id UUID,
  form_data JSONB,
  generated_content JSONB,
  publish_url TEXT,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 数据指标表
CREATE TABLE IF NOT EXISTS content_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  account_id UUID,
  calendar_id UUID,
  content_type TEXT,
  title TEXT,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  completion_rate NUMERIC,
  group_buy_clicks INTEGER DEFAULT 0,
  group_buy_conversions INTEGER DEFAULT 0,
  engagement_rate NUMERIC,
  is_viral BOOLEAN DEFAULT false,
  viral_level TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 素材库表
CREATE TABLE IF NOT EXISTS material_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'self',
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- API Key 配置表
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  client_id TEXT,
  client_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 历史作品表
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content JSONB NOT NULL,
  form_data JSONB DEFAULT '{}',
  account_id UUID,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 6. 配置 Nginx（可选）

```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/jiale-local-life

# 编辑配置文件，替换域名
sudo nano /etc/nginx/sites-available/jiale-local-life

# 创建软链接
sudo ln -s /etc/nginx/sites-available/jiale-local-life /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 7. 配置防火墙

```bash
# 允许 HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# 或者直接允许 5000 端口（不使用 Nginx 时）
sudo ufw allow 5000/tcp
```

## 常用命令

### PM2 进程管理

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs jiale-local-life

# 重启服务
pm2 restart jiale-local-life

# 停止服务
pm2 stop jiale-local-life

# 删除服务
pm2 delete jiale-local-life

# 开机自启
pm2 startup
pm2 save
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新部署
./deploy.sh
```

## 故障排查

### 服务无法启动

```bash
# 查看 PM2 日志
pm2 logs jiale-local-life --lines 100

# 检查端口占用
lsof -i :5000

# 手动启动测试
node dist/server.js
```

### 数据库连接失败

```bash
# 检查环境变量
cat .env.production

# 测试 Supabase 连接
curl https://your-project.supabase.co/rest/v1/ -H "apikey: your-anon-key"
```

### Nginx 配置问题

```bash
# 测试配置
sudo nginx -t

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/jiale-local-life-error.log
```

## 安全建议

1. **修改默认管理员密码**
2. **使用 HTTPS**（Let's Encrypt 免费证书）
3. **配置防火墙**，只开放必要端口
4. **定期备份数据库**
5. **更新系统和依赖包**

## 性能优化

1. **使用 PM2 集群模式**（多核 CPU）
   ```javascript
   // ecosystem.config.js
   instances: 'max',  // 使用所有 CPU 核心
   exec_mode: 'cluster'
   ```

2. **配置 Nginx 缓存**
3. **启用 Gzip 压缩**
4. **使用 CDN 加速静态资源**

## 备份策略

```bash
# 备份数据库（Supabase 自带备份）
# 备份应用代码
git push

# 备份环境变量
cp .env.production .env.production.backup
```

## 监控

```bash
# 安装 PM2 监控
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 联系支持

如有问题，请检查：
1. PM2 日志：`pm2 logs`
2. Nginx 日志：`/var/log/nginx/`
3. 系统日志：`journalctl -u nginx`
