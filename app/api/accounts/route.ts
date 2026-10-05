import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { verifyMerchantToken } from '@/lib/auth-manager'

export const dynamic = 'force-dynamic'

const AUTH_COOKIE_NAME = 'auth_token'

// GET /api/accounts - 获取账号列表
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const merchant = await verifyMerchantToken(token)
    if (!merchant) {
      return NextResponse.json({ success: false, error: '登录已失效' }, { status: 401 })
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: '数据库未配置' }, { status: 500 })
    }

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: accounts || [] })
  } catch (error) {
    console.error('获取账号列表失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// POST /api/accounts - 创建账号
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const merchant = await verifyMerchantToken(token)
    if (!merchant) {
      return NextResponse.json({ success: false, error: '登录已失效' }, { status: 401 })
    }

    const body = await request.json()
    const { name, platform = 'douyin', account_id, is_default = false } = body

    if (!name) {
      return NextResponse.json({ success: false, error: '账号名称不能为空' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: '数据库未配置' }, { status: 500 })
    }

    // 如果设为默认，先取消其他默认
    if (is_default) {
      await supabase
        .from('accounts')
        .update({ is_default: false })
        .eq('merchant_id', merchant.id)
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        merchant_id: merchant.id,
        name,
        platform,
        account_id,
        is_default,
        form_data: {}
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: account })
  } catch (error) {
    console.error('创建账号失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
