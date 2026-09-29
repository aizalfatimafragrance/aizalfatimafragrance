import type { Config } from "@netlify/functions";
import { eq, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { loyaltyCards, orders } from "../../db/schema.js";
import { badRequest, getSettings, isValidPhone, normalizePhone } from "../lib/util.js";

export default async (req: Request) => {
  const phone = normalizePhone(new URL(req.url).searchParams.get("phone"));
  if (!isValidPhone(phone)) return badRequest("Enter a valid phone number");

  const [[card], recent, s] = await Promise.all([
    db.select().from(loyaltyCards).where(eq(loyaltyCards.phone, phone)),
    db
      .select({ code: orders.code, total: orders.total, status: orders.status, createdAt: orders.createdAt })
      .from(orders)
      .where(eq(orders.phone, phone))
      .orderBy(desc(orders.createdAt))
      .limit(5),
    getSettings(),
  ]);

  return Response.json({
    card: card ?? { phone, name: "", stamps: 0, rewardsRedeemed: 0, totalOrders: 0, totalSpent: 0 },
    recentOrders: recent,
    rewardStamps: s.rewardStamps,
    rewardPercent: s.rewardPercent,
  });
};

export const config: Config = { path: "/api/loyalty", method: "GET" };
