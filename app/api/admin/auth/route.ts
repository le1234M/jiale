import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-manager";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 小时

function signAdmin(): string {
  const secret = process.env.AUTH_SECRET || "jiale-secret-key-2026";
  return crypto
    .createHmac("sha256", secret)
    .update("admin")
    .digest("hex")
    .slice(0, 32);
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  return token === signAdmin();
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json(
        { success: false, message: "请输入管理员密码" },
        { status: 400 },
      );
    }
    if (!(await verifyAdmin(password))) {
      return NextResponse.json(
        { success: false, message: "管理员密码错误" },
        { status: 401 },
      );
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE_NAME, signAdmin(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "登录失败" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
