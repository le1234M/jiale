import crypto from "crypto";
import { getSupabaseClient } from "@/storage/database/supabase-client";

/** ────────────────────────────────────────────────────
 * 佳乐本地生活服务 · 商家授权管理
 *
 * 支持多商家独立密码 + 到期时间 + 使用次数限制。
 * 数据以 Supabase 数据库持久化存储。
 * ──────────────────────────────────────────────────── */

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "jiale-admin-2026";

export interface Merchant {
  id: string;
  name: string;
  password: string;
  expiryDate: string; // ISO
  quotaTotal: number | null; // null = unlimited
  quotaUsed: number;
  createdAt: string; // ISO
  note?: string;
  disabled?: boolean;
  /** 默认门店信息（管理员在后台预填，商家登录后自动带出） */
  storeDefaults?: {
    categoryL1?: string;
    categoryL2?: string;
    storeName?: string;
    sellingPoints?: string;
    priceRange?: string;
    audience?: string;
    location?: string;
  };
}

/** 数据库行记录 */
interface MerchantRow {
  id: string;
  name: string;
  password: string;
  expiry_date: string;
  quota_total: number | null;
  quota_used: number;
  created_at: string;
  note: string | null;
  disabled: boolean;
  category_l1?: string | null;
  category_l2?: string | null;
  store_name?: string | null;
  selling_points?: string | null;
  price_range?: string | null;
  audience?: string | null;
  location?: string | null;
}

function rowToMerchant(row: MerchantRow): Merchant {
  return {
    id: row.id,
    name: row.name,
    password: row.password,
    expiryDate: row.expiry_date,
    quotaTotal: row.quota_total,
    quotaUsed: row.quota_used,
    createdAt: row.created_at,
    note: row.note ?? undefined,
    disabled: row.disabled,
    storeDefaults: {
      categoryL1: row.category_l1 ?? undefined,
      categoryL2: row.category_l2 ?? undefined,
      storeName: row.store_name ?? undefined,
      sellingPoints: row.selling_points ?? undefined,
      priceRange: row.price_range ?? undefined,
      audience: row.audience ?? undefined,
      location: row.location ?? undefined,
    },
  };
}

/** 生成便于口头传递的商家密码：JL-{6 字符} */
function generateMerchantPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pwd = "JL-";
  for (let i = 0; i < 6; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

/** ── 管理员验证 ── */
export function verifyAdmin(password: string): boolean {
  return password === DEFAULT_ADMIN_PASSWORD;
}

/** ── 管理员 Token 生成 ── */
export function generateAdminToken(): string {
  const payload = JSON.stringify({
    role: "admin",
    exp: Date.now() + 4 * 60 * 60 * 1000, // 4h
  });
  const hmac = crypto.createHmac("sha256", DEFAULT_ADMIN_PASSWORD);
  hmac.update(payload);
  return Buffer.from(payload).toString("base64") + "." + hmac.digest("hex");
}

/** ── 管理员 Token 验证 ── */
export function verifyAdminToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const payload = Buffer.from(parts[0], "base64").toString();
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return false;
    const hmac = crypto.createHmac("sha256", DEFAULT_ADMIN_PASSWORD);
    hmac.update(payload);
    return hmac.digest("hex") === parts[1];
  } catch {
    return false;
  }
}

/** ── 商家登录 ─ */
export async function verifyMerchant(password: string): Promise<Merchant | null> {
  const client = getSupabaseClient();
  if (!client) throw new Error("数据库未配置");
  if (!client) return null;
  
  const { data, error } = await client
    .from("merchants")
    .select("*")
    .eq("password", password)
    .maybeSingle();
  if (error) throw new Error(`验证商家失败: ${error.message}`);
  if (!data) return null;
  const row = data as MerchantRow;
  const merchant = rowToMerchant(row);

  // 检查是否禁用
  if (merchant.disabled) return null;
  // 检查是否过期
  if (new Date(merchant.expiryDate) < new Date()) return null;
  // 检查配额
  if (merchant.quotaTotal !== null && merchant.quotaUsed >= merchant.quotaTotal) return null;

  return merchant;
}

/** ── 获取商家 Token（用于 cookie） ── */
export function generateMerchantToken(merchant: Merchant): string {
  const payload = JSON.stringify({
    mid: merchant.id,
    name: merchant.name,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
  });
  const hmac = crypto.createHmac("sha256", merchant.password);
  hmac.update(payload);
  return Buffer.from(payload).toString("base64") + "." + hmac.digest("hex");
}

/** ── 验证商家 Token ── */
export async function verifyMerchantToken(token: string): Promise<Merchant | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const payload = Buffer.from(parts[0], "base64").toString();
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;

    // 从数据库查找商家
    const client = getSupabaseClient();
  if (!client) throw new Error("数据库未配置");
    if (!client) return null;
    
    const { data: row, error } = await client
      .from("merchants")
      .select("*")
      .eq("id", data.mid)
      .maybeSingle();
    if (error || !row) return null;

    const merchant = rowToMerchant(row as MerchantRow);
    if (merchant.disabled) return null;
    if (new Date(merchant.expiryDate) < new Date()) return null;
    if (merchant.quotaTotal !== null && merchant.quotaUsed >= merchant.quotaTotal) return null;

    // 验证签名
    const hmac = crypto.createHmac("sha256", merchant.password);
    hmac.update(payload);
    if (hmac.digest("hex") !== parts[1]) return null;

    return merchant;
  } catch {
    return null;
  }
}

/** ── 获取所有商家（管理员用） ── */
export async function getAllMerchants(): Promise<Merchant[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error("数据库未配置");
  if (!client) return [];
  
  const { data, error } = await client
    .from("merchants")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`获取商家列表失败: ${error.message}`);
  return (data as MerchantRow[]).map(rowToMerchant);
}

/** ── 添加商家 ── */
export async function addMerchant(params: {
  name: string;
  days: number;
  expiryDate?: string;
  quotaTotal: number | null;
  note?: string;
  storeDefaults?: {
    categoryL1?: string;
    categoryL2?: string;
    storeName?: string;
    sellingPoints?: string;
    priceRange?: string;
    audience?: string;
    location?: string;
  };
}): Promise<Merchant> {
  const password = generateMerchantPassword();
  const expiryDate = params.expiryDate
    ? params.expiryDate
    : new Date(Date.now() + params.days * 24 * 60 * 60 * 1000).toISOString();

  const sd = params.storeDefaults ?? {};
  const client = getSupabaseClient();
  if (!client) throw new Error("数据库未配置");
  if (!client) throw new Error("数据库未配置");
  
  const { data, error } = await client
    .from("merchants")
    .insert({
      name: params.name,
      password,
      expiry_date: expiryDate,
      quota_total: params.quotaTotal,
      quota_used: 0,
      note: params.note ?? null,
      disabled: false,
      category_l1: sd.categoryL1 ?? null,
      category_l2: sd.categoryL2 ?? null,
      store_name: sd.storeName ?? null,
      selling_points: sd.sellingPoints ?? null,
      price_range: sd.priceRange ?? null,
      audience: sd.audience ?? null,
      location: sd.location ?? null,
    })
    .select()
    .maybeSingle();

  if (error) throw new Error(`添加商家失败: ${error.message}`);
  if (!data) throw new Error("添加商家失败：未返回数据");

  return {
    ...rowToMerchant(data as MerchantRow),
    password, // 返回明文密码给管理员
  };
}

/** ── 使用配额（数据库原子递增，避免并发生成时覆盖计数） ── */
export async function useQuota(merchantId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('数据库未配置');

  const { data, error } = await client.rpc('increment_merchant_quota', {
    p_merchant_id: merchantId,
  });
  if (error) throw new Error(`更新配额失败: ${error.message}`);
  if (data !== true) throw new Error('配额已用完或商家不存在');
}

/** ── 更新商家 ── */
export async function updateMerchant(
  id: string,
  updates: Partial<{
    name: string;
    expiryDate: string;
    quotaTotal: number | null;
    note: string;
    disabled: boolean;
    password: string;
    storeDefaults: {
      categoryL1?: string;
      categoryL2?: string;
      storeName?: string;
      sellingPoints?: string;
      priceRange?: string;
      audience?: string;
      location?: string;
    };
  }>
): Promise<Merchant> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
  if (updates.quotaTotal !== undefined) dbUpdates.quota_total = updates.quotaTotal;
  if (updates.note !== undefined) dbUpdates.note = updates.note;
  if (updates.disabled !== undefined) dbUpdates.disabled = updates.disabled;
  if (updates.password !== undefined) dbUpdates.password = updates.password;
  if (updates.storeDefaults !== undefined) {
    const sd = updates.storeDefaults;
    if (sd.categoryL1 !== undefined) dbUpdates.category_l1 = sd.categoryL1 || null;
    if (sd.categoryL2 !== undefined) dbUpdates.category_l2 = sd.categoryL2 || null;
    if (sd.storeName !== undefined) dbUpdates.store_name = sd.storeName || null;
    if (sd.sellingPoints !== undefined) dbUpdates.selling_points = sd.sellingPoints || null;
    if (sd.priceRange !== undefined) dbUpdates.price_range = sd.priceRange || null;
    if (sd.audience !== undefined) dbUpdates.audience = sd.audience || null;
    if (sd.location !== undefined) dbUpdates.location = sd.location || null;
  }

  const client = getSupabaseClient();
  if (!client) throw new Error("数据库未配置");
  const { data, error } = await client
    .from("merchants")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(`更新商家失败: ${error.message}`);
  if (!data) throw new Error("更新商家失败：商家不存在");
  return rowToMerchant(data as MerchantRow);
}

/** ── 删除商家 ── */
export async function deleteMerchant(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error("数据库未配置");
  const { error } = await client.from("merchants").delete().eq("id", id);
  if (error) throw new Error(`删除商家失败: ${error.message}`);
}

/** ── 按 ID 查找商家 ── */
export async function getMerchantById(id: string): Promise<Merchant | null> {
  const client = getSupabaseClient();
  if (!client) throw new Error("数据库未配置");
  const { data, error } = await client
    .from("merchants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`查询商家失败: ${error.message}`);
  if (!data) return null;
  return rowToMerchant(data as MerchantRow);
}