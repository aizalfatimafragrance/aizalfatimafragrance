import type { Config, Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { isAdmin, unauthorized } from "../lib/auth.js";
import { badRequest, CATEGORIES, clean } from "../lib/util.js";

const parseProduct = (body: any, partial: boolean) => {
  const out: Partial<typeof products.$inferInsert> = {};
  if (!partial || body.name !== undefined) out.name = clean(body.name, 100);
  if (!partial || body.category !== undefined) out.category = clean(body.category, 20);
  if (body.description !== undefined) out.description = clean(body.description, 1000);
  if (body.notes !== undefined) out.notes = clean(body.notes, 200);
  if (body.size !== undefined) out.size = clean(body.size, 30);
  if (body.image !== undefined) out.image = clean(body.image, 500);
  if (!partial || body.price !== undefined) out.price = Math.round(Number(body.price));
  if (body.inStock !== undefined) out.inStock = Boolean(body.inStock);
  if (body.featured !== undefined) out.featured = Boolean(body.featured);

  if (out.name !== undefined && !out.name) return "Product name is required";
  if (out.category !== undefined && !(CATEGORIES as readonly string[]).includes(out.category)) return "Choose a valid category";
  if (out.price !== undefined && (!Number.isFinite(out.price) || out.price < 0)) return "Enter a valid price";
  return out;
};

export default async (req: Request, context: Context) => {
  if (!isAdmin(req)) return unauthorized();
  const id = Number(context.params.id);
  const body = req.method === "DELETE" ? {} : await req.json().catch(() => ({}));

  if (req.method === "POST") {
    const data = parseProduct(body, false);
    if (typeof data === "string") return badRequest(data);
    const [created] = await db.insert(products).values(data as typeof products.$inferInsert).returning();
    return Response.json(created, { status: 201 });
  }

  if (!Number.isInteger(id)) return badRequest("Missing product id");

  if (req.method === "PUT" || req.method === "PATCH") {
    const data = parseProduct(body, true);
    if (typeof data === "string") return badRequest(data);
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated ? Response.json(updated) : Response.json({ error: "Not found" }, { status: 404 });
  }

  if (req.method === "DELETE") {
    await db.delete(products).where(eq(products.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: ["/api/admin/products", "/api/admin/products/:id"] };
