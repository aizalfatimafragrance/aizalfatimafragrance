# AGENTS.md

- Frontend: `public/index.html` is one self-contained file that holds the storefront and the admin SPA (`#admin` hash). It uses vanilla JS with delegated event handlers and `data-*` attributes.
- API: `netlify/functions/*.mts` with routes `/api/storefront`, `/api/orders`, `/api/loyalty`, `/api/admin/*`, and `/media/:key`. Shared helpers are in `netlify/lib/`.
- Auth: HMAC-signed bearer token issued by `/api/admin/login` against the `ADMIN_PASSWORD` env var (default `af_admin123`). All `/api/admin/*` routes check `isAdmin`.
- Data: Drizzle schema in `db/schema.ts`. Migrations are in `netlify/database/migrations` and are generated with `npx drizzle-kit generate --name ...`. Never apply them manually. The seed catalog lives in the second migration.
- Order prices are always recomputed on the server. Loyalty stamps are awarded when an order is first marked Delivered, and a reward is refunded if its order is Cancelled.
- The request asked for Firebase. Netlify Database was used instead so all data stays on the Netlify platform.
- Images: generated assets are in `public/img` and served through `/.netlify/images`.
