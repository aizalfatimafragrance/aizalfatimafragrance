# Aizal Fatima Fragrance

Luxury perfume storefront and admin dashboard for Aizal Fatima Fragrance (AF), Bihar Colony, Lyari, Karachi.

## Features
- Dark and gold storefront with category filters (Spray Perfumes, Attars, Booster Blends, Signature Impressions), search, and product details
- Shopping bag with "Order via WhatsApp" checkout: the order is saved and a formatted WhatsApp message opens with all the details
- Digital loyalty stamp card tied to the customer's phone number. Customers get one stamp for each delivered order and can redeem a reward at checkout
- Password-locked admin panel with a sales overview, order status management, product add/edit/delete, stock toggles, image uploads, and store settings

## Tech
- `public/index.html`: a single-file frontend (Tailwind CDN + Lucide icons)
- Netlify Functions (`netlify/functions`) for the API
- Netlify Database (Postgres + Drizzle ORM) for products, orders, loyalty cards, and settings
- Netlify Blobs for uploaded product images, Netlify Image CDN for optimised delivery

## Run locally
```
npm install
netlify dev --port 8889
```

## Configuration
- `ADMIN_PASSWORD`: admin dashboard password. If you don't set it, the default is `af_admin123`, so change it before going live.
- `ADMIN_SECRET` (optional): key used to sign admin sessions.
- The WhatsApp number and loyalty rules are edited in Admin → Settings. The number is a placeholder at first.
