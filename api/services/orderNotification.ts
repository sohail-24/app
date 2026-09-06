import { inArray } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { products } from "../../db/schema";
import { findOrderWithDetails } from "../queries/orders";
import { sendEmail } from "./emailService";
import { env } from "../lib/env";
import { BUSINESS_OWNER_EMAIL } from "@contracts/roles";

// In-memory idempotency guard against duplicate email notifications for the same order
const notifiedOrderIds = new Set<number>();

export interface OrderNotificationOptions {
  appUrl?: string;
  force?: boolean;
}

export interface OrderNotificationResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
  orderNumber?: string;
  recipient?: string;
}

function formatPrice(amount: string | number | null | undefined, currency = "INR"): string {
  const num = typeof amount === "number" ? amount : parseFloat(amount?.toString() ?? "0");
  const prefix = currency === "INR" || currency === "₹" ? "₹" : "$";
  return `${prefix}${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAddress(order: {
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingLandmark?: string | null;
  shippingAreaLocality?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  buyerAddressLine1?: string | null;
  buyerAddressLine2?: string | null;
  buyerCity?: string | null;
  buyerState?: string | null;
  buyerPostalCode?: string | null;
  buyerCountry?: string | null;
}): string {
  const parts: string[] = [];
  if (order.shippingAddressLine1) parts.push(order.shippingAddressLine1.trim());
  if (order.shippingAddressLine2) parts.push(order.shippingAddressLine2.trim());
  if (order.shippingLandmark) {
    const landmark = order.shippingLandmark.trim();
    parts.push(landmark.toLowerCase().startsWith("near") ? landmark : `Near ${landmark}`);
  }
  if (order.shippingAreaLocality) parts.push(order.shippingAreaLocality.trim());

  const cityStateZip = [
    order.shippingCity?.trim(),
    order.shippingState?.trim(),
    order.shippingPostalCode?.trim(),
  ]
    .filter(Boolean)
    .join(", ");
  if (cityStateZip) parts.push(cityStateZip);

  if (order.shippingCountry?.trim()) {
    parts.push(order.shippingCountry.trim());
  }

  if (parts.length > 0) {
    return parts.join(", ");
  }

  // Fallback to buyer account address
  const fallbackParts: string[] = [];
  if (order.buyerAddressLine1) fallbackParts.push(order.buyerAddressLine1.trim());
  if (order.buyerAddressLine2) fallbackParts.push(order.buyerAddressLine2.trim());
  const fallbackCity = [order.buyerCity?.trim(), order.buyerState?.trim(), order.buyerPostalCode?.trim()]
    .filter(Boolean)
    .join(", ");
  if (fallbackCity) fallbackParts.push(fallbackCity);
  if (order.buyerCountry?.trim()) fallbackParts.push(order.buyerCountry.trim());

  return fallbackParts.length > 0 ? fallbackParts.join(", ") : "Address not provided";
}

/**
 * Triggers the Admin New Order Email Notification after an order has been successfully
 * persisted and verified on the server.
 *
 * This function NEVER throws an error, ensuring email failures never break the buyer's order flow.
 */
export async function notifyAdminNewOrder(
  orderId: number,
  options?: OrderNotificationOptions
): Promise<OrderNotificationResult> {
  // Idempotency check to prevent duplicate email sends
  if (!options?.force && notifiedOrderIds.has(orderId)) {
    console.log(`[AdminOrderNotifier] Order #${orderId} already notified. Skipping duplicate.`);
    return { success: true, skipped: true };
  }

  try {
    const order = await findOrderWithDetails(orderId);
    if (!order) {
      console.warn(`[AdminOrderNotifier] Cannot send notification: Order #${orderId} not found.`);
      return { success: false, error: "Order not found" };
    }

    // Retrieve configured Admin recipient
    const recipient =
      process.env.ADMIN_ORDER_EMAIL?.trim() ||
      env.adminOrderEmail?.trim() ||
      env.ownerEmail?.trim() ||
      BUSINESS_OWNER_EMAIL;

    if (!recipient) {
      console.warn("[AdminOrderNotifier] No admin order notification email configured.");
      return { success: false, error: "No recipient configured" };
    }

    // Fetch product unitSize snapshots from products table for items in the order
    const productIds = order.items.map((i) => i.productId).filter(Boolean);
    const productSizeMap = new Map<number, string | null>();
    if (productIds.length > 0) {
      try {
        const db = getDb();
        const prods = await db
          .select({ id: products.id, unitSize: products.unitSize })
          .from(products)
          .where(inArray(products.id, productIds));
        for (const p of prods) {
          if (p.unitSize) {
            productSizeMap.set(p.id, p.unitSize);
          }
        }
      } catch (err) {
        console.warn("[AdminOrderNotifier] Could not load product unit sizes:", err);
      }
    }

    // Format customer information
    const customerName =
      order.shippingContactName?.trim() ||
      order.buyerName?.trim() ||
      "Customer";
    const customerPhone =
      order.shippingMobileNumber?.trim() ||
      order.buyerPhone?.trim() ||
      "Not provided";
    const deliveryAddress = formatAddress(order);

    // Format order details
    const orderDate = new Date(order.orderedAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const orderTotalFormatted = formatPrice(order.totalAmount, order.currency);
    const subtotalFormatted = formatPrice(order.subtotal, order.currency);
    const taxFormatted = formatPrice(order.taxAmount, order.currency);
    const shippingFormatted = formatPrice(order.shippingAmount, order.currency);

    // Order status & payment status
    const statusDisplay = (order.status.charAt(0).toUpperCase() + order.status.slice(1)).replace(/_/g, " ");
    const paymentStatusDisplay =
      order.paymentStatus === "paid" ? "Paid" : "Pending";
    const paymentMethodDisplay =
      order.paymentMethod === "upi" ? "Online (UPI / Razorpay)" : "Cash on Delivery (COD)";

    // App URL for the Admin button
    const baseUrl =
      options?.appUrl ||
      process.env.APP_URL ||
      env.appUrl ||
      "http://localhost:3000";
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const orderAdminUrl = `${cleanBaseUrl}/orders/${order.id}`;

    // Subject
    const subject = `New Order Received — Order #${order.orderNumber}`;

    // Items table rows
    const itemsHtml = order.items
      .map((item) => {
        const itemUnitSize = productSizeMap.get(item.productId);
        const unitDisplay = item.unitType || "unit";
        const unitSizeDisplay = itemUnitSize ? itemUnitSize : null;
        const lineTotal = formatPrice(item.totalPrice, order.currency);
        const priceEach = formatPrice(item.unitPrice, order.currency);

        return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px 8px; vertical-align: top;">
              <strong style="color: #111827; font-size: 14px;">${item.productName}</strong>
              <div style="font-size: 12px; color: #4b5563; margin-top: 2px;">
                Unit: <span style="color: #111827;">${unitDisplay}</span>
                ${unitSizeDisplay ? `&bull; Unit Size: <span style="color: #111827; font-weight: 500;">${unitSizeDisplay}</span>` : ""}
              </div>
            </td>
            <td style="padding: 12px 8px; text-align: center; vertical-align: top; color: #111827; font-size: 14px;">
              ${item.quantity}
            </td>
            <td style="padding: 12px 8px; text-align: right; vertical-align: top; color: #4b5563; font-size: 14px;">
              ${priceEach}
            </td>
            <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-weight: 600; color: #111827; font-size: 14px;">
              ${lineTotal}
            </td>
          </tr>
        `;
      })
      .join("");

    const itemsText = order.items
      .map((item) => {
        const itemUnitSize = productSizeMap.get(item.productId);
        const unitSizeText = itemUnitSize ? `\n  Unit Size: ${itemUnitSize}` : "";
        return `- ${item.productName}
  Unit: ${item.unitType || "unit"}${unitSizeText}
  Quantity: ${item.quantity}
  Price: ${formatPrice(item.unitPrice, order.currency)}
  Line Total: ${formatPrice(item.totalPrice, order.currency)}`;
      })
      .join("\n\n");

    // Clean HTML Email
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Received — Order #${order.orderNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 12px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    
    <!-- Brand Header -->
    <div style="background-color: #064e3b; padding: 20px 24px; text-align: left;">
      <div style="color: #a7f3d0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">AM Fruits / FreshFlow</div>
      <h1 style="color: #ffffff; font-size: 22px; margin: 6px 0 0 0; font-weight: 700;">You Got a New Order</h1>
    </div>

    <div style="padding: 24px;">
      <!-- Order Quick Stats -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-size: 13px; color: #065f46; font-weight: 500;">Order Number</td>
            <td style="font-size: 15px; color: #064e3b; font-weight: 700; text-align: right;">#${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #065f46; font-weight: 500; padding-top: 6px;">Order Date</td>
            <td style="font-size: 13px; color: #111827; text-align: right; padding-top: 6px;">${orderDate}</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #065f46; font-weight: 500; padding-top: 6px;">Order Status</td>
            <td style="font-size: 13px; color: #111827; text-align: right; padding-top: 6px;">${statusDisplay}</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #065f46; font-weight: 500; padding-top: 6px;">Payment Status</td>
            <td style="font-size: 13px; font-weight: 600; color: ${order.paymentStatus === "paid" ? "#047857" : "#b45309"}; text-align: right; padding-top: 6px;">
              ${paymentStatusDisplay} (${paymentMethodDisplay})
            </td>
          </tr>
          <tr>
            <td style="font-size: 15px; color: #064e3b; font-weight: 700; padding-top: 10px; border-top: 1px dashed #bbf7d0;">Order Total</td>
            <td style="font-size: 18px; color: #047857; font-weight: 800; text-align: right; padding-top: 10px; border-top: 1px dashed #bbf7d0;">${orderTotalFormatted}</td>
          </tr>
        </table>
      </div>

      <!-- Customer Information Section -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 15px; text-transform: uppercase; color: #374151; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin: 0 0 12px 0;">Customer Information</h2>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="width: 120px; color: #6b7280; padding: 4px 0; vertical-align: top;">Name:</td>
            <td style="color: #111827; font-weight: 600; padding: 4px 0;">${customerName}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0; vertical-align: top;">Phone:</td>
            <td style="color: #111827; padding: 4px 0;"><a href="tel:${customerPhone}" style="color: #059669; text-decoration: none;">${customerPhone}</a></td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0; vertical-align: top;">Delivery Address:</td>
            <td style="color: #111827; padding: 4px 0; line-height: 1.4;">${deliveryAddress}</td>
          </tr>
          ${order.buyerNotes ? `
          <tr>
            <td style="color: #6b7280; padding: 4px 0; vertical-align: top;">Buyer Notes:</td>
            <td style="color: #111827; padding: 4px 0; font-style: italic;">${order.buyerNotes}</td>
          </tr>` : ""}
        </table>
      </div>

      <!-- Order Items Section -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 15px; text-transform: uppercase; color: #374151; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin: 0 0 12px 0;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f3f4f6; color: #4b5563; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center; width: 50px;">Qty</th>
              <th style="padding: 8px; text-align: right; width: 80px;">Price</th>
              <th style="padding: 8px; text-align: right; width: 90px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals summary -->
        <div style="margin-top: 12px; border-top: 1px solid #e5e7eb; padding-top: 8px;">
          <table style="width: 100%; font-size: 13px; color: #4b5563;">
            <tr>
              <td style="text-align: right; padding: 3px 0;">Subtotal:</td>
              <td style="text-align: right; width: 100px; padding: 3px 0; color: #111827;">${subtotalFormatted}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 3px 0;">GST / Taxes:</td>
              <td style="text-align: right; width: 100px; padding: 3px 0; color: #111827;">${taxFormatted}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 3px 0;">Shipping:</td>
              <td style="text-align: right; width: 100px; padding: 3px 0; color: #111827;">${shippingFormatted}</td>
            </tr>
            <tr style="font-size: 15px; font-weight: 700; color: #111827;">
              <td style="text-align: right; padding: 8px 0; border-top: 1px solid #e5e7eb;">Total Amount:</td>
              <td style="text-align: right; width: 100px; padding: 8px 0; border-top: 1px solid #e5e7eb; color: #047857;">${orderTotalFormatted}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="${orderAdminUrl}" style="background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          OPEN ORDER IN ADMIN
        </a>
        <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
          Direct Link: <a href="${orderAdminUrl}" style="color: #059669; word-break: break-all;">${orderAdminUrl}</a>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f3f4f6; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
      FreshFlow / AM Fruits Business Notification &bull; Accessing the order in Admin requires authorized business login.
    </div>

  </div>
</body>
</html>
    `.trim();

    // Plain text version
    const text = `
AM Fruits / FreshFlow — You Got a New Order

Order Information
-----------------
Order Number: #${order.orderNumber}
Order Date: ${orderDate}
Order Status: ${statusDisplay}
Payment Status: ${paymentStatusDisplay} (${paymentMethodDisplay})
Order Total: ${orderTotalFormatted}

Customer Information
--------------------
Customer Name: ${customerName}
Customer Phone: ${customerPhone}
Delivery Address: ${deliveryAddress}
${order.buyerNotes ? `Buyer Notes: ${order.buyerNotes}\n` : ""}
Order Items
-----------
${itemsText}

Summary
-------
Subtotal: ${subtotalFormatted}
Tax: ${taxFormatted}
Shipping: ${shippingFormatted}
Total Amount: ${orderTotalFormatted}

OPEN ORDER IN ADMIN:
${orderAdminUrl}

Note: Accessing the order in Admin requires normal business owner/admin authorization.
    `.trim();

    // Send email via the configured provider
    const sendResult = await sendEmail({
      to: recipient,
      subject,
      html,
      text,
    });

    if (sendResult.success) {
      notifiedOrderIds.add(orderId);
      console.log(
        `[AdminOrderNotifier] Successfully sent new order notification for Order #${order.orderNumber} to ${recipient}`
      );
      return {
        success: true,
        orderNumber: order.orderNumber,
        recipient,
      };
    } else {
      console.warn(
        `[AdminOrderNotifier] Email delivery could not complete: ${sendResult.error ?? "Provider unavailable"}`
      );
      return {
        success: false,
        skipped: sendResult.skipped,
        error: sendResult.error,
        orderNumber: order.orderNumber,
        recipient,
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[AdminOrderNotifier] Unexpected error notifying admin for Order #${orderId}:`, errorMsg);
    // Never re-throw, ensure order is never affected
    return {
      success: false,
      error: errorMsg,
    };
  }
}
