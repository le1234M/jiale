/**
 * 抖音 / 视频号 / 广告法违禁词库与自动替换模块
 * 参考：
 *   - 抖音社区自律公约 2025
 *   - 微信视频号内容运营规范 2025
 *   - 《广告法》第九条极限用语
 *   - 《医疗广告管理办法》
 *   - 平台常见限流词库（截止 2026 Q1）
 */

/**
 * 违禁词 → 合规替换词
 * 命中 key 时会替换成 value；value 为空字符串则删除该词
 */
export const FORBIDDEN_WORD_MAP: Record<string, string> = {
  // ==== 广告法极限用语（第一梯队高危） ====
  最好: '很棒',
  最佳: '优选',
  最优: '优选',
  最新: '新款',
  最强: '出色',
  最大: '大',
  最小: '小',
  最高级: '高级',
  最高: '高',
  最低: '实惠',
  最便宜: '划算',
  最赚: '划算',
  第一: '首选',
  第一品牌: '知名品牌',
  第一名: '前列',
  独一无二: '与众不同',
  绝无仅有: '少有',
  举世无双: '出众',
  空前绝后: '出众',
  史无前例: '前所未见',
  国家级: '优秀',
  国际级: '优质',
  世界级: '优质',
  顶级: '出众',
  顶尖: '出众',
  巅峰: '出色',
  终极: '出色',
  极致: '出色',
  完美: '出色',
  永远: '长久',
  绝对: '很',
  '100%': '优秀',
  百分百: '优质',
  国家免检: '优质',
  驰名商标: '知名品牌',

  // ==== 医疗类禁用词（禁一切疗效暗示） ====
  治愈: '改善',
  治疗: '呵护',
  疗效: '效果',
  痊愈: '恢复',
  根治: '缓解',
  奇效: '效果',
  灵丹妙药: '优选',
  祖传秘方: '经典配方',
  祖传: '经典',
  抗癌: '养生',
  防癌: '养生',
  抗炎: '舒缓',
  减肥: '塑形',
  瘦身: '塑形',
  丰胸: '养护',
  壮阳: '养护',
  美白: '亮肤',
  祛斑: '亮肤',
  祛痘: '护肤',
  排毒: '清爽',

  // ==== 抖音本地生活平台限流词 ====
  加微信: '加联系方式',
  微信号: '联系方式',
  加v: '加联系方式',
  加V: '加联系方式',
  留言私聊: '评论区互动',
  私聊我: '评论区留言',
  私信我: '评论区留言',
  低价甩卖: '限时优惠',
  甩卖: '优惠',
  跳楼价: '限时价',
  骨折价: '限时价',
  白菜价: '亲民价',
  免费送: '限时特惠',
  免费领: '限时特惠',
  免费吃: '优惠品鉴',
  '0元购': '限时特惠',
  零元购: '限时特惠',
  暴利: '划算',
  快速致富: '增收',
  轻松月入: '增收',
  日入过万: '增收',
  躺赚: '增收',

  // ==== 虚假宣传 ====
  假一赔十: '品质保证',
  假一赔万: '品质保证',
  百分百正品: '正品保证',
  绝对正品: '正品保证',
  假一赔命: '品质保证',
  官方指定: '合作款',
  官方唯一: '合作款',
  官方授权: '合作款',
  独家代理: '合作款',
  唯一销售: '合作款',
  终身免费: '长期服务',
  永久免费: '长期服务',

  // ==== 视频号平台限流词 ====
  暴富: '增收',
  发财: '致富',
  一夜暴富: '收益提升',
  秒赚: '增收',
  躺平: '轻松',

  // ==== 敏感描述性词 ====
  最正宗: '正宗',
  最地道: '地道',
  最好吃: '好吃',
  最火: '热门',
  最爆: '热门',
  必吃: '推荐',
  必去: '推荐',
  必买: '推荐',
  必看: '推荐',
  神级: '出色',
  封神: '出色',
  王炸: '出色',
  炸裂: '惊艳',
  yyds: '出色',
  绝了: '很棒',
  绝绝子: '很棒',
};

/**
 * 敏感词硬性移除清单（无同义词替换，直接删掉整词）
 */
export const FORBIDDEN_WORDS_STRIP: string[] = [
  '国粹',
  '万无一失',
  '一步到位',
  '一劳永逸',
];

// 预排序：长词优先替换，防止短词覆盖长词
const SORTED_ENTRIES: Array<[string, string]> = Object.entries(FORBIDDEN_WORD_MAP).sort(
  (a, b) => b[0].length - a[0].length
);
const SORTED_STRIP: string[] = [...FORBIDDEN_WORDS_STRIP].sort((a, b) => b.length - a.length);

/**
 * 生成给 LLM 用的违禁词清单文本（用于 SYSTEM_PROMPT）
 */
export function buildForbiddenWordsInstruction(userAvoid?: string): string {
  const merchant = userAvoid?.trim() ? `\n- 用户额外指定的禁忌词：${userAvoid.trim()}` : '';
  return `【平台合规硬性红线（严禁出现以下类型词汇，AI 必须自我审查）】
- 广告法极限用语：最、第一、独一无二、绝对、100%、国家级、世界级、顶级、终极、完美、永远等
- 医疗疗效暗示：治愈、治疗、疗效、根治、抗癌、防癌、减肥、丰胸、壮阳、美白、祛斑等
- 引流违规词：加微信、加v、私聊我、私信我、微信号（应引导评论区互动或团购卡片）
- 虚假宣传：假一赔十、百分百正品、官方唯一、独家代理、终身免费、永久免费
- 平台限流词：暴富、日入过万、躺赚、一夜暴富、免费送、免费领、0元购、跳楼价、骨折价
- 神化词汇：yyds、绝了、绝绝子、封神、王炸、必吃、必去、神级
如需表达类似意思，请使用合规替代：优质、优选、知名、划算、出色、限时优惠、限时特惠、评论区互动、加联系方式、正品保证等。${merchant}
若仍出现违禁词，视为不合格输出。`;
}

/**
 * 一遍性替换所有违禁词
 */
export function sanitizeText(text: string): string {
  let result = text;
  for (const [bad, good] of SORTED_ENTRIES) {
    if (result.includes(bad)) {
      result = result.split(bad).join(good);
    }
  }
  for (const bad of SORTED_STRIP) {
    if (result.includes(bad)) {
      result = result.split(bad).join('');
    }
  }
  return result;
}

/**
 * 流式安全替换器
 * 用途：LLM 流式输出时，每次拿到 chunk 追加到 buffer；
 *      为避免"半个违禁词"跨 chunk 被漏掉，buffer 里只输出安全前缀，
 *      末尾保留一段"最长违禁词长度"作为悬挂区待下次校验；
 *      调用 flush() 拿到最终残留。
 */
export function createStreamSanitizer() {
  const maxLen = Math.max(
    ...SORTED_ENTRIES.map(([k]) => k.length),
    ...SORTED_STRIP.map((k) => k.length),
    2
  );
  let hangover = '';

  function feed(chunk: string): string {
    const combined = hangover + chunk;
    if (combined.length <= maxLen) {
      hangover = combined;
      return '';
    }
    const safeLen = combined.length - maxLen;
    const safePart = combined.slice(0, safeLen);
    hangover = combined.slice(safeLen);
    return sanitizeText(safePart);
  }

  function flush(): string {
    const rest = hangover;
    hangover = '';
    return sanitizeText(rest);
  }

  return { feed, flush };
}
