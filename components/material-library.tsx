'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Library,
  Plus,
  Search,
  Filter,
  Heart,
  Copy,
  Edit2,
  Trash2,
  X,
  Tag,
  Zap,
  FileText,
  Music,
  Lightbulb,
  BookOpen
} from 'lucide-react'

interface Material {
  id: string
  type: 'hook' | 'script' | 'bgm' | 'template' | 'idea'
  category?: string
  title: string
  content: string
  tags: string[]
  source: string
  usage_count: number
  is_favorite: boolean
  created_at: string
}

interface MaterialLibraryProps {
  accountId?: string
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  hook: { label: '钩子模板', icon: <Zap size={14} />, color: 'text-[#D4AF6A]' },
  script: { label: '爆款脚本', icon: <FileText size={14} />, color: 'text-blue-400' },
  bgm: { label: 'BGM推荐', icon: <Music size={14} />, color: 'text-pink-400' },
  template: { label: '文案模板', icon: <BookOpen size={14} />, color: 'text-green-400' },
  idea: { label: '创意灵感', icon: <Lightbulb size={14} />, color: 'text-yellow-400' }
}

export function MaterialLibrary({ accountId }: MaterialLibraryProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // 筛选状态
  const [filterType, setFilterType] = useState<string>('')
  const [filterFavorite, setFilterFavorite] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 表单状态
  const [formData, setFormData] = useState<{
    type: 'hook' | 'script' | 'bgm' | 'template' | 'idea'
    category: string
    title: string
    content: string
    tags: string
  }>({
    type: 'hook',
    category: '',
    title: '',
    content: '',
    tags: ''
  })

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterType) params.set('type', filterType)
      if (filterFavorite) params.set('isFavorite', 'true')
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/materials?${params}`)
      const data = await res.json()
      if (data.success) {
        setMaterials(data.data)
      }
    } catch (err) {
      console.error('获取素材失败:', err)
    } finally {
      setLoading(false)
    }
  }, [filterType, filterFavorite, searchQuery])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) return

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      
      if (editingMaterial) {
        const res = await fetch(`/api/materials/${editingMaterial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, tags })
        })
        const data = await res.json()
        if (data.success) {
          setMaterials(prev => prev.map(m => m.id === editingMaterial.id ? data.data : m))
        }
      } else {
        const res = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, tags })
        })
        const data = await res.json()
        if (data.success) {
          setMaterials(prev => [data.data, ...prev])
        }
      }
      setShowModal(false)
      resetForm()
    } catch (err) {
      console.error('保存失败:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条素材吗？')) return
    try {
      await fetch(`/api/materials/${id}`, { method: 'DELETE' })
      setMaterials(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !isFavorite })
      })
      const data = await res.json()
      if (data.success) {
        setMaterials(prev => prev.map(m => m.id === id ? data.data : m))
      }
    } catch (err) {
      console.error('更新收藏失败:', err)
    }
  }

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      // 增加使用次数
      fetch(`/api/materials/${id}/use`, { method: 'POST' })
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'hook',
      category: '',
      title: '',
      content: '',
      tags: ''
    })
    setEditingMaterial(null)
  }

  const openEditModal = (material: Material) => {
    setEditingMaterial(material)
    setFormData({
      type: material.type,
      category: material.category || '',
      title: material.title,
      content: material.content,
      tags: material.tags.join(', ')
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="card-luxe p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Library className="text-[#D4AF6A]" size={20} />
            <h2 className="text-xl font-bold text-[#F5F0E4]">素材库</h2>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="btn-gold h-9 px-4 flex items-center gap-2 text-sm"
          >
            <Plus size={14} />
            添加素材
          </button>
        </div>

        {/* 筛选栏 */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B94A8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索素材..."
              className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F5F0E4] placeholder-[#8B94A8]/50 focus:outline-none focus:border-[#D4AF6A]"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2 text-sm text-[#F5F0E4] focus:outline-none focus:border-[#D4AF6A]"
          >
            <option value="">全部类型</option>
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <button
            onClick={() => setFilterFavorite(!filterFavorite)}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
              filterFavorite
                ? 'bg-[#D4AF6A]/20 text-[#D4AF6A] border border-[#D4AF6A]/50'
                : 'bg-[#0A162E] text-[#8B94A8] border border-[rgba(212,175,106,0.3)]'
            }`}
          >
            <Heart size={14} fill={filterFavorite ? 'currentColor' : 'none'} />
            收藏
          </button>
        </div>
      </div>

      {/* 素材列表 */}
      {loading ? (
        <div className="card-luxe p-12 text-center text-[#8B94A8]">加载中...</div>
      ) : materials.length === 0 ? (
        <div className="card-luxe p-12 text-center">
          <Library size={48} className="mx-auto mb-4 text-[#8B94A8]/30" />
          <p className="text-[#8B94A8]">暂无素材</p>
          <p className="text-sm text-[#8B94A8]/60 mt-2">点击"添加素材"开始收藏你的爆款模板</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map(material => {
            const typeConfig = TYPE_CONFIG[material.type]
            return (
              <div
                key={material.id}
                className="card-luxe p-4 hover:border-[rgba(212,175,106,0.5)] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`${typeConfig.color} flex items-center gap-1.5`}>
                      {typeConfig.icon}
                      <span className="text-xs font-medium">{typeConfig.label}</span>
                    </span>
                    {material.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B2E56] text-[#8B94A8]">
                        {material.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(material.id, material.is_favorite)}
                      className={`p-1.5 rounded-lg transition-all ${
                        material.is_favorite
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-[#8B94A8] hover:text-red-400 hover:bg-[#1B2E56]'
                      }`}
                    >
                      <Heart size={14} fill={material.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => openEditModal(material)}
                      className="p-1.5 rounded-lg text-[#8B94A8] hover:text-[#D4AF6A] hover:bg-[#1B2E56] transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-1.5 rounded-lg text-[#8B94A8] hover:text-[#C25A5A] hover:bg-[#1B2E56] transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="text-[#F5F0E4] font-medium mb-2">{material.title}</h3>
                
                <p className="text-sm text-[#8B94A8] line-clamp-3 mb-3">
                  {material.content}
                </p>

                {material.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <Tag size={12} className="text-[#8B94A8]" />
                    {material.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#1B2E56] text-[#8B94A8]">
                        {tag}
                      </span>
                    ))}
                    {material.tags.length > 3 && (
                      <span className="text-xs text-[#8B94A8]">+{material.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[rgba(212,175,106,0.1)]">
                  <span className="text-xs text-[#8B94A8]">
                    使用 {material.usage_count} 次
                  </span>
                  <button
                    onClick={() => handleCopy(material.id, material.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B2E56] text-[#D4AF6A] text-xs hover:bg-[#D4AF6A]/10 transition-all"
                  >
                    <Copy size={12} />
                    {copiedId === material.id ? '已复制' : '复制'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 添加/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12213F] border border-[rgba(212,175,106,0.3)] rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#F5F0E4]">
                {editingMaterial ? '编辑素材' : '添加素材'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#8B94A8] hover:text-[#F5F0E4]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#8B94A8] mb-1.5">类型 *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] focus:outline-none focus:border-[#D4AF6A]"
                  >
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8B94A8] mb-1.5">分类</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="如：美食、火锅"
                    className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] placeholder-[#8B94A8]/50 focus:outline-none focus:border-[#D4AF6A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#8B94A8] mb-1.5">标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="如：地域钩子-晋城人注意了"
                  className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] placeholder-[#8B94A8]/50 focus:outline-none focus:border-[#D4AF6A]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#8B94A8] mb-1.5">内容 *</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="钩子文案、脚本内容、BGM名称等..."
                  rows={5}
                  className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] placeholder-[#8B94A8]/50 focus:outline-none focus:border-[#D4AF6A] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-[#8B94A8] mb-1.5">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="如：地域钩子, 晋城, 美食"
                  className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] placeholder-[#8B94A8]/50 focus:outline-none focus:border-[#D4AF6A]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[rgba(212,175,106,0.3)] text-[#8B94A8] hover:text-[#F5F0E4] hover:border-[#D4AF6A] transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.content}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] text-[#0A162E] font-semibold hover:shadow-lg hover:shadow-[rgba(212,175,106,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingMaterial ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
