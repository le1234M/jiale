"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Home, 
  Wrench, 
  History, 
  BookOpen,
  LogOut,
  Zap,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "创作", href: "/", icon: Home },
  { name: "工具箱", href: "/tools", icon: Wrench },
  { name: "历史", href: "/history", icon: History },
  { name: "指南", href: "/guide", icon: BookOpen },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      if (width >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 侧边栏宽度逻辑
  const getSidebarWidth = () => {
    if (isMobile) return 'w-0';
    if (isTablet && sidebarCollapsed) return 'w-16';
    return 'w-64';
  };

  const getContentPadding = () => {
    if (isMobile) return 'pl-0';
    if (isTablet && sidebarCollapsed) return 'pl-16';
    return 'pl-64';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* 移动端顶部导航栏 */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-[#080812]/95 backdrop-blur-xl border-b border-[#00F0FF]/10 z-50 flex items-center justify-between px-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#00F0FF] to-[#BF00FF] flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              <Zap className="w-4 h-4 text-[#0A0A0F]" />
            </div>
            <span className="font-bold text-sm text-[#00F0FF] tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 8px rgba(0,240,255,0.5)' }}>
              JIALE
            </span>
          </Link>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </header>
      )}

      {/* 移动端侧边栏遮罩 */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-[#080812] border-r border-[#00F0FF]/10 z-40 transition-all duration-300 overflow-hidden",
        getSidebarWidth(),
        isMobile && !mobileMenuOpen && "opacity-0 pointer-events-none",
        isMobile && mobileMenuOpen && "w-64 opacity-100",
        isMobile && "top-14 h-[calc(100%-3.5rem)]"
      )}>
        {/* Logo 区域 - 桌面和平板 */}
        {!isMobile && (
          <div className="h-16 flex items-center px-4 border-b border-[#00F0FF]/10">
            <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-8 h-8 min-w-[2rem] rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#BF00FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                <Zap className="w-5 h-5 text-[#0A0A0F]" />
              </div>
              {(!isTablet || !sidebarCollapsed) && (
                <div className="overflow-hidden">
                  <div className="font-display text-sm font-bold text-[#00F0FF] tracking-wider whitespace-nowrap" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(0,240,255,0.5)' }}>
                    JIALE
                  </div>
                  <div className="text-[10px] text-[#6B7280] tracking-widest uppercase whitespace-nowrap">Cyber Studio</div>
                </div>
              )}
            </Link>
            {/* 平板端折叠按钮 */}
            {isTablet && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        
        {/* 导航菜单 */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const showLabel = !isTablet || !sidebarCollapsed;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                  showLabel ? "justify-start" : "justify-center",
                  isActive
                    ? "bg-[#00F0FF]/10 text-[#00F0FF] border-l-2 border-[#00F0FF] shadow-[inset_10px_0_20px_-10px_rgba(0,240,255,0.3)]"
                    : "text-[#6B7280] hover:text-[#E0E0FF] hover:bg-white/[0.03]"
                )}
                title={!showLabel ? item.name : undefined}
              >
                <Icon className={cn(
                  "w-5 h-5 min-w-[1.25rem] transition-all duration-300",
                  isActive && "drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                )} />
                {showLabel && (
                  <span className="whitespace-nowrap overflow-hidden" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '1px' }}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* 底部退出按钮 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#00F0FF]/10">
          <button
            onClick={() => {
              document.cookie = "merchant_token=; max-age=0; path=/";
              window.location.href = "/login";
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#FF003C] hover:bg-white/[0.03] transition-all duration-300",
              (!isTablet || !sidebarCollapsed) ? "justify-start" : "justify-center"
            )}
            title={(!isTablet || !sidebarCollapsed) ? undefined : "退出登录"}
          >
            <LogOut className="w-5 h-5 min-w-[1.25rem]" />
            {(!isTablet || !sidebarCollapsed) && (
              <span className="whitespace-nowrap" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '1px' }}>
                退出登录
              </span>
            )}
          </button>
        </div>
      </aside>
      
      {/* 主内容区 */}
      <main className={cn(
        "transition-all duration-300",
        getContentPadding(),
        isMobile && "pt-14"
      )}>
        {children}
      </main>
    </div>
  );
}
