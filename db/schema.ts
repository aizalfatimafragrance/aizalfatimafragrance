import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export type OrderItem = { productId: number; name: string; size: string; price: number; qty: number };

export const products = pgTable("products", {
  id: serial().primaryKey(),
  name: text().notNull(),
  category: text().notNull(), // spray | attar | booster | signature
  description: text().notNull().default(""),
  notes: text().notNull().default(""),
  size: text().notNull().default(""),
  price: integer().notNull(),
  image: text().notNull().default(""),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean().notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial().primaryKey(),
  code: text().notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text().notNull(),
  address: text().notNull(),
  city: text().notNull().default("Karachi"),
  notes: text().notNull().default(""),
  items: jsonb().$type<OrderItem[]>().notNull(),
  subtotal: integer().notNull(),
  discount: integer().notNull().default(0),
  total: integer().notNull(),
  rewardApplied: boolean("reward_applied").notNull().default(false),
  stampAwarded: boolean("stamp_awarded").notNull().default(false),
  status: text().notNull().default("Pending"), // Pending | Confirmed | Shipped | Delivered | Cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loyaltyCards = pgTable("loyalty_cards", {
  phone: text().primaryKey(),
  name: text().notNull().default(""),
  stamps: integer().notNull().default(0),
  rewardsRedeemed: integer("rewards_redeemed").notNull().default(0),
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpent: integer("total_spent").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  key: text().primaryKey(),
  value: text().notNull(),
});
