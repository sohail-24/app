CREATE TYPE "public"."authProvider" AS ENUM('local', 'mobile');--> statement-breakpoint
CREATE TYPE "public"."company_type" AS ENUM('supplier', 'buyer', 'both');--> statement-breakpoint
CREATE TYPE "public"."customer_status" AS ENUM('active', 'inactive', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."delivery_estimate" AS ENUM('same_day', 'next_day', 'within_2_days', 'within_3_5_days');--> statement-breakpoint
CREATE TYPE "public"."gst_config_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('in_stock', 'low_stock', 'out_of_stock');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('generated');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'packed', 'ready_for_dispatch', 'out_for_delivery', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."purpose" AS ENUM('login');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('pending', 'authorized', 'paid', 'partially_paid', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."paymentTerms" AS ENUM('net_15', 'net_30', 'net_45', 'net_60', 'cod', 'prepaid');--> statement-breakpoint
CREATE TYPE "public"."grade" AS ENUM('premium', 'grade_a', 'grade_b', 'standard');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."shipping_method_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."unitType" AS ENUM('kg', 'lb', 'case', 'pallet', 'each', 'bunch', 'box', 'bag');--> statement-breakpoint
CREATE TYPE "public"."user_gender" AS ENUM('male', 'female', 'other', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_theme_preference" AS ENUM('system', 'light', 'dark');--> statement-breakpoint
CREATE TYPE "public"."warehouse_movement_type" AS ENUM('receive', 'dispatch');--> statement-breakpoint
CREATE TYPE "public"."warehouse_status" AS ENUM('active', 'inactive');--> statement-breakpoint
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
	"state" varchar(100) NOT NULL,
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
	"categoryId" bigint NOT NULL,
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
	"isActive" boolean DEFAULT true NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"invoiceId" bigint NOT NULL,
	"productName" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unitType" "unitType" NOT NULL,
	"unitPrice" numeric(12, 2) NOT NULL,
	"totalPrice" numeric(12, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"companyId" bigint NOT NULL,
	"orderId" bigint NOT NULL,
	"invoiceNumber" varchar(50) NOT NULL,
	"orderNumber" varchar(50) NOT NULL,
	"status" "invoice_status" DEFAULT 'generated' NOT NULL,
	"invoiceDate" timestamp DEFAULT now() NOT NULL,
	"companyName" varchar(255) NOT NULL,
	"companyPhone" varchar(50),
	"companyAddress" text,
	"customerName" varchar(255) NOT NULL,
	"customerPhone" varchar(50),
	"billingAddress" text,
	"subtotal" numeric(12, 2) NOT NULL,
	"taxAmount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"shippingAmount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"gstRate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"gstin" varchar(20),
	"totalAmount" numeric(12, 2) NOT NULL,
	"archivedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_orderId_unique" UNIQUE("orderId"),
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
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
	"deliveryEstimate" "delivery_estimate",
	"estimatedDeliveryDate" timestamp,
	"actualDeliveryDate" timestamp,
	"warehouseId" bigint,
	"deliveryZoneId" bigint,
	"shippingMethodId" bigint,
	"gstConfigId" bigint,
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
	"marketplaceVisible" boolean DEFAULT true NOT NULL,
	"showInFreshDeals" boolean DEFAULT false NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"displayPriority" integer,
	"metaTitle" varchar(255),
	"metaDescription" text,
	"tags" text,
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
	"dateOfBirth" timestamp,
	"gender" "user_gender",
	"addressLine1" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100),
	"postalCode" varchar(20),
	"themePreference" "user_theme_preference" DEFAULT 'system' NOT NULL,
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
CREATE TABLE "warehouses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"companyId" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(80),
	"description" text,
	"address" text NOT NULL,
	"city" varchar(100),
	"state" varchar(100),
	"postalCode" varchar(20),
	"country" varchar(100) DEFAULT 'India',
	"capacityUnits" integer DEFAULT 0 NOT NULL,
	"usedCapacityUnits" integer DEFAULT 0 NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"contactPerson" varchar(255),
	"contactNumber" varchar(50),
	"status" "warehouse_status" DEFAULT 'active' NOT NULL,
	"archivedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
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
CREATE INDEX "customer_owner_idx" ON "customers" USING btree ("ownerCompanyId");--> statement-breakpoint
CREATE INDEX "customer_buyer_company_idx" ON "customers" USING btree ("buyerCompanyId");--> statement-breakpoint
CREATE INDEX "customer_status_idx" ON "customers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "customer_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customer_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "delivery_zone_company_idx" ON "delivery_zones" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "delivery_zone_warehouse_idx" ON "delivery_zones" USING btree ("warehouseId");--> statement-breakpoint
CREATE INDEX "delivery_zone_state_idx" ON "delivery_zones" USING btree ("state");--> statement-breakpoint
CREATE INDEX "delivery_zone_active_idx" ON "delivery_zones" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "gst_config_company_idx" ON "gst_configurations" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "gst_config_category_idx" ON "gst_configurations" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "gst_config_status_idx" ON "gst_configurations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gst_config_default_idx" ON "gst_configurations" USING btree ("isDefault");--> statement-breakpoint
CREATE INDEX "inventory_product_idx" ON "inventory" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "inventory_supplier_idx" ON "inventory" USING btree ("supplierId");--> statement-breakpoint
CREATE INDEX "inventory_status_idx" ON "inventory" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inventory_batch_idx" ON "inventory" USING btree ("batchNumber");--> statement-breakpoint
CREATE INDEX "inventory_product_supplier_idx" ON "inventory" USING btree ("productId","supplierId");--> statement-breakpoint
CREATE INDEX "invoice_item_invoice_idx" ON "invoice_items" USING btree ("invoiceId");--> statement-breakpoint
CREATE INDEX "invoice_company_idx" ON "invoices" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "invoice_order_idx" ON "invoices" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "invoice_number_idx" ON "invoices" USING btree ("invoiceNumber");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoice_date_idx" ON "invoices" USING btree ("invoiceDate");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "order_items" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "order_item_product_idx" ON "order_items" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "order_number_idx" ON "orders" USING btree ("orderNumber");--> statement-breakpoint
CREATE INDEX "order_buyer_idx" ON "orders" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX "order_supplier_idx" ON "orders" USING btree ("supplierId");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_delivery_estimate_idx" ON "orders" USING btree ("deliveryEstimate");--> statement-breakpoint
CREATE INDEX "order_warehouse_idx" ON "orders" USING btree ("warehouseId");--> statement-breakpoint
CREATE INDEX "order_delivery_zone_idx" ON "orders" USING btree ("deliveryZoneId");--> statement-breakpoint
CREATE INDEX "order_shipping_method_idx" ON "orders" USING btree ("shippingMethodId");--> statement-breakpoint
CREATE INDEX "order_gst_config_idx" ON "orders" USING btree ("gstConfigId");--> statement-breakpoint
CREATE INDEX "order_payment_idx" ON "orders" USING btree ("paymentStatus");--> statement-breakpoint
CREATE INDEX "order_date_idx" ON "orders" USING btree ("orderedAt");--> statement-breakpoint
CREATE INDEX "order_placed_by_idx" ON "orders" USING btree ("placedByUserId");--> statement-breakpoint
CREATE INDEX "otp_mobile_idx" ON "otp_verifications" USING btree ("mobileNumber");--> statement-breakpoint
CREATE INDEX "otp_expires_idx" ON "otp_verifications" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "product_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_category_idx" ON "products" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "product_supplier_idx" ON "products" USING btree ("supplierId");--> statement-breakpoint
CREATE INDEX "product_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_marketplace_visible_idx" ON "products" USING btree ("marketplaceVisible");--> statement-breakpoint
CREATE INDEX "product_fresh_deals_idx" ON "products" USING btree ("showInFreshDeals");--> statement-breakpoint
CREATE INDEX "product_featured_idx" ON "products" USING btree ("isFeatured");--> statement-breakpoint
CREATE INDEX "product_display_priority_idx" ON "products" USING btree ("displayPriority");--> statement-breakpoint
CREATE INDEX "product_price_idx" ON "products" USING btree ("unitPrice");--> statement-breakpoint
CREATE INDEX "product_organic_idx" ON "products" USING btree ("organic");--> statement-breakpoint
CREATE INDEX "product_grade_idx" ON "products" USING btree ("grade");--> statement-breakpoint
CREATE INDEX "product_name_idx" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "shipping_method_company_idx" ON "shipping_methods" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "shipping_method_warehouse_idx" ON "shipping_methods" USING btree ("warehouseId");--> statement-breakpoint
CREATE INDEX "shipping_method_delivery_zone_idx" ON "shipping_methods" USING btree ("deliveryZoneId");--> statement-breakpoint
CREATE INDEX "shipping_method_status_idx" ON "shipping_methods" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shipping_method_default_idx" ON "shipping_methods" USING btree ("isDefault");--> statement-breakpoint
CREATE INDEX "user_company_idx" ON "users" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "warehouse_movement_warehouse_idx" ON "warehouse_stock_movements" USING btree ("warehouseId");--> statement-breakpoint
CREATE INDEX "warehouse_movement_company_idx" ON "warehouse_stock_movements" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "warehouse_movement_product_idx" ON "warehouse_stock_movements" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "warehouse_movement_type_idx" ON "warehouse_stock_movements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "warehouse_movement_created_at_idx" ON "warehouse_stock_movements" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "warehouse_company_idx" ON "warehouses" USING btree ("companyId");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_code_idx" ON "warehouses" USING btree ("code");--> statement-breakpoint
CREATE INDEX "warehouse_status_idx" ON "warehouses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "warehouse_default_idx" ON "warehouses" USING btree ("isDefault");