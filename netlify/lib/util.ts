import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";

export const CATEGORIES = ["spray", "attar", "booster", "signature"] as const;
export const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"] as const;

// Normalises Pakistani numbers to 92XXXXXXXXXX so "0300-1234567" and "+92 300 1234567" match the same loyalty card.
export const normalizePhone = (raw: unknown) => {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("0092")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "92" + digits.slice(1);
  if (digits.length === 10 && digits.startsWith("3")) digits = "92" + digits;
  return digits;
};

export const isValidPhone = (phone: string) => /^\d{11,13}$/.test(phone);

export const clean = (value: unknown, max = 500) => String(value ?? "").trim().slice(0, max);

export const getSettings = async () => {
  const rows = await db.select().from(settings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    whatsapp: map.whatsapp ?? "923001234567",
    rewardStamps: Math.max(1, Number(map.reward_stamps ?? 6)),
    rewardPercent: Math.min(100, Math.max(1, Number(map.reward_percent ?? 20))),
  };
};

export const badRequest = (error: string) => Response.json({ error }, { status: 400 });
