CREATE TYPE "public"."invoice_status" AS ENUM('generated');--> statement-breakpoint
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
	"totalAmount" numeric(12, 2) NOT NULL,
	"archivedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_orderId_unique" UNIQUE("orderId"),
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"invoiceId" bigint NOT NULL,
	"productName" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unitType" "unitType" NOT NULL,
	"unitPrice" numeric(12, 2) NOT NULL,
	"totalPrice" numeric(12, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "invoice_company_idx" ON "invoices" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "invoice_order_idx" ON "invoices" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "invoice_number_idx" ON "invoices" USING btree ("invoiceNumber");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoice_date_idx" ON "invoices" USING btree ("invoiceDate");--> statement-breakpoint
CREATE INDEX "invoice_item_invoice_idx" ON "invoice_items" USING btree ("invoiceId");--> statement-breakpoint
