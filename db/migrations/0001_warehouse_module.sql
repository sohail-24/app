CREATE TYPE "public"."warehouse_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."warehouse_movement_type" AS ENUM('receive', 'dispatch');--> statement-breakpoint
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
CREATE UNIQUE INDEX "warehouse_company_idx" ON "warehouses" USING btree ("companyId");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_code_idx" ON "warehouses" USING btree ("code");--> statement-breakpoint
CREATE INDEX "warehouse_status_idx" ON "warehouses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "warehouse_movement_warehouse_idx" ON "warehouse_stock_movements" USING btree ("warehouseId");--> statement-breakpoint
CREATE INDEX "warehouse_movement_company_idx" ON "warehouse_stock_movements" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "warehouse_movement_product_idx" ON "warehouse_stock_movements" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "warehouse_movement_type_idx" ON "warehouse_stock_movements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "warehouse_movement_created_at_idx" ON "warehouse_stock_movements" USING btree ("createdAt");
