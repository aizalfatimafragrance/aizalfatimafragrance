import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";
import { isAdmin, unauthorized } from "../lib/auth.js";
import { badRequest, getSettings, normalizePhone } from "../lib/util.js";

export default async (req: Request) => {
  if (!isAdmin(req)) return unauthorized();
  if (req.method === "GET") return Response.json(await getSettings());

  const body = await req.json().catch(() => ({}));
  const whatsapp = normalizePhone(body.whatsapp);
  const rewardStamps = Math.floor(Number(body.rewardStamps));
  const rewardPercent = Math.floor(Number(body.rewardPercent));
  if (!/^\d{10,15}$/.test(whatsapp)) return badRequest("Enter a valid WhatsApp number");
  if (!(rewardStamps >= 1 && rewardStamps <= 20)) return badRequest("Stamps per reward must be 1–20");
  if (!(rewardPercent >= 1 && rewardPercent <= 100)) return badRequest("Reward discount must be 1–100%");

  const rows = [
    { key: "whatsapp", value: whatsapp },
    { key: "reward_stamps", value: String(rewardStamps) },
    { key: "reward_percent", value: String(rewardPercent) },
  ];
  for (const row of rows) {
    await db.insert(settings).values(row).onConflictDoUpdate({ target: settings.key, set: { value: row.value } });
  }
  return Response.json(await getSettings());
};

export const config: Config = { path: "/api/admin/settings", method: ["GET", "PUT"] };
