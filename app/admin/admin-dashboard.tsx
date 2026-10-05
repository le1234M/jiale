"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Plus,
  Trash2,
  RotateCcw,
  Pause,
  Play,
  LogOut,
  X,
  Search,
} from "lucide-react";
import { DOUYIN_CATEGORIES } from "@/lib/industry-categories";
import { PRICE_RANGES, AGE_RANGES } from "@/lib/copywriting-config";

interface StoreDefaults {
  categoryL1?: string;
  categoryL2?: string;
  storeName?: string;
  sellingPoints?: string;
  priceRange?: string;
  audience?: string;
  location?: string;
}

interface Merchant {
  id: string;
  name: string;
  password: string;
  expiryDate: string;
  quotaTotal: number | null;
  quotaUsed: number;
  createdAt: string;
  note?: string;
  disabled?: boolean;
  storeDefaults?: StoreDefaults;
}

interface Summary {
  total: number;
  active: number;
  expired: number;
  disabled: number;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

function daysBetween(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getExpiringSoon(merchants: Merchant[]): Merchant[] {
  const now = Date.now();
  return merchants
    .filter((m) => {
      if (m.disabled) return false;
      const days = daysBetween(m.expiryDate);
      return days >= 0 && days <= 14;
    })
    .sort((a, b) => daysBetween(a.expiryDate) - daysBetween(b.expiryDate));
}

function getTopUsage(merchants: Merchant[]): Merchant[] {
  return [...merchants]
    .filter((m) => m.quotaUsed > 0)
    .sort((a, b) => b.quotaUsed - a.quotaUsed)
    .slice(0, 5);
}

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export default function AdminDashboard() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    active: 0,
    expired: 0,
    disabled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Merchant | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/merchants");
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setMerchants(data.merchants);
        setSummary(data.summary);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash("已复制");
    } catch {
      flash("复制失败");
    }
  }

  async function handleDelete(m: Merchant) {
    if (!confirm(`确认删除商家「${m.name}」？此操作不可恢复。`)) return;
    const res = await fetch(`/api/admin/merchants/${m.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      flash("已删除");
      load();
    }
  }

  async function handleToggle(m: Merchant) {
    await fetch(`/api/admin/merchants/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled: !m.disabled }),
    });
    flash(m.disabled ? "已启用" : "已停用");
    load();
  }

  async function handleResetQuota(m: Merchant) {
    await fetch(`/api/admin/merchants/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resetQuota" }),
    });
    flash("使用次数已重置");
    load();
  }

  async function handleQuickExtend(m: Merchant, days: number) {
    const newDate = new Date(
      Math.max(Date.now(), new Date(m.expiryDate).getTime()) +
        days * 24 * 60 * 60 * 1000
    );
    const res = await fetch(`/api/admin/merchants/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expiryDate: newDate.toISOString(),
      }),
    });
    if (res.ok) {
      flash(`已续期 ${days} 天`);
      load();
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin/login");
  }

  const filtered = merchants.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.password.toLowerCase().includes(q) ||
      (m.note || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0A162E] text-[#F5F0E4]">
      {/* Header */}
      <header className="border-b border-[#D4AF6A]/15 bg-[#12213F]/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-tight">
              佳乐本地生活服务 · 管理后台
            </h1>
            <div className="text-xs text-[#8B94A8] mt-0.5 tracking-[0.15em]">
              MERCHANT AUTHORIZATION CONSOLE
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[#D4AF6A]/40 text-[#D4AF6A] text-sm hover:bg-[#D4AF6A]/10 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            退出登录
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="总账号数" value={summary.total} tone="ivory" />
          <StatCard label="有效账号" value={summary.active} tone="gold" />
          <StatCard label="已过期" value={summary.expired} tone="grey" />
          <StatCard label="已停用" value={summary.disabled} tone="warn" />
        </div>

        {/* Expiring Soon & Top Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#12213F] border border-[#D4AF6A]/15 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#E8C989] flex items-center gap-2 mb-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E8C989]" />
              即将到期（14 天内）
            </h3>
            {(() => {
              const soon = getExpiringSoon(merchants);
              if (soon.length === 0)
                return <p className="text-xs text-[#8B94A8]">暂无即将到期的商家</p>;
              return (
                <div className="space-y-2">
                  {soon.map((m) => {
                    const d = daysBetween(m.expiryDate);
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-[#F5F0E4]">{m.name}</span>
                        <span
                          className={`font-mono ${
                            d <= 3 ? "text-[#C25A5A]" : "text-[#D4AF6A]"
                          }`}
                        >
                          {d === 0 ? "今天到期" : `${d} 天后到期`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          <div className="bg-[#12213F] border border-[#D4AF6A]/15 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#E8C989] flex items-center gap-2 mb-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E8C989]" />
              使用排行
            </h3>
            {(() => {
              const top = getTopUsage(merchants);
              if (top.length === 0)
                return (
                  <p className="text-xs text-[#8B94A8]">暂无使用数据</p>
                );
              return (
                <div className="space-y-2">
                  {top.map((m, i) => {
                    const usageStr =
                      m.quotaTotal === null
                        ? `${m.quotaUsed} 次`
                        : `${m.quotaUsed} / ${m.quotaTotal}`;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              i === 0
                                ? "bg-[#D4AF6A]/20 text-[#E8C989]"
                                : "bg-[#1B2E56] text-[#8B94A8]"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="text-[#F5F0E4]">{m.name}</span>
                        </span>
                        <span className="text-[#8B94A8] font-mono">
                          {usageStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="relative">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B94A8]"
              strokeWidth={1.5}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="按商家名 / 密码 / 备注搜索"
              className="h-10 pl-9 pr-3 w-72 rounded-lg bg-[#12213F] border border-[#1B2E56] focus:border-[#D4AF6A] outline-none text-sm placeholder:text-[#8B94A8] transition-colors"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-10 px-5 rounded-lg font-semibold text-[#0A162E] bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            新增商家账号
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#12213F] border border-[#D4AF6A]/15 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#8B94A8]">加载中…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-[#8B94A8]">
              {merchants.length === 0
                ? "还没有创建任何商家账号，点击右上角开始"
                : "没有找到匹配的商家"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0A162E]/50 text-[#8B94A8]">
                  <tr>
                    <th className="text-left py-3 px-4 font-normal">商家</th>
                    <th className="text-left py-3 px-4 font-normal">访问密码</th>
                    <th className="text-left py-3 px-4 font-normal">到期</th>
                    <th className="text-left py-3 px-4 font-normal">用量</th>
                    <th className="text-left py-3 px-4 font-normal">状态</th>
                    <th className="text-right py-3 px-4 font-normal">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const days = daysBetween(m.expiryDate);
                    const expired = days < 0;
                    const usageStr =
                      m.quotaTotal === null
                        ? `${m.quotaUsed} / 不限`
                        : `${m.quotaUsed} / ${m.quotaTotal}`;
                    return (
                      <tr
                        key={m.id}
                        className="border-t border-[#1B2E56] hover:bg-[#1B2E56]/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{m.name}</div>
                          {m.note && (
                            <div className="text-xs text-[#8B94A8] mt-0.5">
                              {m.note}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-[#D4AF6A] tracking-wider text-[13px]">
                              {m.password}
                            </code>
                            <button
                              onClick={() => handleCopy(m.password)}
                              title="复制密码"
                              className="text-[#8B94A8] hover:text-[#D4AF6A] transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>{formatDate(m.expiryDate)}</div>
                          <div
                            className={`text-xs mt-0.5 ${
                              expired
                                ? "text-[#C25A5A]"
                                : days <= 7
                                  ? "text-[#D4AF6A]"
                                  : "text-[#8B94A8]"
                            }`}
                          >
                            {expired ? `已过期 ${-days} 天` : `剩余 ${days} 天`}
                          </div>
                        </td>
                        <td className="py-3 px-4 tabular-nums">{usageStr}</td>
                        <td className="py-3 px-4">
                          <StatusBadge merchant={m} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <IconBtn
                              title="重置用量"
                              onClick={() => handleResetQuota(m)}
                            >
                              <RotateCcw
                                className="w-4 h-4"
                                strokeWidth={1.5}
                              />
                            </IconBtn>
                            <IconBtn
                              title={m.disabled ? "启用" : "停用"}
                              onClick={() => handleToggle(m)}
                            >
                              {m.disabled ? (
                                <Play className="w-4 h-4" strokeWidth={1.5} />
                              ) : (
                                <Pause className="w-4 h-4" strokeWidth={1.5} />
                              )}
                            </IconBtn>
                            <button
                              onClick={() => handleQuickExtend(m, 30)}
                              title="续期 30 天"
                              className="h-8 px-2 rounded-md text-[11px] text-[#D4AF6A] border border-[#D4AF6A]/30 hover:bg-[#D4AF6A]/10 transition-colors"
                            >
                              +30d
                            </button>
                            <button
                              onClick={() => handleQuickExtend(m, 90)}
                              title="续期 90 天"
                              className="h-8 px-2 rounded-md text-[11px] text-[#D4AF6A] border border-[#D4AF6A]/30 hover:bg-[#D4AF6A]/10 transition-colors"
                            >
                              +90d
                            </button>
                            <button
                              onClick={() => setEditing(m)}
                              className="h-8 px-3 rounded-md text-xs text-[#D4AF6A] border border-[#D4AF6A]/40 hover:bg-[#D4AF6A]/10 transition-colors"
                            >
                              编辑
                            </button>
                            <IconBtn
                              title="删除"
                              onClick={() => handleDelete(m)}
                              danger
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 text-xs text-[#8B94A8] leading-relaxed">
          <p>
            · 商家使用密码在链接 <span className="text-[#D4AF6A]">/</span>{" "}
            登录后生成文案。停用 / 到期 / 用量超限的账号会自动被拦截。
          </p>
          <p>
            · 客户续费后，点击「编辑」延长到期日期并「重置用量」即可继续使用。
          </p>
        </div>
      </main>

      {(showCreate || editing) && (
        <MerchantModal
          initial={editing ?? undefined}
          onClose={() => {
            setShowCreate(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowCreate(false);
            setEditing(null);
            load();
            flash(editing ? "已更新" : "已创建");
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#12213F] border border-[#D4AF6A]/40 text-[#F5F0E4] text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "gold" | "ivory" | "grey" | "warn";
}) {
  const toneClass = {
    gold: "text-[#E8C989]",
    ivory: "text-[#F5F0E4]",
    grey: "text-[#8B94A8]",
    warn: "text-[#C25A5A]",
  }[tone];
  return (
    <div className="bg-[#12213F] border border-[#D4AF6A]/15 rounded-xl px-5 py-4">
      <div className="text-xs text-[#8B94A8] tracking-wider">{label}</div>
      <div className={`text-2xl font-black mt-1 tabular-nums ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ merchant }: { merchant: Merchant }) {
  const expired = daysBetween(merchant.expiryDate) < 0;
  const overQuota =
    merchant.quotaTotal !== null && merchant.quotaUsed >= merchant.quotaTotal;
  let label = "正常";
  let cls = "bg-[#D4AF6A]/15 text-[#E8C989] border-[#D4AF6A]/30";
  if (merchant.disabled) {
    label = "已停用";
    cls = "bg-[#C25A5A]/10 text-[#C25A5A] border-[#C25A5A]/30";
  } else if (expired) {
    label = "已过期";
    cls = "bg-[#8B94A8]/10 text-[#8B94A8] border-[#8B94A8]/30";
  } else if (overQuota) {
    label = "已用完";
    cls = "bg-[#C25A5A]/10 text-[#C25A5A] border-[#C25A5A]/30";
  }
  return (
    <span className={`text-xs px-2 py-1 rounded border ${cls}`}>{label}</span>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors ${
        danger
          ? "border-[#C25A5A]/30 text-[#C25A5A] hover:bg-[#C25A5A]/10"
          : "border-[#1B2E56] text-[#8B94A8] hover:text-[#D4AF6A] hover:border-[#D4AF6A]/40"
      }`}
    >
      {children}
    </button>
  );
}

function MerchantModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Merchant;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [expiryDate, setExpiryDate] = useState(() =>
    initial
      ? toDateInput(initial.expiryDate)
      : toDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
  );
  const [quotaMode, setQuotaMode] = useState<"limited" | "unlimited">(
    initial && initial.quotaTotal !== null ? "limited" : "unlimited",
  );
  const [quotaTotal, setQuotaTotal] = useState(
    initial?.quotaTotal?.toString() ?? "200",
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const sd0 = initial?.storeDefaults ?? {};
  const [categoryL1, setCategoryL1] = useState(sd0.categoryL1 ?? "");
  const [categoryL2, setCategoryL2] = useState(sd0.categoryL2 ?? "");
  const [storeName, setStoreName] = useState(sd0.storeName ?? "");
  const [sellingPoints, setSellingPoints] = useState(sd0.sellingPoints ?? "");
  const [priceRange, setPriceRange] = useState(sd0.priceRange ?? "");
  const [audience, setAudience] = useState(sd0.audience ?? "");
  const [location, setLocation] = useState(sd0.location ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const l1Options = DOUYIN_CATEGORIES;
  const l2Options =
    DOUYIN_CATEGORIES.find((c) => c.key === categoryL1)?.children ?? [];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const body = {
        name: name.trim(),
        password: password.trim() || undefined,
        expiryDate: new Date(expiryDate + "T23:59:59Z").toISOString(),
        quotaTotal:
          quotaMode === "unlimited" ? null : Number(quotaTotal || 0),
        note: note.trim(),
        storeDefaults: {
          categoryL1,
          categoryL2,
          storeName: storeName.trim(),
          sellingPoints: sellingPoints.trim(),
          priceRange,
          audience,
          location: location.trim(),
        },
      };
      const url = isEdit
        ? `/api/admin/merchants/${initial!.id}`
        : `/api/admin/merchants`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        setErr(data.message || "保存失败");
      }
    } catch {
      setErr("网络错误");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#12213F] border border-[#D4AF6A]/25 rounded-xl shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(212,175,106,0.15),transparent_70%)] pointer-events-none" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF6A]/15 relative">
          <h3 className="font-semibold text-[#F5F0E4]">
            {isEdit ? "编辑商家账号" : "新增商家账号"}
          </h3>
          <button
            onClick={onClose}
            className="text-[#8B94A8] hover:text-[#F5F0E4] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <form
          onSubmit={handleSave}
          className="px-6 py-5 space-y-4 relative max-h-[70vh] overflow-y-auto"
        >
          <Field label="商家名称 *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：上海静安·某火锅店"
              required
              className="modal-input"
            />
          </Field>

          <Field label="访问密码">
            <div className="flex gap-2">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="留空自动生成，如 JL-A3K9XM"
                className="modal-input flex-1"
              />
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => setPassword("")}
                  className="h-11 px-3 rounded-lg text-xs text-[#8B94A8] border border-[#1B2E56] hover:border-[#D4AF6A]/40 transition-colors"
                >
                  自动生成
                </button>
              )}
            </div>
          </Field>

          <Field label="到期日期 *">
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="modal-input"
            />
            <div className="flex gap-2 mt-2">
              {[7, 30, 90, 365].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() =>
                    setExpiryDate(
                      toDateInput(
                        new Date(
                          Date.now() + days * 24 * 60 * 60 * 1000,
                        ).toISOString(),
                      ),
                    )
                  }
                  className="text-xs h-7 px-2 rounded border border-[#1B2E56] text-[#8B94A8] hover:border-[#D4AF6A]/40 hover:text-[#D4AF6A] transition-colors"
                >
                  +{days}天
                </button>
              ))}
            </div>
          </Field>

          <Field label="使用次数限制">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setQuotaMode("limited")}
                className={`h-9 px-3 rounded text-xs border transition-colors ${quotaMode === "limited" ? "border-[#D4AF6A] text-[#D4AF6A] bg-[#D4AF6A]/10" : "border-[#1B2E56] text-[#8B94A8]"}`}
              >
                有限次
              </button>
              <button
                type="button"
                onClick={() => setQuotaMode("unlimited")}
                className={`h-9 px-3 rounded text-xs border transition-colors ${quotaMode === "unlimited" ? "border-[#D4AF6A] text-[#D4AF6A] bg-[#D4AF6A]/10" : "border-[#1B2E56] text-[#8B94A8]"}`}
              >
                不限次
              </button>
            </div>
            {quotaMode === "limited" && (
              <input
                type="number"
                min={1}
                value={quotaTotal}
                onChange={(e) => setQuotaTotal(e.target.value)}
                className="modal-input"
                placeholder="例：200"
              />
            )}
          </Field>

          <Field label="备注（选填）">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="联系人 / 微信 / 客户等级 ..."
              className="modal-input"
            />
          </Field>

          {/* ── 默认门店信息（预填，商家登录后自动带入） ── */}
          <div className="pt-2 border-t border-[#D4AF6A]/15">
            <div className="text-xs text-[#D4AF6A] font-medium mb-3">
              默认门店信息（选填，商家登录后自动带入）
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="一级类目">
                <select
                  value={categoryL1}
                  onChange={(e) => {
                    setCategoryL1(e.target.value);
                    setCategoryL2("");
                  }}
                  className="modal-input"
                >
                  <option value="">未选择</option>
                  {l1Options.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="二级类目">
                <select
                  value={categoryL2}
                  onChange={(e) => setCategoryL2(e.target.value)}
                  disabled={!categoryL1}
                  className="modal-input disabled:opacity-50"
                >
                  <option value="">未选择</option>
                  {l2Options.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="门店名">
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="例：老余家豆花火锅（沁水店）"
                className="modal-input"
              />
            </Field>
            <Field label="核心卖点">
              <textarea
                value={sellingPoints}
                onChange={(e) => setSellingPoints(e.target.value)}
                placeholder="例：手打鲜牛肉、24小时熬骨汤、开业3年老店..."
                rows={2}
                className="modal-input resize-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="客单价区间">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="modal-input"
                >
                  <option value="">未选择</option>
                  {PRICE_RANGES.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="主力客群">
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="modal-input"
                >
                  <option value="">未选择</option>
                  {AGE_RANGES.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="门店位置">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例：上海市静安区南京西路XXX号"
                className="modal-input"
              />
            </Field>
          </div>

          {err && (
            <div className="text-sm text-[#C25A5A] px-3 py-2 rounded bg-[#C25A5A]/10 border border-[#C25A5A]/30">
              {err}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg text-sm text-[#8B94A8] border border-[#1B2E56] hover:text-[#F5F0E4] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-6 rounded-lg text-sm font-semibold text-[#0A162E] bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] hover:brightness-110 disabled:opacity-60 transition-all"
            >
              {saving ? "保存中…" : isEdit ? "保存修改" : "创建账号"}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        :global(.modal-input) {
          height: 44px;
          width: 100%;
          padding: 0 12px;
          background: #0a162e;
          border: 1px solid #1b2e56;
          border-radius: 8px;
          color: #f5f0e4;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        :global(.modal-input:focus) {
          border-color: #d4af6a;
        }
        :global(.modal-input::placeholder) {
          color: #8b94a8;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-[#8B94A8] mb-1.5 tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
