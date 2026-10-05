'use client';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Store,
  User,
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
  Loader2,
  Zap,
  Link2,
  ChevronDown,
  ChevronRight,
  KeyRound,
  Calendar,
} from 'lucide-react';
import { AnimatedBackground } from '@/components/animated-background';
import { AccountSwitcher } from '@/components/account-switcher';
import { OnboardingWizard } from '@/components/onboarding-wizard';
import { useAccounts } from '@/hooks/use-accounts';
import {
  BUSINESS_OUTPUT_TYPES,
  IP_OUTPUT_TYPES,
  defaultBusinessForm,
  defaultIpForm,
  PRICE_RANGES,
  IP_DIRECTIONS,
  IP_ACCOUNT_STAGES,
  IP_TONES,
  IP_VIDEO_FORMS,
  IP_CONVERSION_GOALS,
  IP_AUDIENCE_GENDERS,
  type BusinessFormState,
  type IpFormState,
  type OutputTypeDef,
} from '@/lib/copywriting-config';
import {
  DOUYIN_CATEGORIES,
  findL1,
} from '@/lib/industry-categories';
import { exportResultsToWord } from '@/lib/export-word';

type Status = 'idle' | 'streaming' | 'done' | 'error' | 'cancelled';

interface ResultItem {
  key: string;
  name: string;
  content: string;
  status: Status;
  error?: string;
}

type Mode = 'business' | 'ip';

export default function HomePage() {
  const [mode, setMode] = useState<Mode>('business');
  const DEFAULT_MODEL = 'doubao-seed-2-0-pro-260215';

  // ── 多账号管理 ──
  const {
    accounts,
    currentAccount,
    loading: accountsLoading,
    createAccount,
    deleteAccount,
    updateAccount,
    switchAccount: originalSwitchAccount,
    saveFormData,
    fetchAccounts,
  } = useAccounts();

  // 鉴权状态
  const [authState, setAuthState] = useState<'loading' | 'unauthorized' | 'authorized'>('loading');

  // 首次使用向导状态
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);
  const isLoggedIn = authState === 'authorized';
  const isCheckingAuth = authState === 'loading';

  // 当账号加载完成后，如果没有账号且未显示过向导，则显示首次使用向导
  useEffect(() => {
    if (!accountsLoading && accounts.length === 0 && !hasShownOnboarding && isLoggedIn) {
      setShowOnboarding(true);
      setHasShownOnboarding(true);
    }
  }, [accountsLoading, accounts.length, hasShownOnboarding, isLoggedIn]);

  // 切换账号时加载该账号保存的表单数据
  const switchAccount = useCallback((account: any) => {
    originalSwitchAccount(account);
    // 加载该账号保存的表单数据
    if (account?.form_data) {
      const formData = account.form_data;
      if (formData.categoryL1 || formData.storeName) {
        // 商家模式表单
        setBusinessForm(prev => ({
          ...prev,
          ...formData,
        }));
      } else if (formData.positioning || formData.direction) {
        // IP模式表单
        setIpForm(prev => ({
          ...prev,
          ...formData,
        }));
      }
    }
  }, [originalSwitchAccount]);

  const [businessForm, setBusinessForm] =
    useState<BusinessFormState>(defaultBusinessForm);
  const [ipForm, setIpForm] = useState<IpFormState>(defaultIpForm);
  const [selectedBusiness, setSelectedBusiness] = useState<string[]>([
    'script',
    'talking',
  ]);
  const [selectedIp, setSelectedIp] = useState<string[]>([
    'script',
    'talking',
  ]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [calendarTime, setCalendarTime] = useState('18:00');
  const [calendarPriority, setCalendarPriority] = useState<'normal' | 'high'>('normal');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1); // 1-4 步骤
  const abortRef = useRef<AbortController | null>(null);
  const resultsPanelRef = useRef<HTMLDivElement | null>(null);
  const prefilledRef = useRef(false);
  const resultsRef = useRef<ResultItem[]>([]);

  // 同步 results 到 ref，避免闭包问题
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  // ── 客户端登录状态检查 
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth");
        if (cancelled) return;
        if (res.status === 401) {
          // 未登录，跳转到登录页
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
          return;
        }
        if (!res.ok) {
          setAuthState('unauthorized');
          return;
        }
        setAuthState('authorized');
      } catch (err) {
        if (!cancelled) {
          setAuthState('unauthorized');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── 登录后从后端拉商家默认门店信息，自动预填商家表单（仅首次，未修改前） ──
  useEffect(() => {
    if (prefilledRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth');
        if (!res.ok) return;
        const data = await res.json();
        const sd = data?.merchant?.storeDefaults;
        if (!sd || cancelled) return;
        prefilledRef.current = true;
        setBusinessForm((prev) => ({
          ...prev,
          categoryL1: sd.categoryL1 || prev.categoryL1,
          categoryL2: sd.categoryL2 || prev.categoryL2,
          storeName: sd.storeName || prev.storeName,
          sellingPoints: sd.sellingPoints || prev.sellingPoints,
          price: sd.priceRange || prev.price,
          location: sd.location || prev.location,
        }));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const outputTypes: OutputTypeDef[] = useMemo(
    () => (mode === 'business' ? BUSINESS_OUTPUT_TYPES : IP_OUTPUT_TYPES),
    [mode],
  );
  const selected = mode === 'business' ? selectedBusiness : selectedIp;
  const setSelected =
    mode === 'business' ? setSelectedBusiness : setSelectedIp;

  const isGenerating = results.some((r) => r.status === 'streaming');

  const toggleSelect = useCallback(
    (key: string) => {
      setSelected((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
      );
    },
    [setSelected],
  );

  const validate = (): string | null => {
    const checkText = (value: string, label: string, maxLength: number): string | null => {
      const normalized = value.trim();
      if (!normalized) return `请填写${label}`;
      if (normalized.length > maxLength) return `${label}不能超过${maxLength}个字`;
      return null;
    };

    if (mode === 'business') {
      const storeError = checkText(businessForm.storeName, '门店名', 40);
      if (storeError) return storeError;
      const sellingPointError = checkText(businessForm.sellingPoints, '核心卖点', 500);
      if (sellingPointError) return sellingPointError;
      if (!businessForm.price) return '请选择客单价区间';
    } else {
      const positioningError = checkText(ipForm.positioning, '人设定位', 120);
      if (positioningError) return positioningError;
      if (ipForm.direction.length === 0) return '请至少选择一个内容方向';
      if (selectedIp.includes('vlog') && (!ipForm.linkBusiness || !ipForm.linkedBusiness.storeName.trim() || !ipForm.linkedBusiness.sellingPoints.trim())) {
        return '生成「探店Vlog」需开启「关联商家」并填写门店名与卖点';
      }
    }
    if (selected.length === 0) return '请至少勾选一种输出类型';
    return null;
  };

  const streamOne = useCallback(
    async (
      typeDef: OutputTypeDef,
      signal: AbortSignal,
      updateContent: (updater: (prev: string) => string) => void,
      finish: (err?: string) => void,
    ) => {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            mode,
            outputType: typeDef.key,
            formData: mode === 'business' ? businessForm : ipForm,
            model: DEFAULT_MODEL,
          }),
        });

        if (!res.ok || !res.body) {
          if (res.status === 401) {
            finish('登录已失效，请重新登录');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            finish(`请求失败：${res.status}`);
          }
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith('data:')) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;
            try {
              const evt = JSON.parse(jsonStr) as {
                chunk?: string;
                done?: boolean;
                error?: string;
              };
              if (evt.error) {
                finish(evt.error);
                return;
              }
              if (evt.chunk) {
                updateContent((prev) => prev + evt.chunk);
              }
              if (evt.done) {
                finish();
                return;
              }
            } catch {
              // ignore malformed frame
            }
          }
        }
        // A connection may close without a final separator; consume the buffered SSE frame too.
        const trailingFrame = buffer.trim();
        if (trailingFrame.startsWith('data:')) {
          try {
            const evt = JSON.parse(trailingFrame.slice(5).trim()) as {
              chunk?: string;
              done?: boolean;
              error?: string;
            };
            if (evt.error) {
              finish(evt.error);
              return;
            }
            if (evt.chunk) updateContent((prev) => prev + evt.chunk);
          } catch {
            // Ignore a truncated final SSE frame.
          }
        }
        finish();
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') {
          finish('生成已取消');
          return;
        }
        finish(err instanceof Error ? err.message : '生成失败');
      }
    },
    [mode, businessForm, ipForm],
  );

  const handleGenerate = async () => {
    const err = validate();
    if (err) {
      setGlobalError(err);
      return;
    }
    setGlobalError(null);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const chosenDefs = outputTypes.filter((t) => selected.includes(t.key));
    const initial: ResultItem[] = chosenDefs.map((d) => ({
      key: d.key,
      name: d.name,
      content: '',
      status: 'streaming',
    }));
    setResults(initial);

    setTimeout(() => {
      resultsPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);

    await Promise.all(
      chosenDefs.map((def) =>
        streamOne(
          def,
          controller.signal,
          (updater) =>
            setResults((prev) =>
              prev.map((r) =>
                r.key === def.key ? { ...r, content: updater(r.content) } : r,
              ),
            ),
          (errMsg) =>
            setResults((prev) =>
              prev.map((r) =>
                r.key === def.key
                  ? {
                      ...r,
                      status: errMsg ? 'error' : 'done',
                      error: errMsg,
                    }
                  : r,
              ),
            ),
        ),
      ),
    );

    // 生成完成后由用户主动加入日历，避免未确认的自动排期。
  };

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const copyOne = async (key: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
    } catch {
      setGlobalError('复制失败，请手动选中复制');
    }
  };

  const copyAll = async () => {
    const done = results.filter((r) => r.status === 'done' && r.content.trim());
    if (done.length === 0) return;
    const allContent = done.map((r) => r.content).join('\n\n---\n\n');
    try {
      await navigator.clipboard.writeText(allContent);
      setCopiedKey('__all__');
      setTimeout(() => setCopiedKey((k) => (k === '__all__' ? null : k)), 1800);
    } catch {
      setGlobalError('复制失败，请手动选中复制');
    }
  };

  const handleExport = () => {
    const done = results.filter((r) => r.status === 'done' && r.content.trim());
    if (done.length === 0) return;
    const storeLike =
      mode === 'business'
        ? businessForm.storeName
        : ipForm.linkBusiness
          ? `${ipForm.positioning} × ${ipForm.linkedBusiness.storeName}`
          : ipForm.positioning;
    const title = `${storeLike || '抖音本地生活'} · 爆款文案`;
    exportResultsToWord({
      title,
      modeLabel: mode === 'business' ? '商家获客' : 'IP 个人',
      sections: done.map((r) => ({ name: r.name, content: r.content })),
    });
  };

  // 处理添加到日历
  const handleAddToCalendar = async () => {
    const done = results.filter((r) => r.status === 'done' && r.content.trim());
    if (done.length === 0) return;

    try {
      // 为每个生成的内容创建日历事件
      for (const r of done) {
        const storeLike =
          mode === 'business'
            ? businessForm.storeName
            : ipForm.linkBusiness
              ? `${ipForm.positioning} × ${ipForm.linkedBusiness.storeName}`
              : ipForm.positioning;

        await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${storeLike || '抖音本地生活'} - ${r.name}`,
            content_type: r.key,
            scheduled_date: calendarDate,
            scheduled_time: calendarTime,
            status: 'pending',
            priority: calendarPriority,
            account_id: currentAccount?.id || null,
            generated_content: { name: r.name, content: r.content },
            form_data: {
              mode,
              ...(mode === 'business' ? businessForm : ipForm),
            },
          }),
        });
      }

      setShowCalendarModal(false);
      alert(`已添加 ${done.length} 个发布计划到内容日历`);
    } catch (err) {
      console.error('添加到日历失败:', err);
      alert('添加失败，请稍后重试');
    }
  };

  const hasAnyDone = results.some(
    (r) => r.status === 'done' && r.content.trim(),
  );

  // 修复 iOS Safari 输入时页面自动刷新的问题
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      html.style.height = '100%';
      html.style.overflow = 'auto';
      (html.style as any).webkitOverflowScrolling = 'touch';
    }
  }, []);

  return (
    <div className="min-h-screen w-full text-ivory relative overflow-hidden">
      {/* 加载状态 */}
      {isCheckingAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A162E]">
          <div className="text-[#D4AF6A] text-lg">加载中...</div>
        </div>
      )}
      {/* 高级感动态背景层 */}
      <AnimatedBackground />
      {/* 自媒体运营文字装饰 */}
      <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-[#D4AF6A]/1 text-6xl font-bold tracking-tight whitespace-nowrap animate-float-slow">短视频运营</div>
        <div className="absolute top-40 right-20 text-[#E8C989]/05 text-5xl font-bold tracking-tight whitespace-nowrap animate-float-medium">本地生活</div>
        <div className="absolute bottom-40 left-1/4 text-[#D4AF6A]/05 text-7xl font-bold tracking-tight whitespace-nowrap animate-float-slow">内容营销</div>
        <div className="absolute bottom-20 right-10 text-[#E8C989]/1 text-4xl font-bold tracking-tight whitespace-nowrap animate-float-medium">爆款文案</div>
        <div className="absolute top-1/2 left-10 text-[#D4AF6A]/05 text-5xl font-bold tracking-tight whitespace-nowrap animate-float-slow">抖音获客</div>
        <div className="absolute top-1/3 right-1/4 text-[#E8C989]/05 text-6xl font-bold tracking-tight whitespace-nowrap animate-float-medium">团购转化</div>
      </div>
      <header className="lg:hidden sticky top-0 z-30 border-b border-cyber-border bg-ink-900/85 backdrop-blur-lg px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-cyber-bg flex items-center justify-center border border-[#D4AF6A]/30">
            <Image
              src="/logo.png"
              alt="佳乐本地生活服务"
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">
              佳乐本地生活服务
            </div>
            <div className="text-[10px] text-mist tracking-wide">
              JIALE Local Life · 爆款文案
            </div>
          </div>
        </div>
        {/* 移动端退出登录按钮 */}
        <button
          onClick={() => {
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'merchant_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = '/login';
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(194,90,90,0.3)] text-[#C25A5A] hover:bg-[#C25A5A]/10 transition-all text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          退出
        </button>
      </header>

      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="lg:w-[260px] lg:flex-shrink-0 lg:border-r border-cyber-border lg:min-h-screen lg:sticky lg:top-0 flex flex-col">
          <div className="hidden lg:flex items-center gap-3 px-6 py-7 border-b border-cyber-border">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-cyber-bg flex items-center justify-center shadow-lg shadow-[#d4af6a]/20 border border-[#D4AF6A]/30">
              <Image
                src="/logo.png"
                alt="佳乐本地生活服务"
                width={44}
                height={44}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <div className="text-base font-black tracking-tight">
                佳乐本地生活服务
              </div>
              <div className="text-[10px] text-mist tracking-widest uppercase mt-0.5">
                JIALE · Local Life
              </div>
            </div>
          </div>

          <nav className="px-4 lg:px-5 py-5 lg:py-6 flex lg:flex-col gap-2 overflow-x-auto">
            <ModeButton
              active={mode === 'business'}
              icon={<Store className="w-4 h-4" strokeWidth={1.8} />}
              title="商家获客"
              subtitle="实体门店 · 团购转化"
              onClick={() => setMode('business')}
            />
            <ModeButton
              active={mode === 'ip'}
              icon={<User className="w-4 h-4" strokeWidth={1.8} />}
              title="IP 个人"
              subtitle="人设塑造 · 探店带货"
              onClick={() => setMode('ip')}
            />
            {/* 运营工具入口 */}
            <button
              onClick={() => window.location.href = '/tools'}
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-[rgba(212,175,106,0.2)] hover:border-[rgba(212,175,106,0.5)] transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF6A]/20 to-[#E8C989]/10 flex items-center justify-center group-hover:from-[#D4AF6A]/30 group-hover:to-[#E8C989]/20 transition-all">
                <svg className="w-4 h-4 text-[#D4AF6A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-[#F5F0E4]">运营工具</div>
                <div className="text-[10px] text-mist">日历 · 数据 · 素材</div>
              </div>
            </button>
          </nav>

          {/* ── 账号切换器 ── */}
          <div className="px-4 lg:px-4 pb-4">
            <AccountSwitcher
              accounts={accounts}
              currentAccount={currentAccount}
              onSwitch={switchAccount}
              onCreate={createAccount}
              onDelete={deleteAccount}
              onUpdate={updateAccount}
            />
          </div>

          <div className="hidden lg:block mt-auto px-6 py-6 border-t border-cyber-border">
            <div className="chip">
              <Zap className="w-3 h-3" strokeWidth={2} />
              专业创作 · 流式生成
            </div>
            <p className="text-[11px] text-mist mt-3 leading-relaxed">
              基于抖音来客一/二级类目与本地生活爆款方法论，为每条文案注入钩子、画面与转化。
            </p>

            <PasswordInfo />

            {/* 退出登录按钮 */}
            <button
              onClick={() => {
                // 清除登录状态
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'merchant_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                // 跳转到登录页
                window.location.href = '/login';
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[rgba(194,90,90,0.3)] text-[#C25A5A] hover:bg-[#C25A5A]/10 hover:border-[#C25A5A]/50 transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              退出登录
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 lg:px-10 py-6 lg:py-10">
          <div className="mb-6 lg:mb-8 hidden lg:block">
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              <span className="cyber-title">
                {mode === 'business' ? '商家获客文案' : 'IP 个人文案'}
              </span>
              <span className="text-ivory"> · 一键生成</span>
            </h1>
            <p className="text-mist text-sm mt-3 max-w-2xl">
              {mode === 'business'
                ? '为本地实体门店打造能真正带来到店客流的短视频、直播与团购转化文案。'
                : '为个人 IP 打造有温度、有观点、可传播的文案；开启「关联商家」即可切入探店 / 带货场景。'}
            </p>
          </div>

          {/* ── 首次使用向导 ── */}
          {accounts.length === 0 && showOnboarding && (
            <OnboardingWizard
              onComplete={() => {
                setShowOnboarding(false);
                fetchAccounts();
              }}
              onCreateAccount={async (name: string) => {
                try {
                  const res = await fetch('/api/accounts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, platform: 'douyin' }),
                  });
                  if (res.ok) {
                    fetchAccounts();
                    setShowOnboarding(false);
                  }
                } catch (error) {
                  console.error('创建账号失败:', error);
                }
              }}
              onTryDemo={() => {
                setShowOnboarding(false);
              }}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] gap-4 lg:gap-6">
            <section className="cyber-card p-4 lg:p-8 fade-in-up">
              <div className="lg:hidden mb-6">
                <PasswordInfo />
              </div>

              {/* ── 步骤进度条（仅商家模式显示） ── */}
              {mode === 'business' && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          currentStep === step
                            ? 'bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] text-[#0A162E]'
                            : currentStep > step
                            ? 'bg-[#D4AF6A]/30 text-[#D4AF6A]'
                            : 'bg-[#1B2E56] text-[#8B94A8]'
                        }`}
                      >
                        {step}
                      </div>
                      {step < 4 && (
                        <div
                          className={`w-8 h-0.5 mx-1 transition-all ${
                            currentStep > step ? 'bg-[#D4AF6A]/50' : 'bg-[#1B2E56]'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {mode === 'business' ? (
                <>
                  {/* Step 01 · 基础信息 */}
                  {currentStep === 1 && (
                    <div className="fade-in-up">
                      <div className="flex items-center gap-2 mb-5">
                        <span className="cyber-title text-xs font-mono font-semibold tracking-widest uppercase">Step 01</span>
                        <span className="text-ivory text-sm">· 基础信息</span>
                      </div>
                      <BusinessFormFields
                        value={businessForm}
                        onChange={setBusinessForm}
                      />
                    </div>
                  )}

                  {/* Step 02 · 运营定位 */}
                  {currentStep === 2 && (
                    <div className="fade-in-up">
                      <div className="flex items-center gap-2 mb-5">
                        <span className="cyber-title text-xs font-mono font-semibold tracking-widest uppercase">Step 02</span>
                        <span className="text-ivory text-sm">· 运营定位</span>
                      </div>
                      <BusinessOperationFields
                        value={businessForm}
                        onChange={setBusinessForm}
                      />
                    </div>
                  )}

                  {/* Step 03 · 团购信息 */}
                  {currentStep === 3 && (
                    <div className="fade-in-up">
                      <div className="flex items-center gap-2 mb-5">
                        <span className="cyber-title text-xs font-mono font-semibold tracking-widest uppercase">Step 03</span>
                        <span className="text-ivory text-sm">· 团购信息</span>
                        <span className="text-mist text-xs">(选填，可跳过)</span>
                      </div>
                      <BusinessGroupBuyFields
                        value={businessForm}
                        onChange={setBusinessForm}
                      />
                    </div>
                  )}

                  {/* Step 04 · 选择输出类型 */}
                  {currentStep === 4 && (
                    <div className="fade-in-up">
                      <div className="flex items-center gap-2 mb-5">
                        <span className="cyber-title text-xs font-mono font-semibold tracking-widest uppercase">Step 04</span>
                        <span className="text-ivory text-sm">· 选择输出类型</span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {outputTypes.map((t) => {
                          const active = selected.includes(t.key);
                          return (
                            <button
                              key={t.key}
                              type="button"
                              onClick={() => toggleSelect(t.key)}
                              className={`output-toggle ${active ? 'checked' : ''}`}
                            >
                              <div className="checkbox-dot">
                                {active && (
                                  <Check
                                    className="w-3 h-3 text-[#0a162e]"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-ivory">
                                  {t.name}
                                </div>
                                <div className="text-[11px] text-mist mt-1 leading-relaxed">
                                  {t.desc}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <SectionTitle label="IP 信息" title="填写人设与内容方向" />
                  <IpFormFields value={ipForm} onChange={setIpForm} />
                  <div className="mt-8">
                    <SectionTitle label="输出类型" title="选择需要的输出格式" />
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {outputTypes.map((t) => {
                        const active = selected.includes(t.key);
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => toggleSelect(t.key)}
                            className={`output-toggle relative ${active ? 'checked' : ''}`}
                          >
                            {/* 推荐角标 */}
                            {t.badge && (
                              <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full"
                                    style={{ backgroundColor: 'rgba(212,175,106,0.2)', color: '#D4AF6A', border: '1px solid rgba(212,175,106,0.3)' }}>
                                {t.badge}
                              </span>
                            )}
                            <div className="checkbox-dot">
                              {active && (
                                <Check
                                  className="w-3 h-3 text-[#0a162e]"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-ivory">
                                {t.name}
                              </div>
                              <div className="text-[11px] text-mist mt-1 leading-relaxed">
                                {t.desc}
                              </div>
                              {/* 场景提示 */}
                              {t.tip && (
                                <p className="text-[11px] text-white/35 mt-1 leading-tight">💡 {t.tip}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {globalError && (
                <div className="mt-5 px-5 py-3.5 rounded-lg border border-[#c25a5a]/40 bg-[#c25a5a]/10 text-sm text-[#f0c0c0]">
                  {globalError}
                </div>
              )}

              {/* ── 步骤导航按钮 ── */}
              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="cyber-btn-outline h-12 px-6 flex items-center justify-center gap-2 text-[15px] sm:flex-initial"
                    onClick={() => setCurrentStep((s) => s - 1)}
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" strokeWidth={2} />
                    <span>上一步</span>
                  </button>
                )}
                {/* 保存配置按钮 */}
                <button
                  type="button"
                  className="cyber-btn-outline h-12 px-4 flex items-center justify-center gap-2 text-sm sm:flex-initial"
                  onClick={async () => {
                    if (!currentAccount) {
                      alert('请先添加一个账号');
                      return;
                    }
                    const formData = mode === 'business' ? businessForm : ipForm;
                    try {
                      await saveFormData(formData as any);
                    } catch (e) {
                      console.error('保存失败:', e);
                    }
                    // 自动进入下一步
                    if (mode === 'business') {
                      setCurrentStep(4);
                      handleGenerate();
                    }
                  }}
                >
                  <Check className="w-4 h-4" strokeWidth={2} />
                  <span>保存配置</span>
                </button>
                {mode === 'business' && currentStep < 4 ? (
                  <button
                    type="button"
                    className="cyber-btn flex-1 h-12 px-6 flex items-center justify-center gap-2 text-[15px]"
                    onClick={() => setCurrentStep((s) => s + 1)}
                  >
                    <span>下一步</span>
                    <ChevronDown className="w-4 h-4 -rotate-90" strokeWidth={2} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cyber-btn flex-1 h-12 px-6 flex items-center justify-center gap-2 text-[15px]"
                    disabled={isGenerating}
                    onClick={() => { console.log("开始生成被点击"); handleGenerate(); }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          strokeWidth={2}
                        />
                        <span>创作中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" strokeWidth={2} />
                        <span>开始生成</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </section>

            <section
              ref={resultsPanelRef}
              className="cyber-card p-4 lg:p-8 fade-in-up min-h-[420px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-5">
                <SectionTitle
                  label="Result"
                  title="创作结果"
                  hideBottomMargin
                />
                {hasAnyDone && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyAll}
                      className="cyber-btn-outline h-9 px-3 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                      {copiedKey === '__all__' ? '已复制' : '复制全部'}
                    </button>
                    <button
                      type="button"
                      onClick={handleExport}
                      className="cyber-btn-outline h-9 px-3 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" strokeWidth={2} />
                      导出 Word
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCalendarModal(true)}
                      className="cyber-btn-outline h-9 px-3 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                      添加到日历
                    </button>
                  </div>
                )}
              </div>

              {results.length === 0 ? (
                <EmptyState mode={mode} isGenerating={isGenerating} />
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-luxe">
                  {results.map((r) => (
                    <ResultCard
                      key={r.key}
                      item={r}
                      copied={copiedKey === r.key}
                      onCopy={() => copyOne(r.key, r.content)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* 添加到日历弹窗 */}
      {showCalendarModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowCalendarModal(false)}
        >
          <div
            className="cyber-card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-[#F5F0E4] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D4AF6A]" />
              添加到内容日历
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8B94A8] mb-2">
                  发布日期 *
                </label>
                <input
                  type="date"
                  value={calendarDate}
                  onChange={(e) => setCalendarDate(e.target.value)}
                  className="cyber-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-[#8B94A8] mb-2">
                  发布时间 *
                </label>
                <select
                  value={calendarTime}
                  onChange={(e) => setCalendarTime(e.target.value)}
                  className="cyber-input w-full"
                >
                  <option value="07:30">07:30（早通勤）</option>
                  <option value="12:00">12:00（午休）</option>
                  <option value="18:00">18:00（晚高峰）</option>
                  <option value="21:00">21:00（睡前）</option>
                  <option value="21:30">21:30（睡前）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#8B94A8] mb-2">
                  优先级
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCalendarPriority('normal')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      calendarPriority === 'normal'
                        ? 'bg-[#D4AF6A] text-[#0A162E]'
                        : 'bg-[#1B2E56] text-[#8B94A8]'
                    }`}
                  >
                    普通
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarPriority('high')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      calendarPriority === 'high'
                        ? 'bg-[#D4AF6A] text-[#0A162E]'
                        : 'bg-[#1B2E56] text-[#8B94A8]'
                    }`}
                  >
                    优先
                  </button>
                </div>
              </div>

              <div className="bg-[#1B2E56] rounded-lg p-3 text-sm text-[#8B94A8]">
                <p className="mb-1">
                  将添加{' '}
                  <span className="text-[#D4AF6A] font-medium">
                    {results.filter((r) => r.status === 'done').length}
                  </span>{' '}
                  个发布计划
                </p>
                <p>
                  建议发布时间：
                  {calendarTime === '07:30' && '早通勤时段，适合轻松短内容'}
                  {calendarTime === '12:00' && '午休时段，适合探店/美食'}
                  {calendarTime === '18:00' && '晚高峰时段，适合团购/优惠'}
                  {calendarTime === '21:00' && '睡前时段，适合种草/走心'}
                  {calendarTime === '21:30' && '睡前时段，适合种草/走心'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium bg-[#1B2E56] text-[#8B94A8] hover:bg-[#243656] transition-all"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] text-[#0A162E] hover:shadow-lg hover:shadow-[#D4AF6A]/20 transition-all"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------- Sub components --------------- */

function ModeButton({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-3 flex-shrink-0 lg:w-full text-left px-5 py-3.5 rounded-lg transition-all duration-300 ${
        active
          ? 'bg-[#12213f] shadow-lg shadow-[#0a162e]/30'
          : 'hover:bg-[#12213f]/50'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] cyber-glow rounded-r" />
      )}
      <span
        className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
          active
            ? 'border-cyber-cyan/20 bg-cyber-cyan/10 text-cyber-cyan'
            : 'border-cyber-border text-mist'
        }`}
      >
        {icon}
      </span>
      <span className="flex flex-col min-w-0">
        <span
          className={`text-sm font-semibold ${
            active ? 'text-ivory' : 'text-ivory/80'
          }`}
        >
          {title}
        </span>
        <span className="text-[11px] text-mist mt-0.5 truncate">
          {subtitle}
        </span>
      </span>
    </button>
  );
}

function PasswordInfo() {
  const [open, setOpen] = useState(true);
  const [info, setInfo] = useState<{
    merchantName: string;
    expiresAt: string;
    quotaLimit: number | null;
    quotaUsed: number;
    daysLeft: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadInfo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        const data = await res.json();
        const m = data.merchant;
        const daysLeft = Math.max(
          0,
          Math.ceil(
            (new Date(m.expiryDate).getTime() - Date.now()) /
              (24 * 60 * 60 * 1000)
          )
        );
        setInfo({
          merchantName: m.name,
          expiresAt: m.expiryDate,
          quotaLimit: m.quotaTotal ?? null,
          quotaUsed: m.quotaUsed ?? 0,
          daysLeft,
        });
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  }, []);

  // 自动加载授权信息
  useEffect(() => { loadInfo(); }, [loadInfo]);

  const toggle = () => {
    if (!open) {
      loadInfo();
    }
    setOpen(!open);
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 text-[11px] text-mist hover:text-cyber-cyan transition-colors w-full"
      >
        <KeyRound className="w-3 h-3" strokeWidth={1.8} />
        <span>授权信息</span>
        <ChevronDown
          className={`w-3 h-3 ml-auto transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.8}
        />
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-cyber-border bg-cyber-bg p-3 text-xs space-y-1.5">
          {loading ? (
            <div className="flex items-center gap-2 text-mist">
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
              加载中...
            </div>
          ) : info ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-mist">授权商家</span>
                <span className="text-cyber-cyan font-semibold">
                  {info.merchantName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mist">到期时间</span>
                <span className="text-ivory">
                  {new Date(info.expiresAt).toLocaleDateString('zh-CN', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mist">剩余天数</span>
                <span className={
                  info.daysLeft <= 0 ? 'text-red-400 font-semibold' :
                  info.daysLeft <= 3 ? 'text-red-400' :
                  info.daysLeft <= 7 ? 'text-cyber-cyan' :
                  'text-ivory'
                }>
                  {info.daysLeft <= 0 ? '⚠ 已到期' : `${info.daysLeft} 天`}
                </span>
              </div>
              {/* 使用量进度条 */}
              <div className="mt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-mist text-[11px]">本月额度</span>
                  <span
                    className="text-[11px] font-mono"
                    style={{
                      color:
                        info.quotaLimit && info.quotaUsed / info.quotaLimit > 0.8
                          ? '#ef4444'
                          : '#D4AF6A',
                    }}
                  >
                    {info.quotaLimit
                      ? `${info.quotaUsed}/${info.quotaLimit}`
                      : `${info.quotaUsed} · 无限`}
                  </span>
                </div>
                {info.quotaLimit && (
                  <>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((info.quotaUsed / info.quotaLimit) * 100, 100)}%`,
                          backgroundColor:
                            info.quotaUsed / info.quotaLimit > 0.8 ? '#ef4444' : '#D4AF6A',
                        }}
                      />
                    </div>
                    {info.quotaUsed / info.quotaLimit > 0.8 && (
                      <p className="text-[10px] text-amber-400/80 mt-0.5 text-right">
                        额度即将用完，下月1号刷新
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="text-mist">获取失败</div>
          )}
        </div>
      )}
      {/* Guide link */}
      <a
        href="/guide"
        target="_blank"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-mist hover:text-cyber-cyan hover:bg-ink-light/50 transition-colors"
      >
        <span className="text-[10px]">📖</span>
        <span>使用指南</span>
      </a>
    </div>
  );
}

function SectionTitle({
  label,
  title,
  hideBottomMargin,
}: {
  label: string;
  title: string;
  hideBottomMargin?: boolean;
}) {
  return (
    <div className={hideBottomMargin ? '' : 'mb-5'}>
      <div className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
        {label}
      </div>
      <div className="text-lg font-bold text-ivory mt-1">{title}</div>
    </div>
  );
}

function GroupTitle({ label }: { label: string }) {
  return (
    <div className="col-span-full flex items-center gap-3 mt-4 mb-1">
      <div className="flex-1 divider-gold" />
      <span className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 divider-gold" />
    </div>
  );
}

function FieldLabel({
  label,
  hint,
  required,
}: {
  label: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <label className="text-[13px] font-medium text-ivory">
        {label}
        {required && <span className="text-[#c25a5a] ml-1">*</span>}
      </label>
      {hint && <span className="text-[11px] text-mist">{hint}</span>}
    </div>
  );
}

function IpDirectionChips({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (key: string) => {
    onChange(
      value.includes(key)
        ? value.filter((k) => k !== key)
        : [...value, key]
    );
  };
  return (
    <div className="flex flex-wrap gap-2">
      {IP_DIRECTIONS.map((d) => {
        const on = value.includes(d.key);
        return (
          <button
            type="button"
            key={d.key}
            onClick={() => toggle(d.key)}
            className={`px-3 py-1.5 rounded-md border text-[12px] transition ${
              on
                ? 'border-cyber-cyan bg-cyber-cyan/15 text-ivory'
                : 'border-white/10 text-mist hover:border-cyber-cyan/40 hover:text-ivory'
            }`}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

function BusinessFormFields({
  value,
  onChange,
}: {
  value: BusinessFormState;
  onChange: (v: BusinessFormState) => void;
}) {
  const upd = <K extends keyof BusinessFormState>(
    k: K,
    v: BusinessFormState[K],
  ) => onChange({ ...value, [k]: v });

  const l1 = findL1(value.categoryL1);
  const l2List = l1?.children ?? [];

  const handleL1Change = (nextL1: string) => {
    const nextL1Obj = findL1(nextL1);
    const nextL2 = nextL1Obj?.children[0]?.key ?? '';
    onChange({ ...value, categoryL1: nextL1, categoryL2: nextL2 });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <FieldLabel label="抖音来客一级类目" required />
        <select
          className="cyber-input w-full px-3 py-2.5 text-sm"
          value={value.categoryL1}
          onChange={(e) => handleL1Change(e.target.value)}
        >
          {DOUYIN_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel label="二级类目" required />
        <select
          className="cyber-input w-full px-3 py-2.5 text-sm"
          value={value.categoryL2}
          onChange={(e) => upd('categoryL2', e.target.value)}
        >
          {l2List.map((c) => (
            <option key={c.key} value={c.key}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel label="门店名" required />
        <input
          data-store-name
          className="cyber-input w-full px-3 py-2.5 text-sm"
          value={value.storeName}
          onChange={(e) => upd('storeName', e.target.value)}
          placeholder="如：巷子里的老潮汕牛肉火锅"
        />
      </div>
      <div>
        <FieldLabel label="客单价区间" required />
        <select
          className="cyber-input w-full px-3 py-2.5 text-sm"
          value={value.price}
          onChange={(e) => upd('price', e.target.value)}
        >
          <option value="" disabled>请选择客单价区间</option>
          {PRICE_RANGES.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <FieldLabel
          label="核心卖点"
          hint="1-3 个，用 / 或换行分隔"
          required
        />
        <textarea
          className="cyber-input w-full px-3 py-2.5 text-sm resize-none"
          rows={3}
          value={value.sellingPoints}
          onChange={(e) => upd('sellingPoints', e.target.value)}
          placeholder="如：现宰潮汕黄牛肉 / 独家沙茶酱 / 人均 88 吃到扶墙走"
        />
      </div>
      <div className="md:col-span-2">
        <FieldLabel label="门店位置" hint="城市 + 地标，可选" />
        <input
          className="cyber-input w-full px-3 py-2.5 text-sm"
          value={value.location}
          onChange={(e) => upd('location', e.target.value)}
          placeholder="如：广州天河 · 太古汇后巷"
        />
      </div>
    </div>
  );
}

// ── Step 02: 运营定位 ──
function BusinessOperationFields({
  value,
  onChange,
}: {
  value: BusinessFormState;
  onChange: (v: BusinessFormState) => void;
}) {
  const upd = <K extends keyof BusinessFormState>(
    k: K,
    v: BusinessFormState[K],
  ) => onChange({ ...value, [k]: v });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <FieldLabel label="账号当前阶段" hint="可选，影响内容策略" />
        <select
          className="cyber-input w-full px-3 py-2.5 text-sm"
          value={value.accountStage || ''}
          onChange={(e) => upd('accountStage', e.target.value)}
        >
          <option value="">请选择当前账号阶段</option>
          <option value="新号起步">新号起步</option>
          <option value="成长期">成长期</option>
          <option value="成熟期">成熟期</option>
          <option value="断更回归">断更回归</option>
        </select>
      </div>

      <div>
        <FieldLabel label="出镜人设" hint="可选，影响文案语气" />
        <select
          className="cyber-input w-full px-3 py-2.5 text-sm"
          value={value.presenter || ''}
          onChange={(e) => upd('presenter', e.target.value)}
        >
          <option value="">请选择出镜方式</option>
          <option value="老板出镜">老板出镜</option>
          <option value="员工出镜">员工出镜</option>
          <option value="达人出镜">达人出镜</option>
          <option value="无人出镜">无人出镜</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <FieldLabel label="文案风格偏好" hint="可多选，决定文案气质" />
        <div className="flex flex-wrap gap-2">
          {['接地气', '高级感', '搞笑', '走心', '专业', '冲突反转'].map((style) => {
            const arr = value.copywritingStyle || [];
            const on = arr.includes(style);
            return (
              <button
                type="button"
                key={style}
                onClick={() =>
                  upd(
                    'copywritingStyle',
                    on ? arr.filter((s) => s !== style) : [...arr, style]
                  )
                }
                className={`px-3 py-1.5 rounded-md border text-[12px] transition ${
                  on
                    ? 'border-cyber-cyan bg-cyber-cyan/15 text-ivory'
                    : 'border-white/10 text-mist hover:border-cyber-cyan/40 hover:text-ivory'
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-2">
        <FieldLabel label="对标账号" hint="可选，AI 会参考其风格" />
        <input
          className="cyber-input w-full px-3 py-2.5 text-sm"
          value={value.benchmarkAccount || ''}
          onChange={(e) => upd('benchmarkAccount', e.target.value)}
          placeholder="如：@老王说餐饮、@探店小李"
        />
      </div>
    </div>
  );
}

// ── Step 03: 团购信息 ──
function BusinessGroupBuyFields({
  value,
  onChange,
}: {
  value: BusinessFormState;
  onChange: (v: BusinessFormState) => void;
}) {
  const upd = <K extends keyof BusinessFormState>(
    k: K,
    v: BusinessFormState[K],
  ) => onChange({ ...value, [k]: v });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 粘贴链接 / 上传截图 识别团购 */}
      <div className="md:col-span-2 space-y-3">
        {/* 粘贴抖音链接 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="url"
              id="douyin-link-input"
              placeholder="粘贴抖音链接，自动识别团购信息..."
              className="cyber-input w-full pl-3 pr-8 py-2 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const btn = document.getElementById('link-analyze-btn') as HTMLButtonElement;
                  btn?.click();
                }
              }}
            />
          </div>
          <button
            id="link-analyze-btn"
            type="button"
            onClick={async () => {
              const input = document.getElementById('douyin-link-input') as HTMLInputElement;
              const raw = input?.value.trim();
              if (!raw) return;

              // 自动从文字中提取抖音链接（支持带前缀后缀的粘贴）
              const urlMatch = raw.match(/https?:\/\/v\.douyin\.com\/[a-zA-Z0-9_-]+\/?/);
              const url = urlMatch ? urlMatch[0] : raw;

              const btn = document.getElementById('link-analyze-btn') as HTMLButtonElement;
              const toastEl = document.getElementById('link-upload-toast');
              try {
                btn.textContent = '识别中...';
                btn.disabled = true;

                const res = await fetch('/api/analyze-link', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url }),
                });
                const data = await res.json();

                if (data.success && data.deals?.length > 0) {
                  const d = data.deals[0];
                  // 直接通过 DOM 操作 + 触发 React onChange
                  const fillInput = (placeholder: string, val: string) => {
                    const el = document.querySelector<HTMLInputElement>(`input[placeholder="${placeholder}"]`);
                    if (!el) return;
                    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                    nativeSetter?.call(el, val);
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                  };
                  const fillTextarea = (placeholderContains: string, val: string) => {
                    if (!val) return;
                    const el = document.querySelector<HTMLTextAreaElement>(`textarea[placeholder*="${placeholderContains}"]`);
                    if (!el) return;
                    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
                    nativeSetter?.call(el, val);
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                  };
                  fillInput('如：双人潮汕牛肉锅 · 到店尝鲜套餐', d.name);
                  fillInput('如：268', d.originalPrice?.replace('元', ''));
                  fillInput('如：158', d.price?.replace('元', ''));

                  if (data.deals.length > 1) {
                    const allContent = data.deals
                      .map(
                        (dd: { name: string; price: string; originalPrice: string; content: string }, i: number) =>
                          `${i + 1}. ${dd.name}（${dd.price}元，原价${dd.originalPrice}元）：${dd.content}`
                      )
                      .join('\n');
                    fillTextarea('现切牛肉拼盘', allContent);
                  } else {
                    fillTextarea('现切牛肉拼盘', d.content);
                  }

                  // Auto-fill store name if available
                  if (data.storeName && !value.storeName) {
                    const storeInput = document.querySelector('[data-store-name]') as HTMLInputElement;
                    if (storeInput) {
                      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype, 'value'
                      )?.set;
                      nativeInputValueSetter?.call(storeInput, data.storeName);
                      storeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }

                  if (toastEl) {
                    const msg = data.message || `✅ 已识别 ${data.deals.length} 个套餐`;
                    toastEl.textContent = msg;
                    toastEl.classList.remove('hidden');
                    setTimeout(() => toastEl.classList.add('hidden'), 4000);
                  }
                } else {
                  if (toastEl) {
                    toastEl.textContent = data.message || '❌ 未识别到套餐信息，请手动填写或上传截图';
                    toastEl.classList.remove('hidden');
                    setTimeout(() => toastEl.classList.add('hidden'), 4000);
                  }
                }
              } catch {
                if (toastEl) {
                  toastEl.textContent = '❌ 链接识别出错，请确认链接是否正确';
                  toastEl.classList.remove('hidden');
                  setTimeout(() => toastEl.classList.add('hidden'), 4000);
                }
              } finally {
                btn.textContent = '识别';
                btn.disabled = false;
              }
            }}
            className="text-xs px-3 py-2 h-auto rounded-lg border border-[rgba(212,175,106,0.4)] text-[#D4AF6A] bg-[#12213F] hover:bg-[#1B2E56] hover:border-[#D4AF6A] transition-colors cursor-pointer shrink-0"
          >
            识别
          </button>
        </div>

        {/* 分割提示 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[rgba(212,175,106,0.15)]" />
          <span className="text-xs text-[#8B94A8]">或</span>
          <div className="flex-1 h-px bg-[rgba(212,175,106,0.15)]" />
        </div>

        {/* 上传截图 */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#8B94A8]">
            上传抖音/美团截图，AI 自动识别套餐信息
          </div>
          <button
            type="button"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (ev) => {
                  const base64 = ev.target?.result as string;
                  try {
                    const uploadBtn = document.querySelector('[data-upload-btn]');
                    if (uploadBtn) {
                      uploadBtn.textContent = '识别中...';
                      (uploadBtn as HTMLButtonElement).disabled = true;
                    }

                    const res = await fetch('/api/analyze-groupbuy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ image: base64 }),
                    });
                    const data = await res.json();
                    if (data.success && data.deals?.length > 0) {
                      const d = data.deals[0];
                      upd('groupBuyName', d.name || value.groupBuyName);
                      upd('groupBuyOriginal', d.originalPrice || value.groupBuyOriginal);
                      upd('groupBuyPrice', d.price || value.groupBuyPrice);
                      upd('groupBuyContent', d.content || value.groupBuyContent);

                      if (data.deals.length > 1) {
                        const allContent = data.deals
                          .map(
                            (dd: { name: string; price: string; originalPrice: string; content: string }, i: number) =>
                              `${i + 1}. ${dd.name}（${dd.price}元，原价${dd.originalPrice}元）：${dd.content}`
                          )
                          .join('\n');
                        upd('groupBuyContent', allContent);
                      }

                      const toastEl = document.getElementById('upload-toast');
                      if (toastEl) {
                        toastEl.textContent = `✅ 已识别 ${data.deals.length} 个套餐`;
                        toastEl.classList.remove('hidden');
                        setTimeout(() => toastEl.classList.add('hidden'), 3000);
                      }
                    } else {
                      const toastEl = document.getElementById('upload-toast');
                      if (toastEl) {
                        toastEl.textContent = '❌ 未识别到套餐信息，请手动填写';
                        toastEl.classList.remove('hidden');
                        setTimeout(() => toastEl.classList.add('hidden'), 3000);
                      }
                    }
                  } catch {
                    const toastEl = document.getElementById('upload-toast');
                    if (toastEl) {
                      toastEl.textContent = '❌ 识别失败，请重试';
                      toastEl.classList.remove('hidden');
                      setTimeout(() => toastEl.classList.add('hidden'), 3000);
                    }
                  } finally {
                    const uploadBtn = document.querySelector('[data-upload-btn]');
                    if (uploadBtn) {
                      uploadBtn.textContent = '📷 上传截图识别';
                      (uploadBtn as HTMLButtonElement).disabled = false;
                    }
                  }
                };
                reader.readAsDataURL(file);
              };
              // Create a hidden file input
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.style.display = 'none';
              fileInput.onchange = input.onchange;
              document.body.appendChild(fileInput);
              fileInput.click();
              setTimeout(() => document.body.removeChild(fileInput), 1000);
            }}
            data-upload-btn
            className="text-xs px-3 py-1.5 h-auto rounded-lg border border-[rgba(212,175,106,0.4)] text-[#D4AF6A] bg-[#12213F] hover:bg-[#1B2E56] hover:border-[#D4AF6A] transition-colors cursor-pointer"
          >
            📷 上传截图识别
          </button>
        </div>

        {/* 统一 Toast */}
        <div
          id="link-upload-toast"
          className="hidden text-xs text-[#D4AF6A] transition-opacity"
        />
      </div>

      <div className="md:col-span-2">
        <FieldLabel
          label="团购套餐名称"
          hint="填写后可生成团购卡片、团购视频"
        />
        <input
          className="cyber-input w-full px-3 py-2.5 text-sm"
          value={value.groupBuyName}
          onChange={(e) => upd('groupBuyName', e.target.value)}
          placeholder="如：双人潮汕牛肉锅 · 到店尝鲜套餐"
        />
      </div>
      <div>
        <FieldLabel label="原价（元）" />
        <input
          className="cyber-input w-full px-3 py-2.5 text-sm"
          type="number"
          inputMode="numeric"
          value={value.groupBuyOriginal}
          onChange={(e) => upd('groupBuyOriginal', e.target.value)}
          placeholder="如：268"
        />
      </div>
      <div>
        <FieldLabel label="团购价（元）" />
        <input
          className="cyber-input w-full px-3 py-2.5 text-sm"
          type="number"
          inputMode="numeric"
          value={value.groupBuyPrice}
          onChange={(e) => upd('groupBuyPrice', e.target.value)}
          placeholder="如：158"
        />
      </div>
      <div className="md:col-span-2">
        <FieldLabel label="套餐包含项" hint="逐项列出，逗号分隔" />
        <textarea
          className="cyber-input w-full px-3 py-2.5 text-sm resize-none"
          rows={2}
          value={value.groupBuyContent}
          onChange={(e) => upd('groupBuyContent', e.target.value)}
          placeholder="如：现切牛肉拼盘 400g、手打牛肉丸 12 颗、沙茶蘸料 2 份、饮品 2 杯"
        />
      </div>
    </div>
  );
}

function IpFormFields({
  value,
  onChange,
}: {
  value: IpFormState;
  onChange: (v: IpFormState) => void;
}) {
  const upd = <K extends keyof IpFormState>(k: K, v: IpFormState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FieldLabel label="人设定位" required />
          <input
            className="cyber-input w-full px-3 py-2.5 text-sm"
            value={value.positioning}
            onChange={(e) => upd('positioning', e.target.value)}
            placeholder="如：会讲人话的家居设计师 · 帮小户型省钱又出片"
          />
        </div>

        <div>
          <FieldLabel label="IP 昵称 / 账号名" hint="可选" />
          <input
            className="cyber-input w-full px-3 py-2.5 text-sm"
            value={value.ipName || ''}
            onChange={(e) => upd('ipName', e.target.value)}
            placeholder="如：设计师阿June"
          />
        </div>
        <div>
          <FieldLabel label="账号阶段" hint="影响冷启动策略" />
          <select
            className="cyber-input w-full px-3 py-2.5 text-sm"
            value={value.accountStage || ''}
            onChange={(e) => upd('accountStage', e.target.value)}
          >
            <option value="">未指定</option>
            {IP_ACCOUNT_STAGES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <FieldLabel
            label="内容方向"
            hint="可多选，选中即为内容主线"
            required
          />
          <IpDirectionChips
            value={value.direction}
            onChange={(v) => upd('direction', v)}
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel label="本次核心内容主题" hint="可选，一句话说清这条内容讲什么" />
          <input
            className="cyber-input w-full px-3 py-2.5 text-sm"
            value={value.topic || ''}
            onChange={(e) => upd('topic', e.target.value)}
            placeholder="如：小户型50㎡ 3万块装出高级感 / 独居女生一周不重样的10块钱早餐"
          />
        </div>

        <div>
          <FieldLabel label="性别倾向" hint="可选" />
          <select
            className="cyber-input w-full px-3 py-2.5 text-sm"
            value={value.audienceGender || ''}
            onChange={(e) => upd('audienceGender', e.target.value)}
          >
            <option value="">未指定</option>
            {IP_AUDIENCE_GENDERS.map((g) => (
              <option key={g.key} value={g.key}>{g.label}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel label="语言风格" hint="决定文案气质" />
          <select
            className="cyber-input w-full px-3 py-2.5 text-sm"
            value={value.tone || ''}
            onChange={(e) => upd('tone', e.target.value)}
          >
            <option value="">未指定，由模型判断</option>
            {IP_TONES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel label="视频形式" hint="决定脚本呈现" />
          <select
            className="cyber-input w-full px-3 py-2.5 text-sm"
            value={value.videoForm || ''}
            onChange={(e) => upd('videoForm', e.target.value)}
          >
            <option value="">未指定</option>
            {IP_VIDEO_FORMS.map((v2) => (
              <option key={v2.key} value={v2.key}>{v2.label}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel label="转化目标" hint="决定 CTA 走向" />
          <select
            className="cyber-input w-full px-3 py-2.5 text-sm"
            value={value.conversionGoal || ''}
            onChange={(e) => upd('conversionGoal', e.target.value)}
          >
            <option value="">未指定</option>
            {IP_CONVERSION_GOALS.map((g) => (
              <option key={g.key} value={g.key}>{g.label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <FieldLabel label="差异化特点" hint="可选，别人做不出的独特点" />
          <textarea
            className="cyber-input w-full px-3 py-2.5 text-sm resize-none"
            rows={2}
            value={value.differentiator}
            onChange={(e) => upd('differentiator', e.target.value)}
            placeholder="如：拒绝奶油风套路，专治精致穷家庭的伪需求"
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-cyber-border bg-cyber-bg/50 overflow-hidden">
        <button
          type="button"
          onClick={() => upd('linkBusiness', !value.linkBusiness)}
          className="w-full flex items-center gap-3 px-5 py-3.5.5 hover:bg-[#12213f]/60 transition-colors"
        >
          <span
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
              value.linkBusiness
                ? 'border-cyber-cyan/20 bg-cyber-cyan/10 text-cyber-cyan'
                : 'border-cyber-border text-mist'
            }`}
          >
            <Link2 className="w-4 h-4" strokeWidth={1.8} />
          </span>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-ivory">
              关联商家信息
              <span className="text-[11px] text-mist font-normal ml-2">
                探店 / 带货场景开启
              </span>
            </div>
            <div className="text-[11px] text-mist mt-0.5">
              {value.linkBusiness
                ? '已开启，下方商家信息将参与 IP 文案生成'
                : '未开启，仅生成纯 IP 内容文案'}
            </div>
          </div>
          <Switch on={value.linkBusiness} />
          {value.linkBusiness ? (
            <ChevronDown className="w-4 h-4 text-mist" strokeWidth={1.8} />
          ) : (
            <ChevronRight className="w-4 h-4 text-mist" strokeWidth={1.8} />
          )}
        </button>
        {value.linkBusiness && (
          <div className="px-4 pb-5 pt-2 border-t border-cyber-border fade-in-up">
            <div className="chip mb-4">
              <Store className="w-3 h-3" strokeWidth={2} />
              以下商家资料将作为你 IP 的探店 / 带货素材
            </div>
            <BusinessFormFields
              value={value.linkedBusiness}
              onChange={(v) => upd('linkedBusiness', v)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-flex items-center h-6 w-11 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 ${
        on ? 'cyber-glow' : 'bg-[#1b2e56]'
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-[#f5f0e4] shadow transform transition-transform duration-300 ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </span>
  );
}

function EmptyState({ mode, isGenerating }: { mode: Mode; isGenerating?: boolean }) {
  const [tipIndex, setTipIndex] = useState(0);

  const JIAO_TIPS = [
    { icon: '🎬', text: '焦总正在给你写脚本...' },
    { icon: '💡', text: '前3秒的钩子决定了80%的播放量' },
    { icon: '🎯', text: '发布后30分钟内回复所有评论，权重加倍' },
    { icon: '📍', text: '别忘了挂载POI地址，本地流量全靠它' },
    { icon: '🔥', text: '同一家店可以换不同钩子拍10条视频' },
    { icon: '📊', text: '5000本地播放 > 10万外地播放，精准比爆更重要' },
    { icon: '⏰', text: '午休12点和晚上9点，是本地生活流量高峰' },
    { icon: '💬', text: '评论区留一条引导评论并置顶，互动率翻倍' },
  ];

  useEffect(() => {
    if (!isGenerating) return;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % JIAO_TIPS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isGenerating]);

  if (isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4">
        {/* 动画圈 */}
        <div className="relative w-16 h-16 mb-6">
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: '#D4AF6A', borderRightColor: 'rgba(212,175,106,0.3)' }}
          />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderBottomColor: '#D4AF6A',
              borderLeftColor: 'rgba(212,175,106,0.3)',
              animationDirection: 'reverse',
              animationDuration: '1.5s',
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xl">🎬</span>
        </div>

        {/* 轮播提示文字 */}
        <p className="text-white/70 text-sm text-center font-medium mb-1 transition-all duration-500">
          {JIAO_TIPS[tipIndex].icon} {JIAO_TIPS[tipIndex].text}
        </p>
        <p className="text-white/30 text-xs">预计需要 10-20 秒，请稍候...</p>

        {/* 进度点 */}
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: '#D4AF6A', animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl border border-cyber-cyan/20 animate-pulse flex items-center justify-center mb-5 relative">
        <FileText className="w-7 h-7 text-gold" strokeWidth={1.5} />
        <div className="absolute inset-0 rounded-2xl bg-cyber-cyan/5" />
      </div>
      <div className="text-base font-semibold text-ivory">等你的创作简报</div>
      <div className="text-xs text-mist mt-2 max-w-xs leading-relaxed">
        {mode === 'business'
          ? '选好抖音来客类目、填写门店与团购套餐信息，我会为你生成一整套获客素材。'
          : '填写人设与方向；如做探店/带货，请开启「关联商家」补齐商家资料。'}
      </div>
      <div className="divider-gold w-24 mt-6" />
    </div>
  );
}

function ResultCard({
  item,
  copied,
  onCopy,
}: {
  item: ResultItem;
  copied: boolean;
  onCopy: () => void;
}) {
  const isStreaming = item.status === 'streaming';
  const isError = item.status === 'error';
  return (
    <div className="rounded-xl border border-cyber-border bg-cyber-bg/60 overflow-hidden fade-in-up">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyber-border bg-[#12213f]/70">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full cyber-glow flex-shrink-0" />
          <span className="text-sm font-semibold text-ivory truncate">
            {item.name}
          </span>
          {isStreaming && (
            <span className="text-[10px] shimmer-text font-medium ml-1">
              创作中
            </span>
          )}
          {item.status === 'done' && (
            <span className="text-[10px] text-gold ml-1">已完成</span>
          )}
          {isError && (
            <span className="text-[10px] text-[#e88b8b] ml-1">出错</span>
          )}
        </div>
        <button
          type="button"
          className="cyber-btn-outline h-7 px-2.5 text-[11px] font-medium flex items-center gap-1"
          onClick={onCopy}
          disabled={!item.content.trim()}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" strokeWidth={2.4} />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" strokeWidth={2} />
              复制
            </>
          )}
        </button>
      </div>
      <div className="px-5 py-5">
        {isError ? (
          <div className="text-sm text-[#e88b8b]">
            {item.error || '生成失败，请稍后重试'}
          </div>
        ) : (
          <div
            className={`result-block ${isStreaming ? 'cursor-blink' : ''}`}
          >
            {item.content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown> : (isStreaming ? '' : '暂无内容')}
          </div>
        )}
      </div>
    </div>
  );
}
