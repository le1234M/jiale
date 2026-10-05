'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Calendar as CalendarIcon,
  BarChart3,
  Library,
  ArrowLeft,
  Users,
  BrainCircuit
} from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'
import { ContentCalendar } from '@/components/content-calendar'
import { DataDashboard } from '@/components/data-dashboard'
import { MaterialLibrary } from '@/components/material-library'
import { AccountSwitcher } from '@/components/account-switcher'
import { useAccounts } from '@/hooks/use-accounts'
import { IndustryAudienceAnalysis } from '@/components/industry-audience-analysis'

type Tab = 'calendar' | 'dashboard' | 'materials' | 'audience'

export default function ToolsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('calendar')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [dashboardKey, setDashboardKey] = useState(0)

  const {
    accounts,
    currentAccount,
    createAccount,
    deleteAccount,
    updateAccount,
    switchAccount,
    fetchAccounts,
  } = useAccounts()

  // 刷新数据看板
  const handleDashboardRefresh = () => {
    setDashboardKey(prev => prev + 1)
    fetchAccounts()
  }

  useEffect(() => {
    fetch('/api/auth')
      .then(res => {
        if (!res.ok) {
          router.push('/login')
        }
        setIsCheckingAuth(false)
      })
      .catch(() => {
        setIsCheckingAuth(false)
      })
  }, [router])

  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A162E]">
        <div className="text-[#D4AF6A] text-lg">加载中...</div>
      </div>
    )
  }

  const tabs = [
    { key: 'calendar' as Tab, label: '内容日历', icon: <CalendarIcon size={18} /> },
    { key: 'dashboard' as Tab, label: '数据看板', icon: <BarChart3 size={18} /> },
    { key: 'materials' as Tab, label: '素材库', icon: <Library size={18} /> },
    { key: 'audience' as Tab, label: '行业人群分析', icon: <BrainCircuit size={18} /> },
  ]

  return (
    <div className="min-h-screen w-full text-ivory relative overflow-hidden">
      <AnimatedBackground />
      
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 border-b border-gold-faint bg-ink-900/85 backdrop-blur-lg px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg hover:bg-[#1B2E56] transition-colors"
            >
              <ArrowLeft size={20} className="text-[#8B94A8]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#0a162e] flex items-center justify-center border border-[#D4AF6A]/30">
                <Image
                  src="/logo.png"
                  alt="佳乐本地生活服务"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">运营工具</div>
                <div className="text-[10px] text-mist tracking-wide">JIALE · Tools</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AccountSwitcher
              accounts={accounts}
              currentAccount={currentAccount}
              onSwitch={switchAccount}
              onCreate={createAccount}
              onDelete={deleteAccount}
              onUpdate={updateAccount}
            />
            {/* 退出登录按钮 */}
            <button
              onClick={() => {
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'merchant_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                router.push('/login');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(194,90,90,0.3)] text-[#C25A5A] hover:bg-[#C25A5A]/10 hover:border-[#C25A5A]/50 transition-all text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Tab 导航 - 固定在顶部 */}
      <div className="sticky top-[60px] z-20 bg-[#0A162E]/95 backdrop-blur-md border-b border-[rgba(212,175,106,0.2)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-t-lg font-bold text-xs sm:text-base transition-all relative whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] text-[#0A162E] shadow-lg'
                    : 'text-[#8B94A8] hover:text-[#F5F0E4] hover:bg-[#1B2E56]/50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 2)}</span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0A162E]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="fade-in-up">
          {activeTab === 'calendar' && (
            <ContentCalendar accountId={currentAccount?.id} />
          )}
          {activeTab === 'dashboard' && (
            <DataDashboard
              key={dashboardKey}
              accountId={currentAccount?.id}
              onDataRefresh={handleDashboardRefresh}
            />
          )}
          {activeTab === 'materials' && (
            <MaterialLibrary accountId={currentAccount?.id} />
          )}
          {activeTab === 'audience' && (
            <IndustryAudienceAnalysis accountId={currentAccount?.id} />
          )}
        </div>
      </div>
    </div>
  )
}
