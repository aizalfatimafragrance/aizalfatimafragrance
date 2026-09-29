import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Serves product images uploaded from the admin panel.
export default async (_req: Request, context: Context) => {
  const entry = await getStore("product-images").getWithMetadata(context.params.key, { type: "arrayBuffer" });
  if (!entry) return new Response("Not found", { status: 404 });
  return new Response(entry.data, {
    headers: {
      "content-type": String(entry.metadata.contentType || "image/jpeg"),
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};

export const config: Config = { path: "/media/:key", method: "GET" };
