ALTER TABLE "delivery_zones" ADD COLUMN "state" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "gst_configurations" ADD COLUMN "categoryId" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX "delivery_zone_state_idx" ON "delivery_zones" USING btree ("state");--> statement-breakpoint
CREATE INDEX "gst_config_category_idx" ON "gst_configurations" USING btree ("categoryId");--> statement-breakpoint
ALTER TABLE "delivery_zones" DROP COLUMN "areaName";--> statement-breakpoint
ALTER TABLE "delivery_zones" DROP COLUMN "postalCodes";