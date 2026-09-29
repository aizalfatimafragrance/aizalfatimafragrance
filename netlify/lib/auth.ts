import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_PASSWORD = "af_admin123";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

export const adminPassword = () => process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

// Tokens are signed with ADMIN_SECRET (or the password), so rotating either one signs every admin out.
const signingKey = () => process.env.ADMIN_SECRET || `af:${adminPassword()}`;

const sign = (payload: string) => createHmac("sha256", signingKey()).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
};

export const checkPassword = (password: string) => safeEqual(password, adminPassword());

export const issueToken = () => {
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + TOKEN_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
};

export const isAdmin = (req: Request) => {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
};

export const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 });
