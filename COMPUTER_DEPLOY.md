# 佳乐本地生活服务 - 电脑部署指南

## 快速开始

### Windows 系统

1. **安装环境**
   - 下载 Node.js 24: https://nodejs.org/
   - 打开 PowerShell，运行：
     ```powershell
     npm install -g pnpm pm2
     ```

2. **部署项目**
   - 将项目文件夹复制到电脑任意位置（如 `D:\jiale-local-life`）
   - 双击运行 `setup-windows.bat`
   - 桌面会生成快捷方式

3. **配置环境变量**
   - 在项目目录创建 `.env.production` 文件
   - 填入 Supabase 配置（见下方）

4. **启动服务**
   - 双击桌面的「启动佳乐本地生活.bat」
   - 浏览器会自动打开 http://localhost:5000

### macOS 系统

1. **安装环境**
   ```bash
   # 安装 Homebrew（如果没有）
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # 安装 Node.js 24
   brew install node@24
   
   # 安装 pnpm 和 PM2
   npm install -g pnpm pm2
   ```

2. **部署项目**
   - 将项目文件夹复制到电脑（如 `~/jiale-local-life`）
   - 打开终端，运行：
     ```bash
     cd ~/jiale-local-life
     chmod +x setup-macos.sh
     ./setup-macos.sh
     ```
   - 桌面会生成快捷方式

3. **配置环境变量**
   - 在项目目录创建 `.env.production` 文件
   - 填入 Supabase 配置（见下方）

4. **启动服务**
   - 双击桌面的「启动佳乐本地生活.sh」
   - 浏览器会自动打开 http://localhost:5000

### Linux 系统

1. **安装环境**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
   sudo apt install -y nodejs
   npm install -g pnpm pm2
   ```

2. **部署项目**
   - 将项目文件夹复制到电脑（如 `~/jiale-local-life`）
   - 打开终端，运行：
     ```bash
     cd ~/jiale-local-life
     chmod +x setup-linux.sh
     ./setup-linux.sh
     ```
   - 桌面会生成快捷方式

3. **配置环境变量**
   - 在项目目录创建 `.env.production` 文件
   - 填入 Supabase 配置（见下方）

4. **启动服务**
   - 双击桌面的「佳乐本地生活服务」图标
   - 浏览器会自动打开 http://localhost:5000

## 环境变量配置

在项目根目录创建 `.env.production` 文件：

```env
# Supabase 配置（必需）
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
COZE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 管理员密码（可选，默认 jiale-admin-2026）
ADMIN_PASSWORD=your-secure-password

# 服务配置
PORT=5000
HOSTNAME=0.0.0.0
NODE_ENV=production
```

## 数据库配置

在 Supabase SQL Editor 中执行建表语句（完整 SQL 见 DEPLOY_LOCAL.md）

## 桌面快捷方式说明

### Windows
- **启动佳乐本地生活.bat** - 一键启动服务并打开浏览器
- **管理佳乐本地生活.bat** - 管理菜单（查看状态、日志、重启等）

### macOS
- **启动佳乐本地生活.sh** - 一键启动服务并打开浏览器
- **管理佳乐本地生活.sh** - 管理菜单（查看状态、日志、重启等）

### Linux
- **佳乐本地生活服务.desktop** - 桌面图标，双击启动
- **启动佳乐本地生活.sh** - 启动脚本
- **管理佳乐本地生活.sh** - 管理菜单

## 开机自启动

### Windows
1. 按 `Win + R`，输入 `shell:startup`
2. 将「启动佳乐本地生活.bat」的快捷方式复制到打开的文件夹

### macOS
1. 打开「系统偏好设置」→「用户与群组」→「登录项」
2. 点击「+」，添加「启动佳乐本地生活.sh」

### Linux
```bash
# 添加到开机自启
pm2 startup
pm2 save
```

## 常见问题

### 1. 双击快捷方式没反应
- Windows: 右键 → 以管理员身份运行
- macOS: 右键 → 打开（首次需要授权）
- Linux: 右键 → 属性 → 权限 → 允许作为程序执行

### 2. 端口 5000 被占用
修改 `.env.production` 中的 `PORT` 为其他端口（如 3000）

### 3. 无法访问 Supabase
- 检查网络连接
- 检查 `.env.production` 配置是否正确
- 在 Supabase 控制台检查项目状态

### 4. 构建失败
```bash
# 清理并重新安装
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
pnpm build
```

## 卸载

### Windows
1. 停止服务：`pm2 delete jiale-local-life`
2. 删除项目文件夹
3. 删除桌面快捷方式

### macOS/Linux
```bash
# 停止服务
pm2 delete jiale-local-life

# 删除项目
rm -rf ~/jiale-local-life

# 删除桌面快捷方式
rm ~/Desktop/启动佳乐本地生活.sh
rm ~/Desktop/管理佳乐本地生活.sh
```

## 更新

1. 下载最新版本代码
2. 替换项目文件夹
3. 双击「管理佳乐本地生活」→ 选择「3) 重启服务」

## 技术支持

如有问题，请查看：
- PM2 日志：`pm2 logs jiale-local-life`
- 完整文档：`DEPLOY_LOCAL.md`
