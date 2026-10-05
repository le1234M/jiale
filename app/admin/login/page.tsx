"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedBackground } from "@/components/animated-background";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(data.message || "管理员密码错误");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A162E] px-4 relative overflow-hidden">
      {/* 动画背景组件 */}
      <AnimatedBackground />

      {/* 文字装饰层 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-[#D4AF6A]/5 text-6xl font-black tracking-tighter">CONTENT</div>
        <div className="absolute top-40 right-20 text-[#D4AF6A]/5 text-4xl font-black tracking-tighter">运营</div>
        <div className="absolute bottom-32 left-20 text-[#D4AF6A]/5 text-5xl font-black tracking-tighter">短视频</div>
        <div className="absolute bottom-20 right-10 text-[#D4AF6A]/5 text-3xl font-black tracking-tighter">MARKETING</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#F5F0E4] tracking-tight">
            佳乐本地生活服务
          </h1>
          <div className="mt-2 text-xs uppercase tracking-[0.3em] text-[#D4AF6A]">
            Admin Console · 管理后台
          </div>
        </div>

        <div className="bg-[#12213F] border border-[#D4AF6A]/20 rounded-xl p-8 shadow-2xl relative overflow-hidden group hover:border-[#D4AF6A]/40 transition-all duration-500">
          {/* 卡片内部动画光效 */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(212,175,106,0.15),transparent_70%)] pointer-events-none animate-pulse-slow" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[radial-gradient(circle,rgba(27,46,86,0.6),transparent_70%)] pointer-events-none animate-float-medium" />
          {/* 顶部金色光线 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#D4AF6A]/60 to-transparent" />
          <form onSubmit={handleSubmit} className="relative space-y-5">
            <div>
              <label className="block text-sm text-[#8B94A8] mb-2">
                管理员密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-[#0A162E] border border-[#1B2E56] focus:border-[#D4AF6A] outline-none text-[#F5F0E4] transition-colors"
                placeholder="输入管理员密码"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="text-sm text-[#C25A5A] px-3 py-2 rounded bg-[#C25A5A]/10 border border-[#C25A5A]/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg font-semibold text-[#0A162E] bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] hover:brightness-110 transition-all disabled:opacity-60"
            >
              {loading ? "验证中…" : "进入管理后台"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
