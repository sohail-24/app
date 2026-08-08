CREATE TYPE "public"."paymentMethod" AS ENUM('upi', 'cod');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paymentMethod" "paymentMethod" DEFAULT 'cod' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "razorpayOrderId" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "razorpayPaymentId" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "razorpaySignature" varchar(255);