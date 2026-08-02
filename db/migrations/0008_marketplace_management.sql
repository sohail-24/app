ALTER TABLE "products" ADD COLUMN "marketplaceVisible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "showInFreshDeals" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "isFeatured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "displayPriority" integer;--> statement-breakpoint
CREATE INDEX "product_marketplace_visible_idx" ON "products" USING btree ("marketplaceVisible");--> statement-breakpoint
CREATE INDEX "product_fresh_deals_idx" ON "products" USING btree ("showInFreshDeals");--> statement-breakpoint
CREATE INDEX "product_featured_idx" ON "products" USING btree ("isFeatured");--> statement-breakpoint
CREATE INDEX "product_display_priority_idx" ON "products" USING btree ("displayPriority");
