CREATE TYPE "public"."user_gender" AS ENUM('male', 'female', 'other', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."user_theme_preference" AS ENUM('system', 'light', 'dark');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dateOfBirth" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gender" "user_gender";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "addressLine1" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "state" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "postalCode" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "themePreference" "user_theme_preference" DEFAULT 'system' NOT NULL;--> statement-breakpoint
