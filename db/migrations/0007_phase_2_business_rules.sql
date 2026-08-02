ALTER TABLE "delivery_zones" ADD COLUMN "state" varchar(100);--> statement-breakpoint
UPDATE "delivery_zones"
SET "state" = coalesce(nullif("areaName", ''), "name", 'State')
WHERE "state" IS NULL;--> statement-breakpoint
ALTER TABLE "delivery_zones" ALTER COLUMN "state" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_zones" DROP COLUMN IF EXISTS "areaName";--> statement-breakpoint
ALTER TABLE "delivery_zones" DROP COLUMN IF EXISTS "postalCodes";--> statement-breakpoint
CREATE INDEX "delivery_zone_state_idx" ON "delivery_zones" USING btree ("state");--> statement-breakpoint
ALTER TABLE "gst_configurations" ADD COLUMN "categoryId" bigint;--> statement-breakpoint
UPDATE "gst_configurations"
SET "categoryId" = (
	SELECT "id" FROM "categories" ORDER BY "id" LIMIT 1
)
WHERE "categoryId" IS NULL;--> statement-breakpoint
ALTER TABLE "gst_configurations" ALTER COLUMN "categoryId" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "gst_config_category_idx" ON "gst_configurations" USING btree ("categoryId");
