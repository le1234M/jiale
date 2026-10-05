import { NextRequest, NextResponse } from "next/server";
import {
  updateMerchant,
  deleteMerchant,
} from "@/lib/auth-manager";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyAdminToken } from "../../auth/route";

const ADMIN_COOKIE_NAME = "admin_token";

function requireAdmin(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(request)) {
    return NextResponse.json(
      { success: false, message: "未授权" },
      { status: 401 },
    );
  }
  const { id } = await params;
  try {
    const body = await request.json();
    if (body.action === "resetQuota") {
      const client = getSupabaseClient();
      if (!client) {
        return NextResponse.json(
          { success: false, message: "数据库未配置" },
          { status: 500 },
        );
      }
      const { data, error } = await client
        .from("merchants")
        .update({ quota_used: 0 })
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error || !data) {
        return NextResponse.json(
          { success: false, message: "重置配额失败" },
          { status: 500 },
        );
      }
      return NextResponse.json({ success: true, merchant: data });
    }
    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.password !== undefined) patch.password = body.password;
    if (body.expiryDate !== undefined) patch.expiryDate = body.expiryDate;
    if (body.quotaTotal !== undefined) {
      patch.quotaTotal =
        body.quotaTotal === null || body.quotaTotal === ""
          ? null
          : Number(body.quotaTotal);
    }
    if (body.note !== undefined) patch.note = body.note;
    if (body.disabled !== undefined) patch.disabled = !!body.disabled;
    if (body.storeDefaults !== undefined) patch.storeDefaults = body.storeDefaults;
    const merchant = await updateMerchant(id, patch);
    if (!merchant) {
      return NextResponse.json(
        { success: false, message: "商家不存在" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, merchant });
  } catch {
    return NextResponse.json(
      { success: false, message: "更新失败" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(request)) {
    return NextResponse.json(
      { success: false, message: "未授权" },
      { status: 401 },
    );
  }
  const { id } = await params;
  const ok = await deleteMerchant(id);
  return NextResponse.json({ success: ok });
}
