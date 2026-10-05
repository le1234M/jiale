import fs from "fs";
import path from "path";

const ROTATION_DAYS = 7;

/**
 * Storage path for the password file.
 *
 * Dev: writes to project root
 * Prod: /tmp is the only guaranteed writable dir
 * We also try the bypass log dir as a fallback for persistence.
 */
function getStorageDir(): string {
  if (process.env.COZE_PROJECT_ENV === "PROD") {
    return "/app/work/logs/bypass";
  }
  return "/tmp";
}

interface PasswordData {
  password: string;
  createdAt: string; // ISO 8601
}

/** Generate a human-readable yet unpredictable password */
function generatePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const random = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`;
  return `Dy@${dateStr}#${random}`;
}

function filePath(): string {
  return path.join(getStorageDir(), "password.json");
}

function loadData(): PasswordData | null {
  try {
    const fp = filePath();
    if (fs.existsSync(fp)) {
      return JSON.parse(fs.readFileSync(fp, "utf-8")) as PasswordData;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveData(data: PasswordData): void {
  try {
    const fp = filePath();
    const dir = path.dirname(fp);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("[PASSWORD_MANAGER] 保存密码失败:", e);
  }
}

function needsRotation(data: PasswordData): boolean {
  const created = new Date(data.createdAt).getTime();
  const now = Date.now();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays >= ROTATION_DAYS;
}

function logPassword(password: string, expiryDate: Date): void {
  const msg = `[PASSWORD_ROTATION] 当前访问密码: ${password} (有效期至 ${expiryDate.toLocaleDateString("zh-CN")})`;
  console.log(msg);
  // Also write to the bypass log dir for easy retrieval
  try {
    const logDir = "/app/work/logs/bypass";
    if (fs.existsSync(logDir)) {
      fs.appendFileSync(
        path.join(logDir, "app.log"),
        `[${new Date().toISOString()}] ${msg}\n`,
        "utf-8",
      );
    }
  } catch {
    // best-effort
  }
}

/**
 * Returns the current valid password.
 * Rotates automatically if 7 days have passed since the last rotation.
 */
export function getCurrentPassword(): string {
  const data = loadData();

  if (!data) {
    // First-ever run — generate initial password
    const pw = generatePassword();
    const expiry = new Date(Date.now() + ROTATION_DAYS * 24 * 60 * 60 * 1000);
    saveData({ password: pw, createdAt: new Date().toISOString() });
    logPassword(pw, expiry);
    return pw;
  }

  if (needsRotation(data)) {
    const newPw = generatePassword();
    const expiry = new Date(Date.now() + ROTATION_DAYS * 24 * 60 * 60 * 1000);
    saveData({ password: newPw, createdAt: new Date().toISOString() });
    logPassword(newPw, expiry);
    return newPw;
  }

  return data.password;
}

/**
 * Returns the current password's expiry date (ISO string), or null if unknown.
 */
export function getPasswordExpiry(): string | null {
  const data = loadData();
  if (!data) return null;
  const created = new Date(data.createdAt).getTime();
  return new Date(created + ROTATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}