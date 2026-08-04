CREATE TYPE "public"."addressType" AS ENUM('home', 'work', 'other');--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"mobileNumber" varchar(50) NOT NULL,
	"addressLine1" varchar(255) NOT NULL,
	"addressLine2" varchar(255),
	"landmark" varchar(255),
	"areaLocality" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postalCode" varchar(20) NOT NULL,
	"country" varchar(100) DEFAULT 'India' NOT NULL,
	"addressType" "addressType" DEFAULT 'home' NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shippingContactName" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shippingMobileNumber" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shippingLandmark" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shippingAreaLocality" varchar(255);--> statement-breakpoint
CREATE INDEX "user_address_user_idx" ON "user_addresses" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_address_default_idx" ON "user_addresses" USING btree ("isDefault");