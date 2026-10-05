# 抖音开放平台数据对接方案

## 一、抖音开放平台接入流程

### 1.1 资质要求
- 企业营业执照
- 抖音企业号认证（蓝V）
- 开发者账号注册

### 1.2 接入步骤
1. 访问 [抖音开放平台](https://open.douyin.com/)
2. 注册开发者账号
3. 创建应用，获取 App Key 和 App Secret
4. 申请数据接口权限（需要审核）
5. 配置回调地址和授权域名

---

## 二、核心数据接口

### 2.1 视频数据接口
```
GET /api/douyin/video/data/
参数：
  - open_id: 用户授权 ID
  - item_id: 视频 ID
返回：
  - play_count: 播放量
  - digg_count: 点赞数
  - comment_count: 评论数
  - share_count: 转发数
  - download_count: 下载数
  - forward_count: 转发数
  - lose_count: 取消点赞数
  - lose_comment_count: 取消评论数
  - lose_share_count: 取消转发数
  - lose_forward_count: 取消转发数
```

### 2.2 账号数据接口
```
GET /api/douyin/account/data/
参数：
  - open_id: 用户授权 ID
返回：
  - follower_count: 粉丝数
  - following_count: 关注数
  - total_favorited: 获赞数
  - video_count: 作品数
  - avg_play_count: 平均播放量
```

### 2.3 团购数据接口
```
GET /api/douyin/poi/data/
参数：
  - poi_id: 门店 POI ID
返回：
  - click_count: 团购点击量
  - order_count: 团购订单量
  - verify_count: 核销量
  - gmv: 交易总额
```

---

## 三、授权流程（OAuth 2.0）

### 3.1 授权 URL
```
https://open.douyin.com/platform/oauth/connect/
  ?client_key={APP_KEY}
  &response_type=code
  &scope=user_info,video.data,video.list
  &redirect_uri={回调地址}
  &state={随机字符串}
```

### 3.2 获取 Access Token
```
POST /api/douyin/oauth/access_token/
参数：
  - client_key: APP_KEY
  - client_secret: APP_SECRET
  - code: 授权码
  - grant_type: authorization_code
返回：
  - access_token: 访问令牌
  - open_id: 用户唯一标识
  - expires_in: 过期时间
  - refresh_token: 刷新令牌
```

### 3.3 刷新 Token
```
POST /api/douyin/oauth/refresh_token/
参数：
  - client_key: APP_KEY
  - refresh_token: 刷新令牌
  - grant_type: refresh_token
```

---

## 四、数据同步方案

### 4.1 实时同步（推荐）
- 用户发布视频后，通过 Webhook 回调通知
- 回调地址：`/api/douyin/webhook`
- 事件类型：video.created, video.data.updated

### 4.2 定时同步
- 每小时同步一次最新数据
- 使用 Cron Job 或定时任务
- 接口：`/api/douyin/sync`

### 4.3 手动同步
- 用户在数据看板点击"刷新数据"
- 前端调用：`POST /api/metrics/sync`
- 后端调用抖音 API 获取最新数据

---

## 五、数据库设计扩展

### 5.1 抖音授权表
```sql
CREATE TABLE douyin_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  account_id UUID REFERENCES accounts(id),
  open_id VARCHAR(100) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT[], -- 授权范围
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 视频数据表
```sql
CREATE TABLE douyin_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  account_id UUID NOT NULL,
  item_id VARCHAR(100) NOT NULL, -- 抖音视频 ID
  title VARCHAR(500),
  cover_url TEXT,
  video_url TEXT,
  create_time TIMESTAMPTZ,
  -- 数据指标
  play_count INTEGER DEFAULT 0,
  digg_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  -- 计算指标
  engagement_rate DECIMAL(5,2), -- 互动率
  is_viral BOOLEAN DEFAULT FALSE,
  viral_level VARCHAR(20),
  -- 同步信息
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 团购数据表
```sql
CREATE TABLE douyin_poi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  poi_id VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  click_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  verify_count INTEGER DEFAULT 0,
  gmv DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 六、前端对接实现

### 6.1 抖音授权组件
```tsx
// components/douyin-auth.tsx
export function DouyinAuth({ onSuccess }) {
  const handleAuth = () => {
    const authUrl = `https://open.douyin.com/platform/oauth/connect/
      ?client_key=${APP_KEY}
      &response_type=code
      &scope=user_info,video.data,video.list
      &redirect_uri=${encodeURIComponent(CALLBACK_URL)}
      &state=${generateState()}`;
    window.location.href = authUrl;
  };

  return (
    <button onClick={handleAuth} className="btn-douyin">
      授权抖音账号
    </button>
  );
}
```

### 6.2 数据同步 Hook
```tsx
// hooks/use-douyin-sync.ts
export function useDouyinSync(accountId) {
  const [syncing, setSyncing] = useState(false);
  
  const syncData = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/douyin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId }),
      });
      const data = await res.json();
      if (data.success) {
        // 刷新数据看板
      }
    } finally {
      setSyncing(false);
    }
  };

  return { syncing, syncData };
}
```

### 6.3 数据看板增强
```tsx
// components/data-dashboard.tsx
export function DataDashboard({ accountId }) {
  const { syncing, syncData } = useDouyinSync(accountId);
  
  return (
    <div>
      <button onClick={syncData} disabled={syncing}>
        {syncing ? '同步中...' : '刷新抖音数据'}
      </button>
      {/* 展示真实抖音数据 */}
    </div>
  );
}
```

---

## 七、注意事项

### 7.1 接口限流
- 抖音 API 有调用频率限制
- 建议：每小时同步一次，避免频繁调用
- 使用缓存减少 API 调用

### 7.2 数据安全
- Access Token 加密存储
- 定期刷新 Token
- 不要在前端暴露 App Secret

### 7.3 审核要求
- 数据接口需要单独申请
- 需要提交使用场景说明
- 审核周期：3-7 个工作日

### 7.4 替代方案
如果无法获取抖音开放平台权限，可以：
1. 手动录入数据（当前方案）
2. 使用第三方数据平台（如：飞瓜数据、蝉妈妈）
3. 通过抖音创作者服务中心导出数据

---

## 八、实施优先级

### Phase 1（当前）
- ✅ 手动录入数据
- ✅ 基础数据展示
- ✅ 趋势图表

### Phase 2（短期）
- [ ] 抖音 OAuth 授权
- [ ] 自动同步视频数据
- [ ] 实时数据更新

### Phase 3（中期）
- [ ] 团购数据对接
- [ ] 竞品数据分析
- [ ] 智能数据预警

### Phase 4（长期）
- [ ] AI 数据解读
- [ ] 自动优化建议
- [ ] 跨平台数据整合
