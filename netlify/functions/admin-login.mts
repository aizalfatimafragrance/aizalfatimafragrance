import type { Config } from "@netlify/functions";
import { checkPassword, issueToken, isAdmin } from "../lib/auth.js";

export default async (req: Request) => {
  if (req.method === "GET") return Response.json({ valid: isAdmin(req) });

  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || !checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }
  return Response.json({ token: issueToken() });
};

export const config: Config = { path: "/api/admin/login", method: ["GET", "POST"] };
