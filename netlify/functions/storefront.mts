import type { Config } from "@netlify/functions";
import { asc, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { getSettings } from "../lib/util.js";

// Public catalog + store settings in one request so the storefront renders with a single round-trip.
export default async () => {
  const [list, s] = await Promise.all([
    db.select().from(products).orderBy(desc(products.featured), asc(products.id)),
    getSettings(),
  ]);
  return Response.json(
    { products: list, settings: s },
    { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
  );
};

export const config: Config = { path: "/api/storefront", method: "GET" };
