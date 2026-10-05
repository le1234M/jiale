import { NextRequest, NextResponse } from "next/server";
import {
  getAllMerchants,
  addMerchant,
} from "@/lib/auth-manager";
import { verifyAdminToken } from "../auth/route";

const ADMIN_COOKIE_NAME = "admin_token";

function requireAdmin(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json(
      { success: false, message: "未授权" },
      { status: 401 },
    );
  }
  const merchants = await getAllMerchants();
  const total = merchants.length;
  const active = merchants.filter(
    (m) => !m.disabled && new Date(m.expiryDate) > new Date(),
  ).length;
  const quotaTotal = merchants.reduce(
    (s, m) => s + (m.quotaTotal ?? 0),
    0,
  );
  const quotaUsed = merchants.reduce(
    (s, m) => s + (m.quotaUsed ?? 0),
    0,
  );
  return NextResponse.json({
    success: true,
    merchants,
    summary: { total, active, quotaTotal, quotaUsed },
  });
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json(
      { success: false, message: "未授权" },
      { status: 401 },
    );
  }
  try {
    const body = await request.json();
    const { name, days, expiryDate, quotaTotal, note, storeDefaults } = body;
    if (!name || (!days && !expiryDate)) {
      return NextResponse.json(
        { success: false, message: "请填写商家名称和到期日期或有效天数" },
        { status: 400 },
      );
    }
    const merchant = await addMerchant({
      name,
      days: days ? Number(days) : 30,
      expiryDate,
      quotaTotal:
        quotaTotal === null || quotaTotal === undefined || quotaTotal === ""
          ? null
          : Number(quotaTotal),
      note,
      storeDefaults,
    });
    return NextResponse.json({ success: true, merchant });
  } catch {
    return NextResponse.json(
      { success: false, message: "创建失败" },
      { status: 500 },
    );
  }
}