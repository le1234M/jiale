'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Account } from '@/lib/types/account'
import { Users, Plus, MoreVertical, Check, Trash2, Edit2, X } from 'lucide-react'

interface AccountSwitcherProps {
  accounts: Account[]
  currentAccount: Account | null
  onSwitch: (account: Account) => void
  onCreate: (name: string, platform: string, accountId?: string) => Promise<void>
  onDelete: (id: string) => Promise<void> | Promise<boolean>
  onUpdate: (id: string, updates: Partial<Account>) => Promise<void>
}

export function AccountSwitcher({
  accounts,
  currentAccount,
  onSwitch,
  onCreate,
  onDelete,
  onUpdate
}: AccountSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  // 创建账号表单
  const [newName, setNewName] = useState('')
  const [newPlatform, setNewPlatform] = useState('douyin')
  const [newAccountId, setNewAccountId] = useState('')

  // 编辑账号表单
  const [editName, setEditName] = useState('')

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await onCreate(newName, newPlatform, newAccountId || undefined)
      setNewName('')
      setNewPlatform('douyin')
      setNewAccountId('')
      setShowCreateModal(false)
    } catch (err: any) {
      alert('创建失败：' + (err?.message || '未知错误'))
    }
  }

  const handleStartEdit = (account: Account) => {
    setEditingId(account.id)
    setEditName(account.name)
    setMenuOpenId(null)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return
    await onUpdate(id, { name: editName })
    setEditingId(null)
    setEditName('')
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个账号吗？')) {
      await onDelete(id)
    }
    setMenuOpenId(null)
  }

  const handleSetDefault = async (id: string) => {
    await onUpdate(id, { is_default: true })
    setMenuOpenId(null)
  }

  const platformLabels: Record<string, string> = {
    douyin: '抖音',
    kuaishou: '快手',
    xiaohongshu: '小红书',
    other: '其他'
  }

  return (
    <>
      {/* 账号切换器 */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12213F] border border-[rgba(212,175,106,0.2)] hover:border-[rgba(212,175,106,0.5)] transition-all"
        >
          <Users size={16} className="text-[#D4AF6A]" />
          <span className="text-[#F5F0E4] text-sm font-medium">
            {currentAccount?.name || '选择账号'}
          </span>
          <span className="text-[#8B94A8] text-xs">
            ({accounts.length})
          </span>
        </button>

        {/* 下拉菜单 */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-[#12213F] border border-[rgba(212,175,106,0.3)] rounded-lg shadow-xl z-50 overflow-hidden">
            {/* 账号列表 */}
            <div className="max-h-64 overflow-y-auto">
              {accounts.length === 0 ? (
                <div className="p-4 text-center text-[#8B94A8] text-sm">
                  暂无账号，点击下方添加
                </div>
              ) : (
                accounts.map(account => (
                  <div
                    key={account.id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1B2E56] transition-colors ${
                      currentAccount?.id === account.id ? 'bg-[#1B2E56]' : ''
                    }`}
                  >
                    {/* 编辑模式 */}
                    {editingId === account.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded px-2 py-1 text-sm text-[#F5F0E4] focus:outline-none focus:border-[#D4AF6A]"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEdit(account.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(account.id)}
                          className="p-1 text-[#D4AF6A] hover:text-[#E8C989]"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-[#8B94A8] hover:text-[#F5F0E4]"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* 当前账号标记 */}
                        <div className="flex-shrink-0 w-1 h-8 rounded-full bg-transparent">
                          {currentAccount?.id === account.id && (
                            <div className="w-full h-full bg-[#D4AF6A]" />
                          )}
                        </div>

                        {/* 账号信息 */}
                        <button
                          onClick={() => {
                            onSwitch(account)
                            setIsOpen(false)
                          }}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[#F5F0E4] text-sm font-medium">
                              {account.name}
                            </span>
                            {account.is_default && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(212,175,106,0.2)] text-[#D4AF6A]">
                                默认
                              </span>
                            )}
                          </div>
                          <div className="text-[#8B94A8] text-xs mt-0.5">
                            {platformLabels[account.platform]}
                            {account.account_id && ` · ${account.account_id}`}
                          </div>
                        </button>

                        {/* 更多操作 */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpenId(menuOpenId === account.id ? null : account.id)
                            }}
                            className="p-1 text-[#8B94A8] hover:text-[#D4AF6A] transition-colors"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {menuOpenId === account.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg shadow-xl z-10 overflow-hidden">
                              <button
                                onClick={() => handleStartEdit(account)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#F5F0E4] hover:bg-[#1B2E56]"
                              >
                                <Edit2 size={12} />
                                重命名
                              </button>
                              {!account.is_default && (
                                <button
                                  onClick={() => handleSetDefault(account.id)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#F5F0E4] hover:bg-[#1B2E56]"
                                >
                                  <Check size={12} />
                                  设为默认
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(account.id) }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#C25A5A] hover:bg-[#1B2E56]"
                              >
                                <Trash2 size={12} />
                                删除
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* 添加账号按钮 */}
            <div className="border-t border-[rgba(212,175,106,0.1)] p-2">
              <button
                onClick={() => {
                  setShowCreateModal(true)
                  setIsOpen(false)
                }}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed border-[rgba(212,175,106,0.3)] text-[#D4AF6A] text-sm hover:border-[#D4AF6A] hover:bg-[rgba(212,175,106,0.05)] transition-all"
              >
                <Plus size={14} />
                添加账号
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 创建账号弹窗 - 使用 Portal 渲染到 body */}
      {showCreateModal && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" style={{ position: 'fixed' }}>
          <div className="bg-[#12213F] border border-[rgba(212,175,106,0.3)] rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-[#F5F0E4] text-lg font-bold mb-4">添加新账号</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[#8B94A8] text-sm mb-1.5">账号名称 *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="如：老余家火锅"
                  className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] placeholder-[#8B94A8]/50 focus:outline-none focus:border-[#D4AF6A] transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[#8B94A8] text-sm mb-1.5">平台</label>
                <select
                  value={newPlatform}
                  onChange={e => setNewPlatform(e.target.value)}
                  className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] focus:outline-none focus:border-[#D4AF6A] transition-colors"
                >
                  <option value="douyin">抖音</option>
                  <option value="kuaishou">快手</option>
                  <option value="xiaohongshu">小红书</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8B94A8] text-sm mb-1.5">平台账号ID（可选）</label>
                <input
                  type="text"
                  value={newAccountId}
                  onChange={e => setNewAccountId(e.target.value)}
                  placeholder="如：laoyujia888"
                  className="w-full bg-[#0A162E] border border-[rgba(212,175,106,0.3)] rounded-lg px-3 py-2.5 text-[#F5F0E4] placeholder-[#8B94A8]/50 focus:outline-none focus:border-[#D4AF6A] transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[rgba(212,175,106,0.3)] text-[#8B94A8] hover:text-[#F5F0E4] hover:border-[#D4AF6A] transition-all"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF6A] to-[#E8C989] text-[#0A162E] font-semibold hover:shadow-lg hover:shadow-[rgba(212,175,106,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
