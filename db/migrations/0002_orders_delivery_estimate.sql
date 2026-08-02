ALTER TYPE "public"."order_status" ADD VALUE IF NOT EXISTS 'packed';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE IF NOT EXISTS 'ready_for_dispatch';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE IF NOT EXISTS 'out_for_delivery';--> statement-breakpoint
CREATE TYPE "public"."delivery_estimate" AS ENUM('same_day', 'next_day', 'within_2_days', 'within_3_5_days');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "deliveryEstimate" "delivery_estimate";--> statement-breakpoint
CREATE INDEX "order_delivery_estimate_idx" ON "orders" USING btree ("deliveryEstimate");--> statement-breakpoint
