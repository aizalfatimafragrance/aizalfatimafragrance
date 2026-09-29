import type { Config } from "@netlify/functions";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../../db/index.js";
import { loyaltyCards, orders, products, type OrderItem } from "../../db/schema.js";
import { badRequest, clean, getSettings, isValidPhone, normalizePhone } from "../lib/util.js";

const makeCode = () => `AF-${Date.now().toString(36).slice(-5).toUpperCase()}${randomBytes(2).toString("hex").toUpperCase()}`;

// Creates an order from the customer's cart. Prices are always re-read from the database, never trusted from the client.
export default async (req: Request) => {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request");

  const customerName = clean(body.name, 80);
  const phone = normalizePhone(body.phone);
  const address = clean(body.address, 300);
  const city = clean(body.city, 60) || "Karachi";
  const notes = clean(body.notes, 500);
  if (!customerName) return badRequest("Please enter your name");
  if (!isValidPhone(phone)) return badRequest("Please enter a valid phone number");
  if (!address) return badRequest("Please enter your delivery address");

  const requested: { id: number; qty: number }[] = Array.isArray(body.items)
    ? body.items
        .map((i: any) => ({ id: Number(i?.id), qty: Math.min(50, Math.max(1, Math.floor(Number(i?.qty) || 1))) }))
        .filter((i: { id: number }) => Number.isInteger(i.id))
        .slice(0, 50)
    : [];
  if (!requested.length) return badRequest("Your bag is empty");

  const found = await db.select().from(products).where(inArray(products.id, requested.map((i) => i.id)));
  const byId = new Map(found.map((p) => [p.id, p]));
  const items: OrderItem[] = [];
  for (const r of requested) {
    const p = byId.get(r.id);
    if (!p) return badRequest("One of the items in your bag is no longer available");
    if (!p.inStock) return badRequest(`${p.name} is currently out of stock`);
    items.push({ productId: p.id, name: p.name, size: p.size, price: p.price, qty: r.qty });
  }
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const s = await getSettings();
  let discount = 0;
  let rewardApplied = false;
  if (body.redeemReward) {
    // Atomic: only succeeds if the card still holds enough stamps.
    const [redeemed] = await db
      .update(loyaltyCards)
      .set({
        stamps: sql`${loyaltyCards.stamps} - ${s.rewardStamps}`,
        rewardsRedeemed: sql`${loyaltyCards.rewardsRedeemed} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(loyaltyCards.phone, phone), gte(loyaltyCards.stamps, s.rewardStamps)))
      .returning();
    if (redeemed) {
      discount = Math.round((subtotal * s.rewardPercent) / 100);
      rewardApplied = true;
    }
  }
  const total = subtotal - discount;

  const [order] = await db
    .insert(orders)
    .values({ code: makeCode(), customerName, phone, address, city, notes, items, subtotal, discount, total, rewardApplied })
    .returning();

  await db
    .insert(loyaltyCards)
    .values({ phone, name: customerName, totalOrders: 1 })
    .onConflictDoUpdate({
      target: loyaltyCards.phone,
      set: { name: customerName, totalOrders: sql`${loyaltyCards.totalOrders} + 1`, updatedAt: new Date() },
    });

  return Response.json({ order, whatsapp: s.whatsapp }, { status: 201 });
};

export const config: Config = { path: "/api/orders", method: "POST" };
