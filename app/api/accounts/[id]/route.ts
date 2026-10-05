import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { verifyMerchantToken } from '@/lib/auth-manager'

export const dynamic = 'force-dynamic'

const AUTH_COOKIE_NAME = 'auth_token'

// GET /api/accounts/[id] - 获取单个账号
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const merchant = await verifyMerchantToken(token)
    if (!merchant) {
      return NextResponse.json({ success: false, error: '登录已失效' }, { status: 401 })
    }

    const { id } = await params

    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: '数据库未配置' }, { status: 500 })
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .eq('merchant_id', merchant.id)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: account })
  } catch (error) {
    console.error('获取账号失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// PUT /api/accounts/[id] - 更新账号
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const merchant = await verifyMerchantToken(token)
    if (!merchant) {
      return NextResponse.json({ success: false, error: '登录已失效' }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const { name, account_id, is_default, form_data } = body

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
        .neq('id', id)
    }

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (account_id !== undefined) updateData.account_id = account_id
    if (is_default !== undefined) updateData.is_default = is_default
    if (form_data !== undefined) updateData.form_data = form_data
    updateData.updated_at = new Date().toISOString()

    const { data: account, error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', id)
      .eq('merchant_id', merchant.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: account })
  } catch (error) {
    console.error('更新账号失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// DELETE /api/accounts/[id] - 删除账号
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const merchant = await verifyMerchantToken(token)
    if (!merchant) {
      return NextResponse.json({ success: false, error: '登录已失效' }, { status: 401 })
    }

    const { id } = await params

    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: '数据库未配置' }, { status: 500 })
    }

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('merchant_id', merchant.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除账号失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
