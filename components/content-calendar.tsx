'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Video,
  Mic,
  Camera,
  Radio,
  MessageCircle,
  FileText,
  Eye
} from 'lucide-react'

interface CalendarItem {
  id: string
  title: string
  content_type: string
  scheduled_date: string
  scheduled_time?: string
  status: 'pending' | 'shooting' | 'editing' | 'published' | 'delayed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  notes?: string
  account_id?: string
  generated_content?: string
}

interface ContentCalendarProps {
  accountId?: string
}

const CONTENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  script: <Video size={14} />,
  talking: <Mic size={14} />,
  vlog: <Camera size={14} />,
  livestream: <Radio size={14} />,
  interaction: <MessageCircle size={14} />,
  calendar: <FileText size={14} />
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  script: '短视频脚本',
  talking: '口播文案',
  vlog: '探店Vlog',
  livestream: '直播话术',
  interaction: '互动话术',
  calendar: '月度选题'
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '待发布', color: 'text-[#8B94A8]', icon: <Circle size={12} /> },
  shooting: { label: '拍摄中', color: 'text-[#D4AF6A]', icon: <AlertCircle size={12} /> },
  editing: { label: '剪辑中', color: 'text-[#E8C989]', icon: <Edit2 size={12} /> },
  published: { label: '已发布', color: 'text-green-400', icon: <CheckCircle2 size={12} /> },
  delayed: { label: '已延期', color: 'text-[#C25A5A]', icon: <AlertCircle size={12} /> }
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'border-[#8B94A8]/30',
  normal: 'border-[#D4AF6A]/30',
  high: 'border-[#D4AF6A]/60',
  urgent: 'border-[#C25A5A]/60'
}

export function ContentCalendar({ accountId }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [items, setItems] = useState<CalendarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showContent, setShowContent] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState<{
    title: string
    content_type: string
    scheduled_time: string
    status: 'pending' | 'shooting' | 'editing' | 'published' | 'delayed'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    notes: string
  }>({
    title: '',
    content_type: 'script',
    scheduled_time: '',
    status: 'pending',
    priority: 'normal',
    notes: ''
  })

  // 获取日历数据
  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`

      const params = new URLSearchParams({ startDate, endDate })
      if (accountId) params.set('accountId', accountId)

      const res = await fetch(`/api/calendar?${params}`)
      const data = await res.json()
      if (data.success) {
        setItems(data.data)
      }
    } catch (err) {
      console.error('获取日历失败:', err)
    } finally {
      setLoading(false)
    }
  }, [currentDate, accountId])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  // 创建/更新日历内容
  const handleSubmit = async () => {
    if (!formData.title || !selectedDate) return

    try {
      if (editingItem) {
        const res = await fetch(`/api/calendar/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            scheduled_date: selectedDate,
            account_id: accountId
          })
        })
        const data = await res.json()
        if (data.success) {
          setItems(prev => prev.map(item => item.id === editingItem.id ? data.data : item))
        }
      } else {
        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            scheduled_date: selectedDate,
            account_id: accountId
          })
        })
        const data = await res.json()
        if (data.success) {
          setItems(prev => [...prev, data.data])
        }
      }
      setShowModal(false)
      resetForm()
    } catch (err) {
      console.error('保存失败:', err)
    }
  }

  // 删除日历内容
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条内容吗？')) return
    try {
      await fetch(`/api/calendar/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  // 更新状态
  const handleStatusChange = async (id: string, status: CalendarItem['status']) => {
    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (data.success) {
        setItems(prev => prev.map(item => item.id === id ? data.data : item))
      }
    } catch (err) {
      console.error('更新状态失败:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content_type: 'script',
      scheduled_time: '',
      status: 'pending',
      priority: 'normal',
      notes: ''
    })
    setEditingItem(null)
  }

  const openCreateModal = (date: string) => {
    setSelectedDate(date)
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (item: CalendarItem) => {
    setSelectedDate(item.scheduled_date)
    setEditingItem(item)
    setShowContent(false)
    setFormData({
      title: item.title,
      content_type: item.content_type,
      scheduled_time: item.scheduled_time || '',
      status: item.status,
      priority: item.priority,
      notes: item.notes || ''
    })
    setShowModal(true)
  }

  // 日历计算
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // 按日期分组内容
  const itemsByDate = items.reduce((acc, item) => {
    const date = item.scheduled_date
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {} as Record<string, CalendarItem[]>)

  // 空状态
  if (!loading && items.length === 0) {
    return (
      <div className="card-luxe p-12 text-center">
        <CalendarIcon size={64} className="mx-auto mb-6 text-[#D4AF6A] opacity-30" />
        <h3 className="text-xl font-bold text-[#F5F0E4] mb-3">暂无排期</h3>
        <p className="text-[#8B94A8] mb-6">生成文案后，可以创建发布计划</p>
        <div className="space-y-3 text-sm text-[#8B94A8]">
          <p>💡 开始使用：</p>
          <ol className="text-left space-y-2 max-w-md mx-auto">
            <li>1. 返回主页填写门店信息</li>
            <li>2. 选择输出类型生成文案</li>
            <li>3. 在日历中创建发布计划</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="card-luxe p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-[#D4AF6A]" size={20} />
          <h2 className="text-xl font-bold text-[#F5F0E4]">内容日历</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[#1B2E56] transition-colors">
            <ChevronLeft size={18} className="text-[#8B94A8]" />
          </button>
          <span className="text-[#F5F0E4] font-medium min-w-[100px] text-center">
            {year}年 {monthNames[month]}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[#1B2E56] transition-colors">
            <ChevronRight size={18} className="text-[#8B94A8]" />
          </button>
        </div>
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 星期标题 */}
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-[#8B94A8] py-2 font-medium">
            {day}
          </div>
        ))}

        {/* 日期格子 */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayItems = itemsByDate[dateStr] || []
          const isToday = dateStr === today

          return (
            <div
              key={day}
              className={`aspect-square p-1 rounded-lg border transition-all cursor-pointer hover:border-[#D4AF6A]/50 ${
                isToday ? 'border-[#D4AF6A] bg-[#D4AF6A]/10' : 'border-[rgba(212,175,106,0.1)]'
              }`}
              onClick={() => openCreateModal(dateStr)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${isToday ? 'text-[#D4AF6A]' : 'text-[#F5F0E4]'}`}>
                  {day}
                </span>
                {dayItems.length > 0 && (
                  <span className="text-[10px] text-[#8B94A8]">{dayItems.length}</span>
                )}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayItems.slice(0, 2).map(item => (
                  <div
                    key={item.id}
                    className={`text-[10px] px-1 py-0.5 rounded border-l-2 ${PRIORITY_COLORS[item.priority]} bg-[#0A162E]/50 group relative`}
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(item)
                    }}
                  >
                    <span className={STATUS_CONFIG[item.status].color}>
                      {item.title}
                    </span>
                    {item.generated_content && (
                      <span className="absolute right-1 top-0.5 text-[#D4AF6A] opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileText size={8} />
                      </span>
                    )}
                  </div>
                ))}
                {dayItems.length > 2 && (
                  <div className="text-[10px] text-[#8B94A8] px-1">
                    +{dayItems.length - 2} 更多
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[rgba(212,175,106,0.1)]">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={config.color}>{config.icon}</span>
            <span className="text-xs text-[#8B94A8]">{config.label}</span>
          </div>
        ))}
      </div>

      {/* 创建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12213F] border border-[rgba(212,175,106,0.3)] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#F5F0E4]">
                {editingItem ? '编辑内容' : '新建内容'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#8B94A8] hover:text-[#F5F0E4]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8B94A8] mb-1.5">日期</label>
                <div className="text-[#F5F0E4] font-medium">{selectedDate}</div>
              </div>

              <div>
                <label className="block text-sm text-[#8B94A8] mb-1.5">标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="如：火锅套餐探店视频"
                  className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] placeholder-[#8B94A8]/50 focus:outline-none focus:border-[#D4AF6A]"
                />
              </div>

              {/* 查看生成文案 */}
              {editingItem?.generated_content && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowContent(!showContent)}
                    className="flex items-center gap-2 text-sm text-[#D4AF6A] hover:text-[#E8C989] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {showContent ? '收起文案' : '查看生成文案'}
                  </button>
                  {showContent && (
                    <div className="mt-3 p-4 bg-[#0A162E] border border-[#D4AF6A]/20 rounded-lg max-h-96 overflow-y-auto">
                      <div className="whitespace-pre-wrap text-sm text-[#F5F0E4] leading-relaxed">
                        {typeof editingItem.generated_content === 'string'
                          ? editingItem.generated_content
                          : JSON.stringify(editingItem.generated_content, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#8B94A8] mb-1.5">内容类型</label>
                  <select
                    value={formData.content_type}
                    onChange={e => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                    className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] focus:outline-none focus:border-[#D4AF6A]"
                  >
                    {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8B94A8] mb-1.5">发布时间</label>
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={e => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] focus:outline-none focus:border-[#D4AF6A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#8B94A8] mb-1.5">状态</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] focus:outline-none focus:border-[#D4AF6A]"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8B94A8] mb-1.5">优先级</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] focus:outline-none focus:border-[#D4AF6A]"
                  >
                    <option value="low">低</option>
                    <option value="normal">普通</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#8B94A8] mb-1.5">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="拍摄要点、注意事项等..."
                  rows={3}
                  className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] placeholder-[#8B94A8]/50 focus:outline-none focus:border-[#D4AF6A] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {editingItem && (
                <button
                  onClick={() => {
                    handleDelete(editingItem.id)
                    setShowModal(false)
                  }}
                  className="px-4 py-2.5 rounded-lg border border-[#C25A5A]/30 text-[#C25A5A] hover:bg-[#C25A5A]/10 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[rgba(212,175,106,0.3)] text-[#8B94A8] hover:text-[#F5F0E4] hover:border-[#D4AF6A] transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.title}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] text-[#0A162E] font-semibold hover:shadow-lg hover:shadow-[rgba(212,175,106,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingItem ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
