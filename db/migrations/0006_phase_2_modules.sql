CREATE TYPE "public"."customer_status" AS ENUM('active', 'inactive', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."gst_config_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."shipping_method_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ownerCompanyId" bigint NOT NULL,
	"buyerCompanyId" bigint,
	"name" varchar(255) NOT NULL,
	"contactName" varchar(255),
	"email" varchar(320),
	"phone" varchar(50),
	"status" "customer_status" DEFAULT 'active' NOT NULL,
	"addressLine1" varchar(255),
	"addressLine2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postalCode" varchar(20),
	"country" varchar(100) DEFAULT 'India',
	"taxId" varchar(100),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_zones" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"companyId" bigint NOT NULL,
	"warehouseId" bigint,
	"name" varchar(255) NOT NULL,
	"areaName" varchar(255),
	"postalCodes" text NOT NULL,
	"deliveryEstimate" "delivery_estimate" DEFAULT 'next_day' NOT NULL,
	"deliveryFee" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"minimumOrderAmount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gst_configurations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"companyId" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"gstin" varchar(20),
	"hsnCode" varchar(20),
	"rate" numeric(5, 2) NOT NULL,
	"status" "gst_config_status" DEFAULT 'active' NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_methods" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"companyId" bigint NOT NULL,
	"warehouseId" bigint,
	"deliveryZoneId" bigint,
	"name" varchar(255) NOT NULL,
	"code" varchar(80),
	"description" text,
	"charge" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"freeShippingThreshold" numeric(12, 2),
	"deliveryEstimate" "delivery_estimate" DEFAULT 'next_day' NOT NULL,
	"status" "shipping_method_status" DEFAULT 'active' NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "warehouseId" bigint;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "deliveryZoneId" bigint;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shippingMethodId" bigint;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "gstConfigId" bigint;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "taxAmount" numeric(12, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "shippingAmount" numeric(12, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "gstRate" numeric(5, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "gstin" varchar(20);--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "state" varchar(100);--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "postalCode" varchar(20);--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "country" varchar(100) DEFAULT 'India';--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "capacityUnits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "usedCapacityUnits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "isDefault" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS "warehouse_company_idx";--> statement-breakpoint
CREATE INDEX "warehouse_company_idx" ON "warehouses" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "customer_owner_idx" ON "customers" USING btree ("ownerCompanyId");--> statement-breakpoint
CREATE INDEX "customer_buyer_company_idx" ON "customers" USING btree ("buyerCompanyId");--> statement-breakpoint
CREATE INDEX "customer_status_idx" ON "customers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "customer_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customer_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "order_warehouse_idx" ON "orders" USING btree ("warehouseId");--> statement-breakpoint
CREATE INDEX "order_delivery_zone_idx" ON "orders" USING btree ("deliveryZoneId");--> statement-breakpoint
CREATE INDEX "order_shipping_method_idx" ON "orders" USING btree ("shippingMethodId");--> statement-breakpoint
CREATE INDEX "order_gst_config_idx" ON "orders" USING btree ("gstConfigId");--> statement-breakpoint
CREATE INDEX "warehouse_default_idx" ON "warehouses" USING btree ("isDefault");--> statement-breakpoint
CREATE INDEX "delivery_zone_company_idx" ON "delivery_zones" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "delivery_zone_warehouse_idx" ON "delivery_zones" USING btree ("warehouseId");--> statement-breakpoint
CREATE INDEX "delivery_zone_active_idx" ON "delivery_zones" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "gst_config_company_idx" ON "gst_configurations" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "gst_config_status_idx" ON "gst_configurations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gst_config_default_idx" ON "gst_configurations" USING btree ("isDefault");--> statement-breakpoint
CREATE INDEX "shipping_method_company_idx" ON "shipping_methods" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "shipping_method_warehouse_idx" ON "shipping_methods" USING btree ("warehouseId");--> statement-breakpoint
CREATE INDEX "shipping_method_delivery_zone_idx" ON "shipping_methods" USING btree ("deliveryZoneId");--> statement-breakpoint
CREATE INDEX "shipping_method_status_idx" ON "shipping_methods" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shipping_method_default_idx" ON "shipping_methods" USING btree ("isDefault");
