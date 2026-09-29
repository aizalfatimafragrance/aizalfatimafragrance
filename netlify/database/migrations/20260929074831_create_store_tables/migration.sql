CREATE TABLE "loyalty_cards" (
	"phone" text PRIMARY KEY,
	"name" text DEFAULT '' NOT NULL,
	"stamps" integer DEFAULT 0 NOT NULL,
	"rewards_redeemed" integer DEFAULT 0 NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"city" text DEFAULT 'Karachi' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"items" jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"reward_applied" boolean DEFAULT false NOT NULL,
	"stamp_awarded" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"size" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL
);
