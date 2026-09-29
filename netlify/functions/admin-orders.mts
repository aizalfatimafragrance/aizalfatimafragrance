import type { Config, Context } from "@netlify/functions";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { loyaltyCards, orders } from "../../db/schema.js";
import { isAdmin, unauthorized } from "../lib/auth.js";
import { badRequest, getSettings, ORDER_STATUSES } from "../lib/util.js";

export default async (req: Request, context: Context) => {
  if (!isAdmin(req)) return unauthorized();

  if (req.method === "GET") {
    const list = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500);
    return Response.json(list);
  }

  if (req.method === "PATCH") {
    const id = Number(context.params.id);
    const { status } = await req.json().catch(() => ({}));
    if (!Number.isInteger(id)) return badRequest("Missing order id");
    if (!(ORDER_STATUSES as readonly string[]).includes(status)) return badRequest("Invalid status");

    const [existing] = await db.select().from(orders).where(eq(orders.id, id));
    if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

    const patch: Partial<typeof orders.$inferInsert> = { status };

    // The first time an order is delivered, the customer earns a stamp and the sale counts toward their card.
    if (status === "Delivered" && !existing.stampAwarded) {
      patch.stampAwarded = true;
      await db
        .update(loyaltyCards)
        .set({
          stamps: sql`${loyaltyCards.stamps} + 1`,
          totalSpent: sql`${loyaltyCards.totalSpent} + ${existing.total}`,
          updatedAt: new Date(),
        })
        .where(eq(loyaltyCards.phone, existing.phone));
    }

    // Cancelling an order gives back any reward that was spent on it.
    if (status === "Cancelled" && existing.status !== "Cancelled" && existing.rewardApplied) {
      const { rewardStamps } = await getSettings();
      patch.rewardApplied = false;
      await db
        .update(loyaltyCards)
        .set({
          stamps: sql`${loyaltyCards.stamps} + ${rewardStamps}`,
          rewardsRedeemed: sql`greatest(${loyaltyCards.rewardsRedeemed} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(loyaltyCards.phone, existing.phone));
    }

    const [updated] = await db.update(orders).set(patch).where(eq(orders.id, id)).returning();
    return Response.json(updated);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: ["/api/admin/orders", "/api/admin/orders/:id"] };
