CREATE TYPE "public"."authProvider" AS ENUM('local', 'mobile');--> statement-breakpoint
CREATE TYPE "public"."company_type" AS ENUM('supplier', 'buyer', 'both');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('in_stock', 'low_stock', 'out_of_stock');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."purpose" AS ENUM('login');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('pending', 'authorized', 'paid', 'partially_paid', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."paymentTerms" AS ENUM('net_15', 'net_30', 'net_45', 'net_60', 'cod', 'prepaid');--> statement-breakpoint
CREATE TYPE "public"."grade" AS ENUM('premium', 'grade_a', 'grade_b', 'standard');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."unitType" AS ENUM('kg', 'lb', 'case', 'pallet', 'each', 'bunch', 'box', 'bag');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"productId" bigint NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(12, 2) NOT NULL,
	"notes" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"color" varchar(7),
	"parentId" bigint,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"type" "company_type" DEFAULT 'buyer' NOT NULL,
	"description" text,
	"logo" text,
	"website" varchar(255),
	"email" varchar(320),
	"phone" varchar(50),
	"addressLine1" varchar(255),
	"addressLine2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postalCode" varchar(20),
	"country" varchar(100),
	"taxId" varchar(100),
	"businessLicense" varchar(255),
	"isVerified" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"minimumOrderAmount" numeric(12, 2) DEFAULT '0.00',
	"paymentTerms" "paymentTerms" DEFAULT 'net_30',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"productId" bigint NOT NULL,
	"supplierId" bigint NOT NULL,
	"quantityOnHand" integer DEFAULT 0 NOT NULL,
	"quantityReserved" integer DEFAULT 0 NOT NULL,
	"quantityAvailable" integer DEFAULT 0 NOT NULL,
	"reorderLevel" integer DEFAULT 10 NOT NULL,
	"reorderQuantity" integer DEFAULT 100 NOT NULL,
	"warehouseLocation" varchar(100),
	"batchNumber" varchar(100),
	"expiryDate" timestamp,
	"receivedDate" timestamp,
	"lastCountedAt" timestamp,
	"status" "inventory_status" DEFAULT 'in_stock' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"orderId" bigint NOT NULL,
	"productId" bigint NOT NULL,
	"productName" varchar(255) NOT NULL,
	"productImage" text,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(12, 2) NOT NULL,
	"totalPrice" numeric(12, 2) NOT NULL,
	"unitType" "unitType" NOT NULL,
	"notes" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"orderNumber" varchar(50) NOT NULL,
	"buyerId" bigint NOT NULL,
	"supplierId" bigint NOT NULL,
	"placedByUserId" bigint NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"taxAmount" numeric(12, 2) DEFAULT '0.00',
	"shippingAmount" numeric(12, 2) DEFAULT '0.00',
	"discountAmount" numeric(12, 2) DEFAULT '0.00',
	"totalAmount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"paymentStatus" "paymentStatus" DEFAULT 'pending' NOT NULL,
	"shippingAddressLine1" varchar(255),
	"shippingAddressLine2" varchar(255),
	"shippingCity" varchar(100),
	"shippingState" varchar(100),
	"shippingPostalCode" varchar(20),
	"shippingCountry" varchar(100),
	"shippingMethod" varchar(100),
	"trackingNumber" varchar(100),
	"estimatedDeliveryDate" timestamp,
	"actualDeliveryDate" timestamp,
	"orderedAt" timestamp DEFAULT now() NOT NULL,
	"confirmedAt" timestamp,
	"shippedAt" timestamp,
	"deliveredAt" timestamp,
	"cancelledAt" timestamp,
	"buyerNotes" text,
	"sellerNotes" text,
	"internalNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"mobileNumber" varchar(20) NOT NULL,
	"codeHash" text NOT NULL,
	"purpose" "purpose" DEFAULT 'login' NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"consumedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"shortDescription" varchar(500),
	"categoryId" bigint NOT NULL,
	"supplierId" bigint NOT NULL,
	"unitPrice" numeric(12, 2) NOT NULL,
	"compareAtPrice" numeric(12, 2) DEFAULT '0.00',
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"unitType" "unitType" NOT NULL,
	"unitSize" varchar(50),
	"minimumOrderQuantity" integer DEFAULT 1 NOT NULL,
	"image" text,
	"images" text,
	"origin" varchar(100),
	"season" varchar(100),
	"grade" "grade" DEFAULT 'grade_a' NOT NULL,
	"organic" boolean DEFAULT false NOT NULL,
	"certifications" text,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"metaTitle" varchar(255),
	"metaDescription" text,
	"tags" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"unionId" varchar(255) NOT NULL,
	"authProvider" "authProvider" DEFAULT 'local' NOT NULL,
	"name" varchar(255),
	"email" varchar(320),
	"passwordHash" text,
	"refreshTokenHash" text,
	"avatar" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"companyId" bigint,
	"phone" varchar(50),
	"mobileVerifiedAt" timestamp,
	"emailVerifiedAt" timestamp,
	"jobTitle" varchar(100),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignInAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_unionId_unique" UNIQUE("unionId")
);
--> statement-breakpoint
CREATE INDEX "cart_user_idx" ON "cart_items" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "cart_product_idx" ON "cart_items" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "cart_user_product_idx" ON "cart_items" USING btree ("userId","productId");--> statement-breakpoint
CREATE INDEX "category_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "category_parent_idx" ON "categories" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "category_active_idx" ON "categories" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "company_type_idx" ON "companies" USING btree ("type");--> statement-breakpoint
CREATE INDEX "company_slug_idx" ON "companies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "company_verified_idx" ON "companies" USING btree ("isVerified");--> statement-breakpoint
CREATE INDEX "inventory_product_idx" ON "inventory" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "inventory_supplier_idx" ON "inventory" USING btree ("supplierId");--> statement-breakpoint
CREATE INDEX "inventory_status_idx" ON "inventory" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inventory_batch_idx" ON "inventory" USING btree ("batchNumber");--> statement-breakpoint
CREATE INDEX "inventory_product_supplier_idx" ON "inventory" USING btree ("productId","supplierId");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "order_items" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "order_item_product_idx" ON "order_items" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "order_number_idx" ON "orders" USING btree ("orderNumber");--> statement-breakpoint
CREATE INDEX "order_buyer_idx" ON "orders" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX "order_supplier_idx" ON "orders" USING btree ("supplierId");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_payment_idx" ON "orders" USING btree ("paymentStatus");--> statement-breakpoint
CREATE INDEX "order_date_idx" ON "orders" USING btree ("orderedAt");--> statement-breakpoint
CREATE INDEX "order_placed_by_idx" ON "orders" USING btree ("placedByUserId");--> statement-breakpoint
CREATE INDEX "otp_mobile_idx" ON "otp_verifications" USING btree ("mobileNumber");--> statement-breakpoint
CREATE INDEX "otp_expires_idx" ON "otp_verifications" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "product_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_category_idx" ON "products" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "product_supplier_idx" ON "products" USING btree ("supplierId");--> statement-breakpoint
CREATE INDEX "product_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_price_idx" ON "products" USING btree ("unitPrice");--> statement-breakpoint
CREATE INDEX "product_organic_idx" ON "products" USING btree ("organic");--> statement-breakpoint
CREATE INDEX "product_grade_idx" ON "products" USING btree ("grade");--> statement-breakpoint
CREATE INDEX "product_name_idx" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_company_idx" ON "users" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_phone_idx" ON "users" USING btree ("phone");