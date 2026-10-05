# 佳乐本地生活服务 - Codex 部署提示词（可复制版）

> 使用说明：将每个提示词直接复制粘贴到 Codex 中，按顺序执行。

---

## 提示词 1：项目初始化

```
创建一个 Next.js 16 项目，使用 App Router。

技术栈：
- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict mode)
- shadcn/ui (基于 Radix UI)
- Tailwind CSS 4
- 包管理器：pnpm

执行命令：
```bash
coze init . --template nextjs --src-dir
pnpm add @supabase/supabase-js coze-coding-dev-sdk date-fns dotenv
```

项目结构：
```
src/
├── app/
│   ├── (app)/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── tools/page.tsx
│   │   └── history/page.tsx
│   ├── login/page.tsx
│   ├── guide/page.tsx
│   └── api/
── components/
├── hooks/
── lib/
└── storage/database/
```

创建 .coze 文件：
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

## 提示词 2：数据库客户端

```
创建 src/storage/database/supabase-client.ts

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

重要：构建时环境变量不存在，getSupabaseClient() 会返回 null。所有 API 路由必须检查 null。
```

---

## 提示词 3：建表 SQL

```
在 Supabase SQL Editor 中执行以下 SQL：

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

## 提示词 4：认证系统

```
创建 src/lib/auth-manager.ts

功能：
1. verifyMerchant(password: string) - 验证商家密码
2. verifyMerchantToken(cookie: string) - 从 Cookie 验证会话
3. setMerchantSession(response, merchant) - 设置 httpOnly Cookie
4. clearMerchantSession(response) - 清除会话
5. getAllMerchants() - 获取所有商家
6. addMerchant(merchant) - 添加商家
7. useQuota(merchantId, amount) - 扣减额度
8. updateMerchant(id, data) - 更新商家
9. deleteMerchant(id) - 删除商家
10. getMerchantById(id) - 根据 ID 获取商家

Cookie 配置：
- 名称：merchant_session
- httpOnly: true
- secure: process.env.NODE_ENV === 'production'
- sameSite: 'lax'
- maxAge: 604800 (7 天)

密码哈希使用 Web Crypto API (SHA-256)

默认管理员密码：jiale-admin-2026（首次使用时自动创建）

每个函数都要检查 getSupabaseClient() 是否为 null，如果为 null 返回 null 或空数组。
```

---

## 提示词 5：系统提示词

```
创建 src/lib/system-prompt.ts

系统提示词核心内容：

角色：你是"焦总"，本地生活短视频内容策划专家。

核心规则：
1. 事实约束（最高优先级）：
   - 只使用用户明确填写的信息
   - 禁止虚构销量、排名、评价、预约服务
   - 禁止虚构冲突情节
   - 无法确认的信息用 [需商家确认] 标记

2. 拍摄可执行性：
   - 只生成符合现有拍摄条件的画面
   - 每个分镜提供低成本替代方案

3. 结构校验：
   - 时长和分镜必须一致
   - 口播字数按每秒 3.5-4 字控制

4. 降低模板感：
   - 每次给出 3 个基于真实卖点的钩子
   - 限制使用高频模板词

5. 抖音流量分发：
   - 前 3 秒必须有钩子
   - 每 3-5 秒切换画面
   - 结尾引导互动

输出格式：Markdown，不用 JSON
```

---

## 提示词 6：文案配置

```
创建 src/lib/copywriting-config.ts

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

## 提示词 7：API 路由 - 认证

```
创建以下认证 API：

### POST /api/auth - 商家登录
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyMerchant, setMerchantSession } from '@/lib/auth-manager';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const merchant = await verifyMerchant(password);
  
  if (!merchant) {
    return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
  }
  
  const response = NextResponse.json({ success: true, merchant });
  await setMerchantSession(response, merchant);
  return response;
}
```

### GET /api/auth - 检查登录状态
从 Cookie 读取会话，返回商家信息

### POST /api/auth/logout - 退出登录
清除 Cookie
```

---

## 提示词 8：API 路由 - 文案生成

```
创建 POST /api/generate

核心逻辑：
1. 验证登录状态
2. 获取 Supabase 客户端（检查 null）
3. 使用 coze-coding-dev-sdk 的 LLMClient
4. 模型：doubao-seed-2-0-pro-260215
5. 使用 system-prompt.ts 中的系统提示词
6. SSE 流式输出
7. 扣减额度
8. 保存到 generation_history
9. 自动创建 content_calendar 事件

输入参数：
{
  mode: 'merchant' | 'ip',
  category: string,
  storeName: string,
  unitPrice: string,
  sellingPoints: string[],
  location: string,
  groupBuyInfo?: string,
  accountStage: string,
  persona: string,
  style: string,
  benchmarkAccounts?: string,
  outputTypes: string[],
  creativeGoal?: string,
  targetAudience?: string,
  shootingConditions?: string[]
}

SSE 流式输出格式：
```
data: {"type": "chunk", "content": "..."}
data: {"type": "done", "content": "..."}
```
```

---

## 提示词 9：API 路由 - 其他接口

```
创建以下 API 路由（每个都要检查 Supabase 客户端 null）：

1. POST /api/analyze-link - 链接识别
2. POST /api/analyze-groupbuy - 团购识别
3. GET/POST /api/accounts - 账号管理
4. GET/PUT/DELETE /api/accounts/[id] - 单个账号
5. GET/POST /api/calendar - 内容日历
6. GET/PUT/DELETE /api/calendar/[id] - 日历事件
7. GET/POST /api/metrics - 数据指标
8. GET/POST /api/materials - 素材库
9. GET/PUT/DELETE /api/materials/[id] - 素材操作
10. GET/POST /api/history - 历史作品
11. GET/PUT/DELETE /api/history/[id] - 历史操作
12. POST /api/recommend - 智能推荐
13. GET /api/templates - 模板库
14. GET/POST/DELETE /api/api-keys - API Key 管理
15. GET/POST /api/sync-data - 数据同步

每个路由的通用模式：
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyMerchantToken } from '@/lib/auth-manager';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: '数据库未配置' }, { status: 500 });
  }
  
  const merchant = await verifyMerchantToken(request.headers.get('cookie') || '');
  if (!merchant) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  
  // 业务逻辑...
}
```
```

---

## 提示词 10：登录页

```
创建 src/app/login/page.tsx

设计：
- 深蓝背景 (#08152D)
- 金色品牌色 (#E8C16F)
- 居中卡片布局
- Logo + 产品名称 + 一句话价值主张
- 密码输入框（支持显示/隐藏）
- 进入工作室按钮（48px 高度）
- 联系客户经理入口

交互：
- 密码输入后自动聚焦按钮
- 回车键提交
- 按钮点击后显示加载动画
- 登录成功跳转主页
- 401 错误跳转登录页并提示

响应式：
- 手机端：全宽卡片，内边距 16px
- PC 端：最大宽度 420px，内边距 24px
```

---

## 提示词 11：创作主页

```
创建 src/app/(app)/page.tsx

布局：
- PC 端：左侧导航 240px + 中间表单 480-560px + 右侧结果区
- 手机端：顶部品牌栏 + 底部导航 + 单栏布局

鉴权状态：
- loading: 显示骨架屏
- unauthorized: 跳转登录页
- authorized: 显示工作台

4 步表单：
1. 门店信息（类目、门店名称、客单价、核心卖点、位置）
2. 内容定位（账号阶段、出镜人设、文案风格、对标账号）
3. 团购套餐（选填，支持多个套餐卡片）
4. 输出设置（6 种输出类型卡片网格）

进度条：
- 显示步骤名称（不只是数字）
- 显示当前/已完成/未完成状态
- 支持点击返回已完成步骤

生成结果区：
- SSE 流式输出
- Markdown 渲染
- 二次操作按钮（换钩子/缩短/扩写/改口吻/增强转化/降低广告感/重新生成）
- 一键排期到内容日历
- 复制/导出功能

手机端：
- 填写信息/创作结果两个页签
- 底部固定操作栏
- 键盘弹起时按钮不遮挡输入框
```

---

## 提示词 12：运营工具箱

```
创建 src/app/(app)/tools/page.tsx

5 个 Tab：
1. 内容日历 - 月视图/周视图/列表视图，状态筛选，点击创建事件
2. 数据看板 - 指标卡片，趋势图表，数据录入，同步数据按钮
3. 素材库 - 分类筛选，搜索，收藏，使用次数统计
4. 模板库 - 按行业分类，预览，一键使用
5. API Key 配置 - 平台选择，Key 管理，启用/禁用

Tab 栏：
- PC 端：横向排列，金色下划线高亮
- 手机端：横向滚动，缩写标签（日历/数据/素材/模板/设置）
```

---

## 提示词 13：历史作品页

```
创建 src/app/history/page.tsx

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

## 提示词 14：核心组件

```
创建以下组件：

### 1. src/components/account-switcher.tsx
- 账号卡片展示（名称、平台、切换图标）
- 额度不足/即将到期数字角标
- 添加账号弹窗（使用 React Portal 渲染到 body）

### 2. src/components/content-calendar.tsx
- 月视图日历网格
- 事件卡片（标题、状态、时间）
- 状态颜色编码
- 点击创建/编辑事件

### 3. src/components/data-dashboard.tsx
- 指标卡片网格
- 简单柱状图（用 div 实现）
- 数据录入表单
- 同步数据按钮

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
```

---

## 提示词 15：设计规范

```
创建 src/app/globals.css

色彩系统：
- 页面背景：#08152D
- 卡片背景：#10213F
- 次级卡片：#132746
- 主品牌金：#E8C16F
- 金色悬停：#F1D38A
- 主文字：#F7F8FA
- 次级文字：#AAB4C8
- 辅助文字：#77839A
- 边框：rgba(232,193,111,0.22)
- 成功：#36C98F
- 警告：#F2B84B
- 错误：#FF6B6B

尺寸规范：
- 页面圆角：12px
- 输入框高度：44px
- 主按钮高度：48px
- 卡片内边距：PC 24px / 手机 16px
- 模块间距：24px
- 最小字号：13px
- 正文字号：14-16px，行高 1.6

交互规范：
- 按钮：默认金色渐变 / 悬停亮度+10% / 点击亮度 -10%
- 输入框：默认金色边框 20% / 聚焦 60% + 光晕
- 动效：150-250ms，cubic-bezier(0.4, 0, 0.2, 1)

禁止：
- 硬编码颜色（使用 CSS 变量）
- 硬编码圆角（使用 rounded-md/lg）
- 蓝紫色 AI 味渐变色
- Inter/Roboto/Arial 等通用字体
```

---

## 提示词 16：响应式优化

```
确保所有页面在 PC 端和手机端都能稳定运行。

手机端特殊处理：
1. 导航：隐藏左侧导航，显示底部导航栏（创作/作品/日历/我的）
2. 表单：单栏布局，输入框全宽，底部固定操作栏
3. 结果区：使用页签切换（填写信息/创作结果）
4. Tab 栏：横向滚动，缩写标签，隐藏滚动条
5. 弹窗：使用 React Portal 渲染到 body，全屏遮罩
6. 表格：横向滚动或改为卡片列表

PC 端特殊处理：
1. 导航：固定左侧 240px，可折叠至 72px
2. 布局：双栏布局（表单 + 结果），分别独立滚动
3. 悬停效果：按钮/卡片/导航项

测试清单：
- 手机端无横向滚动
- 主要按钮始终可见
- 输入框高度 ≥ 44px
- 按钮点击区域 ≥ 44×44px
- 字体大小 ≥ 13px
- 键盘弹起不遮挡按钮
- 弹窗居中显示
- Tab 栏可横向滚动
```

---

## 提示词 17：部署配置

```
创建部署相关文件。

环境变量：
```
COZE_SUPABASE_URL=your_supabase_project_url
COZE_SUPABASE_ANON_KEY=your_anon_key
COZE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_admin_password
```

构建注意事项：
1. getSupabaseClient() 在构建时返回 null
2. 所有 API 路由必须检查客户端是否为 null
3. 如果为 null，返回 500 错误

启动脚本：
- scripts/dev.sh: pnpm dev
- scripts/build.sh: pnpm build
- scripts/start.sh: DEPLOY_RUN_PORT=${DEPLOY_RUN_PORT:-5000} node dist/server.js
```

---

## 快速开始（最小可用版本）

只需完成以下 6 个提示词即可构建核心功能：

1. ✅ 提示词 1 - 项目初始化
2. ✅ 提示词 2 - 数据库客户端
3. ✅ 提示词 3 - 建表 SQL
4. ✅ 提示词 4 - 认证系统
5. ✅ 提示词 7 - API 路由（认证）
6. ✅ 提示词 8 - API 路由（文案生成）
7. ✅ 提示词 10 - 登录页
8. ✅ 提示词 11 - 创作主页

完成这 8 个提示词后，你就有了一个可以登录、填写表单、生成文案的核心应用。
