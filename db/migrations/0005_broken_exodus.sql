CREATE TYPE "public"."delivery_estimate" AS ENUM('same_day', 'next_day', 'within_2_days', 'within_3_5_days');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('generated');--> statement-breakpoint
CREATE TYPE "public"."user_gender" AS ENUM('male', 'female', 'other', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."user_theme_preference" AS ENUM('system', 'light', 'dark');--> statement-breakpoint
CREATE TYPE "public"."warehouse_movement_type" AS ENUM('receive', 'dispatch');--> statement-breakpoint
CREATE TYPE "public"."warehouse_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"invoiceId" bigint NOT NULL,
	"productName" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unitType" "unitType" NOT NULL,
	"unitPrice" numeric(12, 2) NOT NULL,
	"totalPrice" numeric(12, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"companyId" bigint NOT NULL,
	"orderId" bigint NOT NULL,
	"invoiceNumber" varchar(50) NOT NULL,
	"orderNumber" varchar(50) NOT NULL,
	"status" "invoice_status" DEFAULT 'generated' NOT NULL,
	"invoiceDate" timestamp DEFAULT now() NOT NULL,
	"companyName" varchar(255) NOT NULL,
	"companyPhone" varchar(50),
	"companyAddress" text,
	"customerName" varchar(255) NOT NULL,
	"customerPhone" varchar(50),
	"billingAddress" text,
	"subtotal" numeric(12, 2) NOT NULL,
	"totalAmount" numeric(12, 2) NOT NULL,
	"archivedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_orderId_unique" UNIQUE("orderId"),
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);
--> statement-breakpoint
CREATE TABLE "warehouse_stock_movements" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"warehouseId" bigint NOT NULL,
	"companyId" bigint NOT NULL,
	"productId" bigint NOT NULL,
	"inventoryId" bigint NOT NULL,
	"type" "warehouse_movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"supplierName" varchar(255),
	"orderId" bigint,
	"reference" varchar(120),
	"notes" text,
	"performedByUserId" bigint NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"companyId" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(80),
	"description" text,
	"address" text NOT NULL,
	"contactPerson" varchar(255),
	"contactNumber" varchar(50),
	"status" "warehouse_status" DEFAULT 'active' NOT NULL,
	"archivedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'packed', 'ready_for_dispatch', 'out_for_delivery', 'delivered', 'cancelled');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "deliveryEstimate" "delivery_estimate";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dateOfBirth" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gender" "user_gender";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "addressLine1" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "state" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "postalCode" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "themePreference" "user_theme_preference" DEFAULT 'system' NOT NULL;--> statement-breakpoint
CREATE INDEX "invoice_item_invoice_idx" ON "invoice_items" USING btree ("invoiceId");--> statement-breakpoint
CREATE INDEX "invoice_company_idx" ON "invoices" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "invoice_order_idx" ON "invoices" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "invoice_number_idx" ON "invoices" USING btree ("invoiceNumber");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoice_date_idx" ON "invoices" USING btree ("invoiceDate");--> statement-breakpoint
CREATE INDEX "warehouse_movement_warehouse_idx" ON "warehouse_stock_movements" USING btree ("warehouseId");--> statement-breakpoint
CREATE INDEX "warehouse_movement_company_idx" ON "warehouse_stock_movements" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "warehouse_movement_product_idx" ON "warehouse_stock_movements" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "warehouse_movement_type_idx" ON "warehouse_stock_movements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "warehouse_movement_created_at_idx" ON "warehouse_stock_movements" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_company_idx" ON "warehouses" USING btree ("companyId");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_code_idx" ON "warehouses" USING btree ("code");--> statement-breakpoint
CREATE INDEX "warehouse_status_idx" ON "warehouses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_delivery_estimate_idx" ON "orders" USING btree ("deliveryEstimate");