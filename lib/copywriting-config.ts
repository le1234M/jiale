export interface OutputTypeDef {
  key: string;
  name: string;
  desc: string;
  badge?: string;
  tip?: string;
  requireBusinessLink?: boolean;
}

export const BUSINESS_OUTPUT_TYPES: OutputTypeDef[] = [
  {
    key: 'script',
    name: '短视频脚本（含分镜）',
    desc: '30-60秒 · 黄金3秒钩子+分镜画面+口播文案+字幕+BGM推荐+POI',
    badge: '最常用',
    tip: '适合日常拍摄，包含完整分镜和口播',
  },
  {
    key: 'talking',
    name: '口播/真人讲话文案',
    desc: '开场钩子+核心话术+转化引导+互动收尾',
    badge: '最简单',
    tip: '适合老板/员工直接对着镜头说',
  },
  {
    key: 'vlog',
    name: '探店Vlog脚本',
    desc: '进店→体验→高潮→转化完整动线',
    badge: '种草首选',
    tip: '适合展示门店环境和服务体验',
  },
  {
    key: 'livestream',
    name: '直播话术脚本',
    desc: '开场留人+产品讲解+逼单+循环+应急话术',
    badge: '',
    tip: '适合做直播带货/团购促销',
  },
  {
    key: 'interaction',
    name: '互动转化话术包',
    desc: '评论区20条+私信10条+异议处理',
    badge: '',
    tip: '配合其他类型使用，提升评论区转化',
  },
  {
    key: 'calendar',
    name: '月度选题规划',
    desc: '30天内容日历+选题+类型+发布时间+标签',
    badge: '',
    tip: '一次性规划30天内容，省心省力',
  },
];

export const IP_OUTPUT_TYPES: OutputTypeDef[] = [
  {
    key: 'script',
    name: '短视频脚本（含分镜）',
    desc: '30-60秒 · 黄金3秒钩子+分镜画面+口播文案+字幕+BGM推荐',
    badge: '最常用',
    tip: '适合日常拍摄，包含完整分镜和口播',
  },
  {
    key: 'talking',
    name: '口播/真人讲话文案',
    desc: '开场钩子+核心话术+转化引导+互动收尾',
    badge: '最简单',
    tip: '适合老板/员工直接对着镜头说',
  },
  {
    key: 'vlog',
    name: '探店Vlog脚本',
    desc: '进店→体验→高潮→转化完整动线',
    badge: '种草首选',
    tip: '适合展示门店环境和服务体验',
    requireBusinessLink: true,
  },
  {
    key: 'interaction',
    name: '互动转化话术包',
    desc: '评论区20条+私信10条+异议处理',
    badge: '',
    tip: '配合其他类型使用，提升评论区转化',
  },
  {
    key: 'calendar',
    name: '月度选题规划',
    desc: '30天内容日历+选题+类型+发布时间+标签',
    badge: '',
    tip: '一次性规划30天内容，省心省力',
  },
];

// ============ 价格区间（客单价） ============
export const PRICE_RANGES: Array<{ key: string; label: string }> = [
  { key: 'under_20', label: '20元以下' },
  { key: '20_50', label: '20-50元' },
  { key: '50_100', label: '50-100元' },
  { key: '100_200', label: '100-200元' },
  { key: '200_500', label: '200-500元' },
  { key: '500_1000', label: '500-1000元' },
  { key: 'over_1000', label: '1000元以上' },
];

// ============ 年龄区间（抖音本地推标准） ============
export const AGE_RANGES: Array<{ key: string; label: string }> = [
  { key: '18_23', label: '18-23岁' },
  { key: '24_30', label: '24-30岁' },
  { key: '31_40', label: '31-40岁' },
  { key: '41_49', label: '41-49岁' },
  { key: '50_plus', label: '50岁以上' },
];

// ============ IP 内容方向 ============
export const IP_DIRECTIONS: Array<{ key: string; label: string }> = [
  { key: 'store_review', label: '探店测评' },
  { key: 'food_recommend', label: '美食种草' },
  { key: 'lifestyle', label: '生活方式' },
  { key: 'emotion', label: '情感共鸣' },
  { key: 'knowledge', label: '干货科普' },
  { key: 'plot_twist', label: '剧情反转' },
  { key: 'brand_story', label: '品牌故事' },
  { key: 'product_show', label: '产品展示' },
  { key: 'humor', label: '搞笑段子' },
  { key: 'testimonial', label: '真实测评' },
  { key: 'diy_tutorial', label: '教程/干货' },
  { key: 'vlog', label: 'Vlog / 日常记录' },
];

// ============ 团购套餐模板库（按二级类目细分，含通用模板） ============
export interface GroupBuyTemplate {
  name: string;
  original: string;
  price: string;
  content: string;
}

export const GROUP_BUY_TEMPLATES: Record<string, GroupBuyTemplate[]> = {
  // ========= 美食类 =========
  hotpot: [
    {
      name: '双人经典套餐',
      original: '298',
      price: '158',
      content: '现切牛肉拼盘 400g × 1、手打牛丸 × 1份、时令蔬菜大拼盘 × 1、饮品 × 2、酱料台自助',
    },
    {
      name: '四人聚餐套餐',
      original: '588',
      price: '328',
      content: '现切牛肉拼盘 800g × 1、手打牛丸 × 2份、涮菜大拼 × 1、招牌汤底 × 1、饮品 × 4、水果甜品 × 1',
    },
    {
      name: '单人尊享套餐',
      original: '158',
      price: '88',
      content: '现切牛肉拼盘 200g × 1、手打牛丸 × 1份、时令蔬菜 × 1、招牌汤底 × 1、饮品 × 1',
    },
  ],
  bbq: [
    {
      name: '双人烧烤套餐',
      original: '258',
      price: '128',
      content: '烤牛肉 × 300g、烤羊肉串 × 20串、烤鸡翅 × 8只、烤茄子 × 2份、饮品 × 2',
    },
    {
      name: '四人聚会套餐',
      original: '498',
      price: '268',
      content: '烤肉大拼盘 × 800g、烤海鲜拼盘 × 1、烤蔬菜 × 4份、招牌小吃 × 2、饮品 × 4',
    },
  ],
  chinese: [
    {
      name: '双人商务简餐',
      original: '188',
      price: '99',
      content: '招牌菜 × 2道、时令蔬菜 × 1道、汤 × 1、米饭 × 2份、饮品 × 2',
    },
    {
      name: '四人家庭聚餐',
      original: '458',
      price: '258',
      content: '招牌大菜 × 4道、精品热菜 × 2道、时令汤品 × 1、米饭 × 4份、水果拼盘 × 1',
    },
  ],
  japanese_korean: [
    {
      name: '双人日料套餐',
      original: '328',
      price: '188',
      content: '刺身拼盘 × 1、寿司拼盘 × 1、烤鳗鱼 × 1份、味增汤 × 2、饮品 × 2',
    },
  ],
  western: [
    {
      name: '双人西餐套餐',
      original: '368',
      price: '198',
      content: '前菜 × 2、主菜 × 2 (牛排/意面二选一)、甜品 × 2、饮品 × 2',
    },
  ],
  cafe: [
    {
      name: '双人下午茶',
      original: '158',
      price: '78',
      content: '手工咖啡/茶饮 × 2杯、招牌甜品 × 2份、精美小点 × 1份',
    },
  ],
  bakery: [
    {
      name: '生日蛋糕套餐',
      original: '288',
      price: '158',
      content: '8寸招牌蛋糕 × 1、生日蜡烛 × 1套、精美贺卡 × 1、免费配送同城',
    },
  ],
  fast_food: [
    {
      name: '单人工作餐',
      original: '58',
      price: '28',
      content: '招牌主食 × 1、配菜 × 1、饮品 × 1',
    },
  ],
  drinks: [
    {
      name: '双人饮品套餐',
      original: '68',
      price: '35',
      content: '招牌饮品 × 2、小食 × 1份',
    },
  ],
  buffet: [
    {
      name: '成人自助餐',
      original: '198',
      price: '118',
      content: '自助任食 × 单人、免费畅饮软饮、含海鲜 / 现切肉品',
    },
  ],
  // ========= 丽人 =========
  hair: [
    {
      name: '洗剪吹套餐',
      original: '188',
      price: '68',
      content: '专业洗发 × 1、发型师剪发 × 1、造型吹整 × 1',
    },
    {
      name: '烫染护理套餐',
      original: '888',
      price: '388',
      content: '专业烫发 × 1、时尚染色 × 1、深层护理 × 1、造型吹整 × 1',
    },
  ],
  nail: [
    {
      name: '美甲精致套餐',
      original: '188',
      price: '88',
      content: '基础护理 × 1、指甲彩绘 × 1、亮油封层 × 1、赠送小饰品',
    },
  ],
  beauty_spa: [
    {
      name: '深层清洁护理',
      original: '588',
      price: '198',
      content: '深层清洁 × 1、面部按摩 × 30分钟、面膜护理 × 1、赠送肩颈按摩',
    },
    {
      name: '皮肤管理套餐',
      original: '1288',
      price: '588',
      content: '专业皮肤检测 × 1、深层清洁 × 1、水光针护理 × 1、术后修护面膜 × 1',
    },
  ],
  // ========= 休闲娱乐 =========
  ktv: [
    {
      name: '双人欢唱套餐',
      original: '198',
      price: '99',
      content: '小包厢欢唱 × 3小时、饮品 × 2、小食拼盘 × 1',
    },
    {
      name: '多人欢唱套餐',
      original: '498',
      price: '258',
      content: '中包厢欢唱 × 4小时、酒水套餐 × 1、水果拼盘 × 1、小食大拼 × 1',
    },
  ],
  escape_room: [
    {
      name: '双人密室套餐',
      original: '298',
      price: '158',
      content: '主题密室体验 × 2位、专业NPC陪玩、拍照留念',
    },
  ],
  bar: [
    {
      name: '双人小酌套餐',
      original: '298',
      price: '158',
      content: '招牌鸡尾酒 × 2杯、精品小食拼盘 × 1、赠送葡萄酒 × 1瓶',
    },
  ],
  spa: [
    {
      name: '轻奢泡浴套餐',
      original: '298',
      price: '158',
      content: '汗蒸/泡浴 × 2小时、精油按摩 × 60分钟、简餐 × 1、饮品无限',
    },
  ],
  // ========= 运动健身 =========
  fitness: [
    {
      name: '健身月卡',
      original: '588',
      price: '199',
      content: '全馆器械畅练 × 30天、私教体验课 × 1节、免费储物柜 × 30天',
    },
    {
      name: '私教10节课包',
      original: '2988',
      price: '1288',
      content: '一对一私教课 × 10节、身体成分检测 × 1次、饮食建议 × 1份',
    },
  ],
  yoga: [
    {
      name: '瑜伽体验月卡',
      original: '588',
      price: '198',
      content: '全部瑜伽课程畅上 × 30天、赠送瑜伽垫 × 1',
    },
  ],
  // ========= 亲子 =========
  kids_park: [
    {
      name: '儿童乐园畅玩',
      original: '198',
      price: '88',
      content: '全部游乐设施畅玩 × 单人、赠送小食 × 1份',
    },
  ],
  kids_photo: [
    {
      name: '宝宝百天纪念',
      original: '1288',
      price: '499',
      content: '主题拍摄 × 3套、精修 × 20张、相册 × 1本、赠送电子档全套',
    },
  ],
  // ========= 医疗健康 =========
  dental: [
    {
      name: '洁牙护齿套餐',
      original: '388',
      price: '99',
      content: '专业超声波洁牙 × 1、口腔全面检查 × 1、抛光美白 × 1',
    },
  ],
  // ========= 教育培训 =========
  language: [
    {
      name: '试听体验课',
      original: '298',
      price: '9.9',
      content: '专业课程 × 3节、水平测评 × 1、学习方案定制 × 1',
    },
  ],
  // ========= 通用 =========
  general: [
    {
      name: '入门体验套餐',
      original: '198',
      price: '88',
      content: '基础服务 × 1、赠送小礼品 × 1',
    },
    {
      name: '标准畅享套餐',
      original: '588',
      price: '288',
      content: '完整服务体验 × 1、进阶服务 × 1、赠送体验券 × 1',
    },
  ],
};

/** 获取指定二级类目的模板列表（缺省则返回通用模板） */
export function getTemplatesForCategory(categoryL2: string): GroupBuyTemplate[] {
  return GROUP_BUY_TEMPLATES[categoryL2] ?? GROUP_BUY_TEMPLATES.general;
}

// ============ 表单类型定义 ============
export interface BusinessFormState {
  categoryL1: string;
  categoryL2: string;
  storeName: string;
  sellingPoints: string;
  price: string;
  location: string;
  // 运营定位（新增板块）
  accountStage?: string; // 新号起步/成长期/成熟期/断更回归
  presenter?: string; // 老板出镜/员工出镜/达人出镜/无人出镜
  copywritingStyle?: string[]; // 接地气/高级感/搞笑/走心/专业/冲突反转
  benchmarkAccount?: string; // 对标账号
  // 团购套餐信息（团购是本地生活获客核心，作为基础信息）
  groupBuyName: string;
  groupBuyOriginal: string;
  groupBuyPrice: string;
  groupBuyContent: string;
  // 拍摄条件（新增）
  shootingConditions?: {
    ownerOnCamera?: boolean; // 老板是否出镜
    hasOpenKitchen?: boolean; // 是否有明档厨房
    canFilmKitchen?: boolean; // 是否能拍后厨
    canFilmCustomers?: boolean; // 是否能拍顾客
    hasStorefront?: boolean; // 是否有门头素材
    hasMakingProcess?: boolean; // 是否有制作过程素材
    hasIngredients?: boolean; // 是否有食材/原料素材
    canFilmEnvironment?: boolean; // 是否能拍店内环境
  };
  // 创作约束（新增）
  creativeConstraints?: {
    targetAudience?: string; // 目标客群描述
    activityTime?: string; // 活动时间/有效期
    mustInclude?: string; // 必须出现的内容
    mustAvoid?: string; // 禁止出现的内容
  };
}

export interface IpFormState {
  positioning: string;
  direction: string[];
  differentiator: string;
  // 新增：IP 昵称/账号名（可选）
  ipName?: string;
  // 新增：账号阶段（新号/成长期/爆款期）
  accountStage?: string;
  // 新增：核心内容主题（可自由输入，如"低预算装修""独居女生美食"）
  topic?: string;
  // 新增：目标性别倾向（可选：不限/女性偏多/男性偏多）
  audienceGender?: string;
  // 新增：语言风格（干货型/情绪型/搞笑型/知性型/亲和型）
  tone?: string;
  // 新增：视频形式（真人出镜/图文/剪辑/画外音）
  videoForm?: string;
  // 新增：转化目标（涨粉/带货/引流到店/私域添加）
  conversionGoal?: string;
  // 新增：禁忌关键词（希望避免出现的词，如"最"字广告法违禁词）
  avoidWords?: string;
  // 是否关联商家（探店 / 带货场景）
  linkBusiness: boolean;
  linkedBusiness: BusinessFormState;
}

export const defaultBusinessForm: BusinessFormState = {
  categoryL1: 'food',
  categoryL2: 'hotpot',
  storeName: '',
  sellingPoints: '',
  price: '',
  location: '',
  accountStage: '',
  presenter: '',
  copywritingStyle: [],
  benchmarkAccount: '',
  groupBuyName: '',
  groupBuyOriginal: '',
  groupBuyPrice: '',
  groupBuyContent: '',
  shootingConditions: {
    ownerOnCamera: false,
    hasOpenKitchen: false,
    canFilmKitchen: false,
    canFilmCustomers: false,
    hasStorefront: true,
    hasMakingProcess: false,
    hasIngredients: false,
    canFilmEnvironment: true,
  },
  creativeConstraints: {
    targetAudience: '',
    activityTime: '',
    mustInclude: '',
    mustAvoid: '',
  },
};

export const defaultIpForm: IpFormState = {
  positioning: '',
  direction: [],
  differentiator: '',
  ipName: '',
  accountStage: '',
  topic: '',
  audienceGender: '',
  tone: '',
  videoForm: '',
  conversionGoal: '',
  avoidWords: '',
  linkBusiness: false,
  linkedBusiness: { ...defaultBusinessForm },
};

// ============ IP 补充选项 ============
export const IP_ACCOUNT_STAGES: Array<{ key: string; label: string }> = [
  { key: 'new', label: '起号期（0-1k粉）' },
  { key: 'growing', label: '成长期（1k-1w粉）' },
  { key: 'mature', label: '成熟期（1w-10w粉）' },
  { key: 'top', label: '爆款期（10w+粉）' },
];

export const IP_TONES: Array<{ key: string; label: string }> = [
  { key: 'expert', label: '干货型（专业理性）' },
  { key: 'emotional', label: '情绪型（共鸣煽动）' },
  { key: 'humorous', label: '搞笑型（段子玩梗）' },
  { key: 'intellectual', label: '知性型（有观点有深度）' },
  { key: 'friendly', label: '亲和型（邻家闺蜜/大哥）' },
  { key: 'sharp', label: '锐评型（敢说犀利）' },
];

export const IP_VIDEO_FORMS: Array<{ key: string; label: string }> = [
  { key: 'real_person', label: '真人出镜口播' },
  { key: 'vlog', label: 'Vlog / 生活跟拍' },
  { key: 'graphic', label: '图文卡片' },
  { key: 'edit', label: '素材剪辑 + 画外音' },
  { key: 'voiceover', label: '纯画外音 + B-roll' },
  { key: 'plot', label: '剧情演绎' },
];

export const IP_CONVERSION_GOALS: Array<{ key: string; label: string }> = [
  { key: 'follow', label: '涨粉（提升关注率）' },
  { key: 'engage', label: '互动（评论 + 收藏）' },
  { key: 'gmv', label: '直接带货 / GMV' },
  { key: 'store_visit', label: '引流到店' },
  { key: 'private', label: '导流到私域（微信/群）' },
  { key: 'brand', label: '品牌心智渗透' },
];

export const IP_AUDIENCE_GENDERS: Array<{ key: string; label: string }> = [
  { key: 'all', label: '不限' },
  { key: 'female_more', label: '女性为主' },
  { key: 'male_more', label: '男性为主' },
];

// BGM 风格选项（覆盖抖音本地生活/IP 类主流配乐调性）
export const BGM_OPTIONS: Array<{ key: string; label: string; desc: string }> = [
  { key: '', label: '不指定（AI 智能推荐）', desc: '按内容自动匹配' },
  { key: 'trending_hot', label: '卡点热门（BPM 快、节奏鼓点）', desc: '适合切片、快闪、多镜头切换' },
  { key: 'urban_chill', label: '都市轻松（Lo-fi / City Pop）', desc: '适合探店、Vlog、生活方式' },
  { key: 'warm_narrative', label: '温情叙事（钢琴 + 弦乐）', desc: '适合故事线、情感转折、亲情美食' },
  { key: 'guochao', label: '国风国潮（琵琶古筝 + 电子）', desc: '适合中式茶饮、火锅、古风元素' },
  { key: 'dj_energetic', label: 'DJ 动感（电子 House）', desc: '适合夜店餐厅、KTV、清吧、健身' },
  { key: 'suspense_flip', label: '悬念反转（低音鼓 + Drop）', desc: '适合痛点反转、避坑揭秘型' },
  { key: 'healing', label: '温馨治愈（原声吉他 / 木质乐器）', desc: '适合亲子、宠物、烘焙、下午茶' },
  { key: 'retro', label: '复古怀旧（老磁带音质 / 民谣）', desc: '适合家常菜、老字号、90 年代情怀' },
  { key: 'shake_pop', label: '抖音爆款 BGM（当下热门神曲）', desc: '流量红利，蹭当下热榜' },
  { key: 'none', label: '无 BGM（纯人声 / 环境音）', desc: '真实感强，适合干货口播' },
];

// 辅助：从 key 数组翻译为中文标签数组
export function translatePriceRange(key: string): string {
  return PRICE_RANGES.find((p) => p.key === key)?.label ?? key;
}
export function translateIpDirections(keys: string[]): string[] {
  return keys.map((k) => IP_DIRECTIONS.find((d) => d.key === k)?.label ?? k);
}
