'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ShoppingBag,
  Flame,
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface MetricsSummary {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalFavorites: number
  totalGroupBuyClicks: number
  totalGroupBuyConversions: number
  viralCount: number
  publishedCount: number
  avgCompletionRate: number
  avgEngagementRate: number
}

interface MetricsDetail {
  id: string
  title: string
  content_type: string
  published_at: string
  views: number
  likes: number
  comments: number
  shares: number
  favorites: number
  completion_rate: number
  engagement_rate: number
  group_buy_clicks: number
  group_buy_conversions: number
  is_viral: boolean
  viral_level: string | null
}

interface DataDashboardProps {
  accountId?: string
  onDataRefresh?: () => void
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  script: '短视频脚本',
  talking: '口播文案',
  vlog: '探店Vlog',
  livestream: '直播话术',
  interaction: '互动话术',
  calendar: '月度选题'
}

export function DataDashboard({ accountId, onDataRefresh }: DataDashboardProps) {
  const [summary, setSummary] = useState<MetricsSummary | null>(null)
  const [details, setDetails] = useState<MetricsDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [syncing, setSyncing] = useState(false)

  // 同步数据（带超时保护）
  const handleSync = async () => {
    if (syncing) return
    setSyncing(true)
    try {
      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), 10000)
      const params = new URLSearchParams({ platform: 'douyin_open' })
      if (accountId) params.set('account_id', accountId)
      const response = await fetch(`/api/sync-data?${params.toString()}`, {
        signal: controller.signal,
        cache: 'no-store',
      })
      window.clearTimeout(timeoutId)
      const data: { success?: boolean; error?: string; message?: string } = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || `同步失败（${response.status}）`)
      }
      await fetchMetrics()
      onDataRefresh?.()
      window.alert('数据同步成功，已刷新看板')
    } catch (error: unknown) {
      const message = error instanceof DOMException && error.name === 'AbortError'
        ? '同步超时，请确认抖音账号已授权后重试'
        : error instanceof Error ? error.message : '同步失败，请稍后重试'
      window.alert(message)
    } finally {
      setSyncing(false)
    }
  }

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (dateRange !== 'all') {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        params.set('startDate', startDate.toISOString().split('T')[0])
      }
      
      if (accountId) params.set('accountId', accountId)

      const res = await fetch(`/api/metrics?${params}`)
      const data = await res.json()
      if (data.success) {
        setSummary(data.data.summary)
        setDetails(data.data.details)
      }
    } catch (err) {
      console.error('获取数据失败:', err)
    } finally {
      setLoading(false)
    }
  }, [dateRange, accountId])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const formatNumber = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}w`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const StatCard = ({ icon, label, value, color, subValue }: {
    icon: React.ReactNode
    label: string
    value: string | number
    color: string
    subValue?: string
  }) => (
    <div className="bg-[#12213F] border border-[rgba(212,175,106,0.2)] rounded-xl p-4 hover:border-[rgba(212,175,106,0.5)] transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-xs text-[#8B94A8]">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[#F5F0E4]">{value}</div>
      {subValue && <div className="text-xs text-[#8B94A8] mt-1">{subValue}</div>}
    </div>
  )

  if (loading) {
    return (
      <div className="card-luxe p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-[#D4AF6A]">加载中...</div>
      </div>
    )
  }

  // 空状态
  if (!loading && (!summary || summary.publishedCount === 0)) {
    return (
      <div className="space-y-6">
        {/* 同步按钮 - 空状态时也显示 */}
        <div className="card-luxe p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-[#D4AF6A]" size={20} />
              <h2 className="text-xl font-bold text-[#F5F0E4]">数据看板</h2>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-gold px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? '同步中...' : '同步数据'}
            </button>
          </div>
        </div>

        <div className="card-luxe p-12 text-center">
          <BarChart3 size={64} className="mx-auto mb-6 text-[#D4AF6A] opacity-30" />
          <h3 className="text-xl font-bold text-[#F5F0E4] mb-3">暂无数据</h3>
          <p className="text-[#8B94A8] mb-6">发布内容后，数据看板将展示您的运营数据</p>
          <div className="space-y-3 text-sm text-[#8B94A8]">
            <p>💡 开始使用：</p>
            <ol className="text-left space-y-2 max-w-md mx-auto">
              <li>1. 返回主页填写门店信息</li>
              <li>2. 选择输出类型生成文案</li>
              <li>3. 发布内容后回来查看数据</li>
              <li>4. 或点击「同步数据」从第三方平台拉取</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 日期筛选 */}
      <div className="card-luxe p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-[#D4AF6A]" size={20} />
            <h2 className="text-xl font-bold text-[#F5F0E4]">数据看板</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <a
              href="https://creator.douyin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#00F0FF]/40 bg-[#00F0FF]/10 px-3 py-2 text-xs font-semibold text-[#00F0FF] transition hover:border-[#00F0FF] hover:bg-[#00F0FF]/20 hover:text-[#B8FFFF]"
            >
              <ExternalLink size={14} />
              抖音创作者平台
            </a>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#8B94A8]" />
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dateRange === range
                    ? 'bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] text-[#0A162E]'
                    : 'bg-[#12213F] text-[#8B94A8] hover:text-[#F5F0E4]'
                }`}
              >
                {range === '7d' ? '近7天' : range === '30d' ? '近30天' : range === '90d' ? '近90天' : '全部'}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Eye size={16} />}
          label="总播放量"
          value={formatNumber(summary?.totalViews || 0)}
          color="text-[#D4AF6A]"
        />
        <StatCard
          icon={<Heart size={16} />}
          label="总点赞"
          value={formatNumber(summary?.totalLikes || 0)}
          color="text-pink-400"
        />
        <StatCard
          icon={<MessageCircle size={16} />}
          label="总评论"
          value={formatNumber(summary?.totalComments || 0)}
          color="text-blue-400"
        />
        <StatCard
          icon={<Share2 size={16} />}
          label="总转发"
          value={formatNumber(summary?.totalShares || 0)}
          color="text-green-400"
        />
      </div>

      {/* 转化指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Bookmark size={16} />}
          label="总收藏"
          value={formatNumber(summary?.totalFavorites || 0)}
          color="text-yellow-400"
        />
        <StatCard
          icon={<ShoppingBag size={16} />}
          label="团购点击"
          value={formatNumber(summary?.totalGroupBuyClicks || 0)}
          color="text-[#E8C989]"
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="平均完播率"
          value={`${(summary?.avgCompletionRate || 0).toFixed(1)}%`}
          color="text-purple-400"
        />
        <StatCard
          icon={<Flame size={16} />}
          label="爆款数量"
          value={summary?.viralCount || 0}
          color="text-red-400"
          subValue={`共发布 ${summary?.publishedCount || 0} 条`}
        />
      </div>

      {/* 内容列表 */}
      <div className="card-luxe p-6">
        <h3 className="text-lg font-bold text-[#F5F0E4] mb-4">内容数据明细</h3>
        
        {details.length === 0 ? (
          <div className="text-center py-12 text-[#8B94A8]">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
            <p>暂无数据</p>
            <p className="text-sm mt-2">发布内容后，数据将在这里展示</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(212,175,106,0.1)]">
                  <th className="text-left py-3 px-2 text-xs text-[#8B94A8] font-medium">内容</th>
                  <th className="text-right py-3 px-2 text-xs text-[#8B94A8] font-medium">播放</th>
                  <th className="text-right py-3 px-2 text-xs text-[#8B94A8] font-medium">点赞</th>
                  <th className="text-right py-3 px-2 text-xs text-[#8B94A8] font-medium">评论</th>
                  <th className="text-right py-3 px-2 text-xs text-[#8B94A8] font-medium">转发</th>
                  <th className="text-right py-3 px-2 text-xs text-[#8B94A8] font-medium">互动率</th>
                  <th className="text-right py-3 px-2 text-xs text-[#8B94A8] font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {details.map(item => (
                  <tr key={item.id} className="border-b border-[rgba(212,175,106,0.05)] hover:bg-[#1B2E56]/30">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {item.is_viral && <Flame size={14} className="text-red-400" />}
                        <div>
                          <div className="text-sm text-[#F5F0E4] font-medium truncate max-w-[200px]">
                            {item.title || '未命名'}
                          </div>
                          <div className="text-xs text-[#8B94A8]">
                            {CONTENT_TYPE_LABELS[item.content_type]} · {new Date(item.published_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 text-sm text-[#F5F0E4]">
                      {formatNumber(item.views)}
                    </td>
                    <td className="text-right py-3 px-2 text-sm text-[#F5F0E4]">
                      {formatNumber(item.likes)}
                    </td>
                    <td className="text-right py-3 px-2 text-sm text-[#F5F0E4]">
                      {formatNumber(item.comments)}
                    </td>
                    <td className="text-right py-3 px-2 text-sm text-[#F5F0E4]">
                      {formatNumber(item.shares)}
                    </td>
                    <td className="text-right py-3 px-2 text-sm">
                      <span className={
                        Number(item.engagement_rate) > 10 
                          ? 'text-green-400' 
                          : Number(item.engagement_rate) > 5 
                          ? 'text-[#D4AF6A]' 
                          : 'text-[#8B94A8]'
                      }>
                        {Number(item.engagement_rate).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-2">
                      {item.is_viral ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                          爆款
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-[#1B2E56] text-[#8B94A8]">
                          普通
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
