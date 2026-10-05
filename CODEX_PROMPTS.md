# 佳乐本地生活服务 - Codex 部署提示词

## 使用说明

将以下提示词按顺序输入到 Codex 中，每完成一个阶段后再输入下一个。

---

## 提示词 1：项目初始化与技术栈

```
创建一个 Next.js 16 项目，使用 App Router，技术栈如下：
- Framework: Next.js 16 (App Router)
- Core: React 19
- Language: TypeScript 5 (strict mode)
- UI: shadcn/ui (基于 Radix UI)
- Styling: Tailwind CSS 4
- 包管理器: pnpm

项目结构：
```
src/
├── app/                    # 页面路由
│   ├── (app)/             # 主应用布局
│   │   ├── page.tsx       # 创作主页
│   │   ├── layout.tsx     # 应用布局（侧边栏+顶栏）
│   │   ├── tools/page.tsx # 运营工具箱
│   │   └── history/page.tsx # 历史作品
│   ├── login/page.tsx     # 登录页
│   ├── guide/page.tsx     # 使用指南
│   ── api/               # API 路由
├── components/            # UI 组件
├── hooks/                 # 自定义 Hooks
├── lib/                   # 工具库
└── storage/database/      # 数据库客户端
```

初始化命令：
```bash
coze init . --template nextjs --src-dir
pnpm add @supabase/supabase-js coze-coding-dev-sdk date-fns dotenv
pnpm add -D @types/node
```

创建 .coze 配置文件：
```toml
[project]
requires = ["nodejs-24"]

[dev]
build = ["pnpm", "install"]
run = ["pnpm", "run", "dev"]

[deploy]
build = ["pnpm", "run", "build"]
run = ["pnpm", "run", "start"]
```
```

---

## 提示词 2：数据库设计与 Supabase 客户端

```
创建 Supabase 数据库客户端和 7 张数据表。

### 1. 创建 src/storage/database/supabase-client.ts

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseCredentials {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export function getSupabaseCredentials(): SupabaseCredentials | null {
  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !anonKey || !serviceRoleKey) {
    return null;
  }
  
  return { url, anonKey, serviceRoleKey };
}

export function getSupabaseClient(): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  if (!creds) return null;
  
  return createClient(creds.url, creds.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
```

### 2. 在 Supabase SQL Editor 中执行以下建表语句

```sql
-- 商家信息表
CREATE TABLE IF NOT EXISTS merchants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  category TEXT,
  store_name TEXT,
  unit_price TEXT,
  selling_points TEXT,
  location TEXT,
  group_buy_info TEXT,
  account_stage TEXT DEFAULT 'new',
  persona TEXT,
  style TEXT,
  benchmark_accounts TEXT,
  quota_remaining INTEGER DEFAULT 100,
  quota_reset_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 账号管理表
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'douyin',
  account_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 内容日历表
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT,
  status TEXT DEFAULT 'draft',
  output_type TEXT,
  publish_platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 数据指标表
CREATE TABLE IF NOT EXISTS content_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  content_id UUID REFERENCES content_calendar(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  plays INTEGER DEFAULT 0,
  completion_rate REAL DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  group_buy_sales INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 素材库表
CREATE TABLE IF NOT EXISTS material_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Key 管理表
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 生成历史表
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  output_type TEXT NOT NULL,
  input_data JSONB,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
```

---

## 提示词 3：认证系统

```
创建商家认证系统，包含登录、会话管理、额度管理。

### 创建 src/lib/auth-manager.ts

核心功能：
1. verifyMerchant(password: string) - 验证商家密码，返回商家信息
2. verifyMerchantToken(cookie: string) - 从 Cookie 验证会话
3. setMerchantSession(response, merchant) - 设置 httpOnly Cookie
4. clearMerchantSession(response) - 清除会话
5. getAllMerchants() - 获取所有商家（管理员用）
6. addMerchant(merchant) - 添加商家
7. useQuota(merchantId, amount) - 扣减额度
8. updateMerchant(id, data) - 更新商家信息
9. deleteMerchant(id) - 删除商家
10. getMerchantById(id) - 根据 ID 获取商家

Cookie 配置：
- 名称：merchant_session
- httpOnly: true
- secure: process.env.NODE_ENV === 'production'
- sameSite: 'lax'
- maxAge: 7 * 24 * 60 * 60 (7天)

密码哈希使用 Web Crypto API：
```typescript
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

默认管理员密码：jiale-admin-2026（首次使用时自动创建）
```

---

## 提示词 4：系统提示词与文案配置

```
创建文案生成的系统提示词和配置。

### 创建 src/lib/system-prompt.ts

系统提示词核心内容：

**角色设定**：
你是"焦总"，本地生活短视频内容策划专家。专注为实体商家创作可直接拍摄发布的短视频内容。

**核心规则**：
1. 事实约束（最高优先级）：
   - 只使用用户明确填写的信息
   - 禁止虚构销量、排名、评价、预约服务
   - 禁止虚构冲突情节
   - 无法确认的信息用 [需商家确认] 标记

2. 拍摄可执行性：
   - 只生成符合现有拍摄条件的画面
   - 每个分镜提供低成本替代方案
   - 不默认门店存在不存在的素材

3. 结构校验：
   - 时长和分镜必须一致
   - 口播字数按每秒 3.5-4 字控制
   - 自动检查时间重叠/缺失

4. 降低模板感：
   - 每次给出 3 个基于真实卖点的钩子
   - 限制使用高频模板词
   - 像真人说话，不说广告腔

5. 抖音流量分发：
   - 前 3 秒必须有钩子
   - 每 3-5 秒切换画面
   - 结尾引导互动
   - 标题包含本地关键词

**输出格式**：Markdown，不用 JSON

### 创建 src/lib/copywriting-config.ts

配置内容：
- 一级类目：餐饮美食、丽人、休闲娱乐、亲子、教育培训、生活服务、酒店民宿、旅游、汽车、房产
- 二级类目：根据一级类目动态加载
- 创作目标：提升曝光、增加互动、促进转化、品牌建设
- 目标客群：根据类目预设
- 拍摄条件：老板出镜、明档、后厨、顾客、门头、制作过程
- 输出类型：script、talking、vlog、livestream、interaction、calendar
- 钩子类型：地域、价格、好奇、冲突、身份、反常识、数字、痛点
```

---

## 提示词 5：API 路由

```
创建以下 API 路由，每个路由都必须：
1. 使用 getSupabaseClient() 获取数据库客户端
2. 检查客户端是否为 null，如果为 null 返回 500 错误
3. 使用 verifyMerchantToken 验证登录状态
4. 返回 JSON 响应

### API 路由清单：

1. POST /api/auth - 商家登录
   - 输入：{ password: string }
   - 输出：{ success, merchant }
   - 设置 Cookie

2. GET /api/auth - 检查登录状态
   - 从 Cookie 读取会话
   - 输出：{ success, merchant }

3. POST /api/auth/logout - 退出登录
   - 清除 Cookie

4. POST /api/generate - 文案生成（核心）
   - 输入：{ mode, category, storeName, unitPrice, sellingPoints, location, groupBuyInfo, accountStage, persona, style, benchmarkAccounts, outputTypes, creativeGoal, targetAudience, shootingConditions }
   - 使用 coze-coding-dev-sdk 的 LLMClient 调用豆包旗舰版
   - 模型：doubao-seed-2-0-pro-260215
   - 使用 system-prompt.ts 中的系统提示词
   - 扣减额度
   - 保存到 generation_history
   - 自动创建 content_calendar 事件
   - SSE 流式输出

5. POST /api/analyze-link - 链接识别
   - 输入：{ url: string }
   - 使用 SearchClient 抓取页面内容
   - 提取团购信息

6. POST /api/analyze-groupbuy - 团购识别
   - 输入：{ text: string }
   - 使用 LLM 提取团购信息

7. GET/POST /api/accounts - 账号管理
   - GET: 获取当前商家的所有账号
   - POST: 创建新账号 { name, platform, accountId }

8. GET/PUT/DELETE /api/accounts/[id] - 单个账号操作

9. GET/POST /api/calendar - 内容日历
   - GET: 获取日历事件（支持月份筛选）
   - POST: 创建日历事件

10. GET/PUT/DELETE /api/calendar/[id] - 日历事件操作

11. GET/POST /api/metrics - 数据指标
    - GET: 获取指标数据
    - POST: 录入指标 { accountId, date, plays, completionRate, likes, comments, shares, saves, groupBuySales }

12. GET/POST /api/materials - 素材库
    - GET: 获取素材（支持类型筛选）
    - POST: 添加素材

13. GET/PUT/DELETE /api/materials/[id] - 素材操作

14. GET/POST /api/history - 历史作品
    - GET: 获取历史记录（支持搜索、筛选）
    - POST: 保存历史

15. GET/PUT/DELETE /api/history/[id] - 历史操作

16. POST /api/recommend - 智能推荐
    - 根据历史数据推荐钩子和选题

17. GET /api/templates - 模板库
    - 按行业分类提供模板

18. GET/POST/DELETE /api/api-keys - API Key 管理

19. GET/POST /api/sync-data - 数据同步
    - 支持飞瓜/蝉妈妈/抖音开放平台
```

---

## 提示词 6：前端页面 - 登录页

```
创建登录页面 src/app/login/page.tsx

设计要求：
- 深蓝背景 (#08152D)
- 金色品牌色 (#E8C16F)
- 居中卡片布局
- Logo + 产品名称 + 一句话价值主张
- 密码输入框（支持显示/隐藏）
- 进入工作室按钮（48px 高度）
- 联系客户经理入口
- 加载动画（验证时）
- 错误提示（输入框下方）

响应式：
- 手机端：全宽卡片，内边距 16px
- PC 端：最大宽度 420px，内边距 24px

交互：
- 密码输入后自动聚焦按钮
- 回车键提交
- 按钮点击后显示加载动画，防止重复提交
- 登录成功跳转主页
- 401 错误跳转登录页并提示
```

---

## 提示词 7：前端页面 - 创作主页

```
创建创作主页 src/app/(app)/page.tsx

布局：
- PC 端：左侧导航 240px + 中间表单 480-560px + 右侧结果区
- 手机端：顶部品牌栏 + 底部导航 + 单栏布局

鉴权状态：
- loading: 显示骨架屏
- unauthorized: 跳转登录页
- authorized: 显示工作台

4 步表单：
1. 门店信息（约 2 分钟）
   - 一级类目（下拉选择）
   - 二级类目（级联选择）
   - 门店名称
   - 客单价（带"元"后缀）
   - 核心卖点（多选标签）
   - 门店位置

2. 内容定位（约 2 分钟）
   - 账号阶段（新号/成长期/成熟期/断更回归）
   - 出镜人设（老板/员工/达人/无人）
   - 文案风格（接地气/高级感/搞笑/走心/专业/冲突）
   - 对标账号（选填）

3. 团购套餐（选填，约 1 分钟）
   - 三种录入方式：粘贴链接/上传截图/手动填写
   - 支持多个套餐卡片
   - 每个套餐：名称、原价、团购价、内容、规则
   - 设为主推功能

4. 输出设置（约 30 秒）
   - 6 种输出类型卡片网格
   - 创作目标
   - 目标客群
   - 拍摄条件（多选）

进度条：
- 显示步骤名称（不只是数字）
- 显示当前/已完成/未完成状态
- 支持点击返回已完成步骤
- 每步显示预计填写时间

生成结果区：
- SSE 流式输出
- Markdown 渲染
- 二次操作按钮（换钩子/缩短/扩写/改口吻/增强转化/降低广告感/重新生成）
- 一键排期到内容日历
- 复制/导出功能

手机端优化：
- 填写信息/创作结果两个页签
- 底部固定操作栏（上一步/下一步/开始生成）
- 键盘弹起时按钮不遮挡输入框
```

---

## 提示词 8：前端页面 - 运营工具箱

```
创建运营工具箱页面 src/app/(app)/tools/page.tsx

包含 5 个 Tab：

1. 内容日历
   - 月视图/周视图/列表视图切换
   - 状态筛选（待拍摄/待剪辑/待发布/已发布）
   - 点击日期创建事件
   - 拖拽调整日期
   - 查看关联文案

2. 数据看板
   - 账号选择器
   - 关键指标卡片（播放量/完播率/点赞/评论/转化）
   - 趋势图表（7 天/30 天）
   - 数据录入表单
   - 同步数据按钮（第三方平台）
   - 智能推荐（根据历史数据）

3. 素材库
   - 分类筛选（钩子库/脚本库/BGM 库/灵感库）
   - 搜索功能
   - 收藏功能
   - 使用次数统计

4. 模板库
   - 按行业分类
   - 预览功能
   - 一键使用

5. API Key 配置
   - 平台选择（飞瓜/蝉妈妈/抖音开放平台）
   - Key 名称
   - API Key 输入
   - 启用/禁用开关

Tab 栏设计：
- PC 端：横向排列，金色下划线高亮
- 手机端：横向滚动，缩写标签（日历/数据/素材/模板/设置）
```

---

## 提示词 9：前端页面 - 历史作品

```
创建历史作品页面 src/app/history/page.tsx

功能：
- 搜索框（标题/内容搜索）
- 筛选器（输出类型/日期范围/收藏）
- 卡片网格布局
- 每张卡片：标题、类型标签、创建时间、收藏按钮
- 操作：查看/复用/删除
- 分页加载

响应式：
- PC 端：3 列网格
- 平板：2 列网格
- 手机：1 列网格
```

---

## 提示词 10：组件库

```
创建以下核心组件：

### 1. src/components/account-switcher.tsx
- 账号卡片展示（名称、平台、切换图标）
- 额度不足/即将到期数字角标
- 添加账号弹窗（使用 React Portal 渲染到 body）
- 切换账号功能

### 2. src/components/content-calendar.tsx
- 月视图日历网格
- 事件卡片（标题、状态、时间）
- 状态颜色编码
- 点击创建/编辑事件
- 查看关联文案弹窗

### 3. src/components/data-dashboard.tsx
- 指标卡片网格
- 简单柱状图（用 div 实现）
- 数据录入表单
- 同步数据按钮
- 空状态引导

### 4. src/components/material-library.tsx
- 分类 Tab
- 素材卡片
- 搜索框
- 收藏按钮

### 5. src/components/onboarding-wizard.tsx
- 4 步引导（欢迎/创建账号/示例体验/使用指南）
- 进度指示器
- 跳过功能

### 6. src/components/history-list.tsx
- 历史作品卡片
- 搜索/筛选
- 收藏/复用/删除

### 7. src/components/api-key-manager.tsx
- 平台选择
- Key 管理列表
- 添加/删除/启用/禁用

### 8. src/components/auth-check.tsx
- 认证状态检查
- 未登录跳转

### 9. src/components/auth-context.tsx
- 认证状态管理
- Provider 包裹

### 10. src/components/login-form.tsx
- 密码输入
- 显示/隐藏切换
- 提交按钮
- 错误提示

### 11. src/components/merchant-login.tsx
- 商家登录表单
- 联系客户经理

### 12. src/components/admin-login.tsx
- 管理员登录
- 密码输入
```

---

## 提示词 11：设计规范与样式

```
创建设计规范文件 DESIGN.md 和全局样式 src/app/globals.css

### 色彩系统
| 用途 | 色值 |
|------|------|
| 页面背景 | #08152D |
| 卡片背景 | #10213F |
| 次级卡片 | #132746 |
| 主品牌金 | #E8C16F |
| 金色悬停 | #F1D38A |
| 主文字 | #F7F8FA |
| 次级文字 | #AAB4C8 |
| 辅助文字 | #77839A |
| 边框 | rgba(232,193,111,0.22) |
| 成功 | #36C98F |
| 警告 | #F2B84B |
| 错误 | #FF6B6B |

### 尺寸规范
- 页面圆角：12px
- 输入框高度：44px
- 主按钮高度：48px
- 卡片内边距：PC 24px / 手机 16px
- 模块间距：24px
- 最小字号：13px
- 正文字号：14-16px，行高 1.6
- 主标题：24-28px

### 交互规范
- 按钮：默认金色渐变 / 悬停亮度+10% / 点击亮度-10% / 禁用透明度 50%
- 输入框：默认金色边框 20% / 聚焦 60% + 光晕 / 错误红色边框
- 动效：150-250ms，cubic-bezier(0.4, 0, 0.2, 1)

### 布局规范
- PC 端：左侧导航 240px（可折叠至 72px）+ 顶部全局栏
- 手机端：顶部品牌栏 + 底部导航（创作/作品/日历/我的）
- 页面最大宽度：1600px，超宽屏居中

### CSS 变量
在 globals.css 中定义所有颜色为 CSS 变量，方便主题切换。

### 禁止事项
- 禁止硬编码颜色（使用 CSS 变量）
- 禁止硬编码圆角（使用 rounded-md/lg 等）
- 禁止蓝紫色 AI 味渐变色
- 禁止使用 Inter/Roboto/Arial 等通用字体
```

---

## 提示词 12：响应式与移动端优化

```
确保所有页面在 PC 端和手机端都能稳定运行。

### 响应式断点
- 手机：< 768px
- 平板：768px - 1024px
- PC：> 1024px

### 手机端特殊处理

1. 导航：
   - 隐藏左侧导航
   - 显示底部导航栏（固定定位）
   - 底部导航：创作/作品/日历/我的

2. 表单：
   - 单栏布局
   - 输入框全宽
   - 底部固定操作栏（上一步/下一步/开始生成）
   - 键盘弹起时按钮不遮挡输入框（使用 env(safe-area-inset-bottom)）

3. 结果区：
   - 使用页签切换（填写信息/创作结果）
   - 不要放在长表单下方

4. Tab 栏：
   - 横向滚动（overflow-x-auto）
   - 缩写标签（日历/数据/素材/模板/设置）
   - 隐藏滚动条

5. 弹窗：
   - 使用 React Portal 渲染到 body
   - 全屏遮罩
   - 底部弹出动画

6. 表格：
   - 横向滚动
   - 或改为卡片列表

### PC 端特殊处理

1. 导航：
   - 固定左侧 240px
   - 可折叠至 72px（只显示图标）

2. 布局：
   - 双栏布局（表单 + 结果）
   - 表单区 480-560px
   - 结果区剩余宽度
   - 分别独立滚动

3. 悬停效果：
   - 按钮悬停亮度变化
   - 卡片悬停阴影
   - 导航项悬停背景

### 测试清单
- [ ] 手机端无横向滚动
- [ ] 主要按钮始终可见
- [ ] 输入框高度 ≥ 44px
- [ ] 按钮点击区域 ≥ 44×44px
- [ ] 字体大小 ≥ 13px
- [ ] 键盘弹起不遮挡按钮
- [ ] 弹窗居中显示
- [ ] Tab 栏可横向滚动
```

---

## 提示词 13：部署配置

```
创建部署相关文件。

### .coze 配置文件
```toml
[project]
requires = ["nodejs-24"]

[dev]
build = ["pnpm", "install"]
run = ["pnpm", "run", "dev"]

[deploy]
build = ["pnpm", "run", "build"]
run = ["pnpm", "run", "start"]
```

### 环境变量
```
COZE_SUPABASE_URL=your_supabase_project_url
COZE_SUPABASE_ANON_KEY=your_anon_key
COZE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_admin_password
```

### 构建注意事项
1. getSupabaseClient() 在构建时返回 null（环境变量不存在）
2. 所有 API 路由必须检查客户端是否为 null
3. 如果为 null，返回 500 错误：{ error: "数据库未配置" }

### 启动脚本
- scripts/dev.sh: pnpm dev
- scripts/build.sh: pnpm build
- scripts/start.sh: DEPLOY_RUN_PORT=${DEPLOY_RUN_PORT:-5000} node dist/server.js
```

---

## 提示词 14：完整功能验收

```
完成以下功能验收：

### 核心功能
- [ ] 商家登录/退出
- [ ] 4 步表单填写
- [ ] 文案生成（SSE 流式输出）
- [ ] 6 种输出类型
- [ ] 事实确认表
- [ ] 二次操作（换钩子/缩短/扩写等）
- [ ] 一键排期到日历
- [ ] 历史作品保存/复用

### 运营工具
- [ ] 内容日历（月视图/事件管理）
- [ ] 数据看板（指标录入/图表）
- [ ] 素材库（分类/搜索/收藏）
- [ ] 模板库（行业分类）
- [ ] API Key 配置

### 账号管理
- [ ] 创建/编辑/删除账号
- [ ] 账号切换
- [ ] 额度管理

### 响应式
- [ ] PC 端双栏布局
- [ ] 手机端底部导航
- [ ] 表单页签切换
- [ ] Tab 栏横向滚动
- [ ] 弹窗居中显示
- [ ] 无横向滚动

### 错误处理
- [ ] 401 跳转登录页
- [ ] 数据库未配置提示
- [ ] 生成失败明确提示
- [ ] 加载状态显示

### 性能
- [ ] 首屏加载 < 3s
- [ ] 生成响应 < 5s
- [ ] 无内存泄漏
- [ ] 图片懒加载
```

---

## 使用建议

1. **按顺序执行**：从提示词 1 开始，逐步完成
2. **每步验证**：完成一个提示词后，运行 `pnpm build` 验证
3. **遇到问题**：将错误信息反馈给我，我会提供修复方案
4. **环境变量**：部署前确保配置好 Supabase 连接信息
5. **数据库**：在 Supabase SQL Editor 中执行建表语句

## 快速开始

如果时间有限，优先完成以下提示词：
1. 提示词 1（项目初始化）
2. 提示词 2（数据库）
3. 提示词 3（认证系统）
4. 提示词 5（API 路由 - 至少完成 auth 和 generate）
5. 提示词 6（登录页）
6. 提示词 7（创作主页）

这 6 个提示词可以构建出核心的文案生成功能。
