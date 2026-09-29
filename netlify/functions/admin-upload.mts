import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import { isAdmin, unauthorized } from "../lib/auth.js";
import { badRequest } from "../lib/util.js";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 4 * 1024 * 1024;

export default async (req: Request) => {
  if (!isAdmin(req)) return unauthorized();
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return badRequest("No image uploaded");
  if (!ALLOWED.includes(file.type)) return badRequest("Use a JPG, PNG or WebP image");
  if (file.size > MAX_BYTES) return badRequest("Image must be under 4MB");

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const key = `${randomUUID()}.${ext}`;
  await getStore({ name: "product-images", consistency: "strong" }).set(key, await file.arrayBuffer(), {
    metadata: { contentType: file.type },
  });
  return Response.json({ url: `/media/${key}` }, { status: 201 });
};

export const config: Config = { path: "/api/admin/upload", method: "POST" };
