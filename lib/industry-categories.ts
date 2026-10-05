/**
 * 抖音来客（生活服务）官方一级 / 二级类目
 * 参考抖音来客后台商家资质分类，覆盖本地生活主流赛道
 */
export interface CategoryL2 {
  key: string;
  name: string;
}

export interface CategoryL1 {
  key: string;
  name: string;
  children: CategoryL2[];
}

export const DOUYIN_CATEGORIES: CategoryL1[] = [
  {
    key: 'food',
    name: '美食',
    children: [
      { key: 'chinese', name: '中餐' },
      { key: 'hotpot', name: '火锅' },
      { key: 'bbq', name: '烧烤烤肉' },
      { key: 'jp_kr', name: '日韩料理' },
      { key: 'western', name: '西餐' },
      { key: 'buffet', name: '自助餐' },
      { key: 'fastfood', name: '快餐小吃' },
      { key: 'dessert', name: '甜品烘焙' },
      { key: 'drink', name: '饮品茶饮' },
      { key: 'seafood', name: '海鲜' },
      { key: 'others_food', name: '其他' },
    ],
  },
  {
    key: 'leisure',
    name: '休闲娱乐',
    children: [
      { key: 'ktv', name: 'KTV' },
      { key: 'massage', name: '按摩足疗' },
      { key: 'escape', name: '密室剧本杀' },
      { key: 'net_bar', name: '电玩网咖' },
      { key: 'bar', name: '酒吧清吧' },
      { key: 'bath', name: '洗浴汗蒸' },
      { key: 'board_game', name: '棋牌室' },
      { key: 'arcade', name: '游乐游艺' },
      { key: 'others_leisure', name: '其他' },
    ],
  },
  {
    key: 'beauty',
    name: '丽人美业',
    children: [
      { key: 'hair', name: '美发' },
      { key: 'nail_lash', name: '美甲美睫' },
      { key: 'skin', name: '皮肤管理' },
      { key: 'makeup', name: '化妆造型' },
      { key: 'spa', name: 'SPA身体护理' },
      { key: 'tattoo', name: '纹身纹绣' },
      { key: 'others_beauty', name: '其他' },
    ],
  },
  {
    key: 'medical_beauty',
    name: '医美口腔',
    children: [
      { key: 'plastic', name: '整形微整' },
      { key: 'oral', name: '口腔齿科' },
      { key: 'medical_skin', name: '皮肤管理医疗' },
      { key: 'eye', name: '眼科视光' },
      { key: 'rehab', name: '康复理疗' },
      { key: 'others_medical', name: '其他' },
    ],
  },
  {
    key: 'kids',
    name: '亲子',
    children: [
      { key: 'kids_park', name: '儿童游乐' },
      { key: 'kids_edu', name: '亲子教育' },
      { key: 'kids_photo', name: '儿童摄影' },
      { key: 'kids_swim', name: '婴儿游泳' },
      { key: 'kids_activity', name: '亲子活动' },
      { key: 'baby_service', name: '母婴服务' },
      { key: 'others_kids', name: '其他' },
    ],
  },
  {
    key: 'sport',
    name: '运动健身',
    children: [
      { key: 'gym', name: '健身房' },
      { key: 'yoga', name: '瑜伽普拉提' },
      { key: 'badminton', name: '羽毛球' },
      { key: 'basketball', name: '篮球' },
      { key: 'swim', name: '游泳' },
      { key: 'pingpong', name: '乒乓球' },
      { key: 'tennis', name: '网球' },
      { key: 'dance', name: '舞蹈' },
      { key: 'martial', name: '武术搏击' },
      { key: 'others_sport', name: '其他' },
    ],
  },
  {
    key: 'education',
    name: '教育培训',
    children: [
      { key: 'language', name: '语言培训' },
      { key: 'art_music', name: '艺术音乐' },
      { key: 'dance_edu', name: '舞蹈培训' },
      { key: 'stem', name: 'STEM编程' },
      { key: 'exam', name: '考试考证' },
      { key: 'early_edu', name: '早教幼教' },
      { key: 'others_edu', name: '其他' },
    ],
  },
  {
    key: 'health',
    name: '医疗健康',
    children: [
      { key: 'tcm', name: '中医针灸' },
      { key: 'physical', name: '体检' },
      { key: 'vaccine', name: '疫苗接种' },
      { key: 'psychology', name: '心理咨询' },
      { key: 'nutrition', name: '营养保健' },
      { key: 'others_health', name: '其他' },
    ],
  },
  {
    key: 'hotel',
    name: '酒店民宿',
    children: [
      { key: 'star_hotel', name: '星级酒店' },
      { key: 'chain_hotel', name: '快捷酒店' },
      { key: 'boutique', name: '民宿客栈' },
      { key: 'apartment', name: '公寓酒店' },
      { key: 'camping', name: '露营房车' },
      { key: 'others_hotel', name: '其他' },
    ],
  },
  {
    key: 'life_service',
    name: '生活服务',
    children: [
      { key: 'housekeeping', name: '家政保洁' },
      { key: 'repair', name: '维修安装' },
      { key: 'moving', name: '搬家' },
      { key: 'laundry', name: '洗衣洗鞋' },
      { key: 'pet_service', name: '宠物服务' },
      { key: 'funeral', name: '殡葬服务' },
      { key: 'others_life', name: '其他' },
    ],
  },
  {
    key: 'auto',
    name: '汽车服务',
    children: [
      { key: 'car_wash', name: '洗车美容' },
      { key: 'car_repair', name: '维修保养' },
      { key: 'car_parts', name: '汽车零配件' },
      { key: 'car_rent', name: '租车代驾' },
      { key: 'car_insurance', name: '年检保险' },
      { key: 'driving', name: '驾校' },
      { key: 'car_mod', name: '改装贴膜' },
      { key: 'others_auto', name: '其他' },
    ],
  },
  {
    key: 'wedding',
    name: '婚庆摄影',
    children: [
      { key: 'wedding_plan', name: '婚庆策划' },
      { key: 'wedding_photo', name: '婚纱摄影' },
      { key: 'portrait', name: '写真个人摄影' },
      { key: 'event_plan', name: '活动策划' },
      { key: 'flower', name: '花艺绿植' },
      { key: 'others_wedding', name: '其他' },
    ],
  },
  {
    key: 'shopping',
    name: '零售购物',
    children: [
      { key: 'clothing', name: '服装鞋帽' },
      { key: 'super', name: '生鲜超市' },
      { key: 'tobacco', name: '烟酒店' },
      { key: 'pharmacy', name: '药店药房' },
      { key: 'digital', name: '数码家电' },
      { key: 'home', name: '家居家装' },
      { key: 'jewelry', name: '珠宝首饰' },
      { key: 'others_shop', name: '其他' },
    ],
  },
];

export function getCategoryLabel(l1Key: string, l2Key: string): string {
  const l1 = DOUYIN_CATEGORIES.find((c) => c.key === l1Key);
  if (!l1) return '';
  const l2 = l1.children.find((c) => c.key === l2Key);
  if (!l2) return l1.name;
  return `${l1.name} · ${l2.name}`;
}

export function findL1(l1Key: string): CategoryL1 | undefined {
  return DOUYIN_CATEGORIES.find((c) => c.key === l1Key);
}
