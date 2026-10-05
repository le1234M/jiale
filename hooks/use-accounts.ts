"use client";
import { useState, useEffect, useCallback } from 'react'
import type { Account, AccountFormData } from '@/lib/types/account'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取账号列表
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/accounts')
      const data = await res.json()
      if (data.success) {
        setAccounts(data.data)
        // 设置默认账号
        const defaultAcc = data.data.find((a: Account) => a.is_default) || data.data[0]
        if (defaultAcc && !currentAccount) {
          setCurrentAccount(defaultAcc)
        }
      }
    } catch (err) {
      console.error('获取账号列表失败:', err)
      setError('获取账号列表失败')
    } finally {
      setLoading(false)
    }
  }, [currentAccount])

  // 创建账号
  const createAccount = useCallback(async (name: string, platform: string = 'douyin', accountId?: string) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, platform, account_id: accountId, is_default: accounts.length === 0 })
      })
      const data = await res.json()
      if (data.success) {
        setAccounts(prev => [data.data, ...prev])
        if (!currentAccount) {
          setCurrentAccount(data.data)
        }
        return data.data
      }
      throw new Error(data.error)
    } catch (err) {
      console.error('创建账号失败:', err)
      throw err
    }
  }, [accounts.length, currentAccount])

  // 更新账号
  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      if (data.success) {
        setAccounts(prev => prev.map(a => a.id === id ? data.data : a))
        if (currentAccount?.id === id) {
          setCurrentAccount(data.data)
        }
        return data.data
      }
      throw new Error(data.error)
    } catch (err) {
      console.error('更新账号失败:', err)
      throw err
    }
  }, [currentAccount])

  // 删除账号
  const deleteAccount = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setAccounts(prev => prev.filter(a => a.id !== id))
        if (currentAccount?.id === id) {
          const remaining = accounts.filter(a => a.id !== id)
          setCurrentAccount(remaining[0] || null)
        }
        return true
      }
      throw new Error(data.error)
    } catch (err) {
      console.error('删除账号失败:', err)
      throw err
    }
  }, [accounts, currentAccount])

  // 切换当前账号
  const switchAccount = useCallback((account: Account) => {
    setCurrentAccount(account)
  }, [])

  // 保存表单数据到当前账号
  const saveFormData = useCallback(async (formData: AccountFormData) => {
    if (!currentAccount) return
    try {
      const res = await fetch(`/api/accounts/${currentAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_data: formData })
      })
      const data = await res.json()
      if (data.success) {
        setCurrentAccount(data.data)
        setAccounts(prev => prev.map(a => a.id === currentAccount.id ? data.data : a))
      }
    } catch (err) {
      console.error('保存表单数据失败:', err)
    }
  }, [currentAccount])

  // 初始加载
  useEffect(() => {
    fetchAccounts()
  }, [])

  return {
    accounts,
    currentAccount,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    switchAccount,
    saveFormData
  }
}
