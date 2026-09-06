import { describe, it, expect, vi } from "vitest";
import { notifyAdminNewOrder } from "./orderNotification";

// Mock emailService to test notification logic without network requests
vi.mock("./emailService", () => ({
  sendEmail: vi.fn().mockImplementation(async (options) => {
    return { success: true, messageId: "mock-msg-123" };
  }),
}));

// Mock orders query
vi.mock("../queries/orders", () => ({
  findOrderWithDetails: vi.fn().mockImplementation(async (orderId: number) => {
    if (orderId === 999999) return null;
    return {
      id: orderId,
      orderNumber: "ORD-2026-TEST",
      orderedAt: new Date("2026-09-06T10:00:00Z"),
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "upi",
      subtotal: "4000.00",
      taxAmount: "200.00",
      shippingAmount: "100.00",
      totalAmount: "4300.00",
      currency: "INR",
      shippingContactName: "Test Buyer",
      shippingMobileNumber: "+91 98765 43210",
      shippingAddressLine1: "Flat 402, Green Orchid",
      shippingAddressLine2: "Outer Ring Road",
      shippingLandmark: "Phoenix Marketcity",
      shippingAreaLocality: "Whitefield",
      shippingCity: "Bengaluru",
      shippingState: "Karnataka",
      shippingPostalCode: "560066",
      shippingCountry: "India",
      buyerName: "Test Buyer Company",
      buyerPhone: "+91 98765 43210",
      buyerNotes: "Please deliver before noon",
      items: [
        {
          id: 1,
          productId: 101,
          productName: "Shimla Royal Delicious Apples",
          quantity: 2,
          unitType: "box",
          unitPrice: "2000.00",
          totalPrice: "4000.00",
        },
      ],
    };
  }),
}));

// Mock db queries for products
vi.mock("../queries/connection", () => ({
  getDb: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: 101, unitSize: "10 kg crate" },
        ]),
      }),
    }),
  }),
}));

describe("Admin New Order Email Notification", () => {
  it("generates and triggers order notification with customer, item, and unit size details", async () => {
    const result = await notifyAdminNewOrder(12345, { appUrl: "https://freshflow.app", force: true });
    expect(result.success).toBe(true);
    expect(result.orderNumber).toBe("ORD-2026-TEST");
    expect(result.recipient).toBeDefined();
  });

  it("handles non-existent orders gracefully without throwing", async () => {
    const result = await notifyAdminNewOrder(999999, { force: true });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Order not found");
  });

  it("enforces idempotency and skips duplicate notification for the same order", async () => {
    // First run with a fresh order ID
    const orderId = 888888;
    const firstResult = await notifyAdminNewOrder(orderId, { force: false });
    expect(firstResult.success).toBe(true);

    // Second run without force flag should be skipped
    const secondResult = await notifyAdminNewOrder(orderId, { force: false });
    expect(secondResult.success).toBe(true);
    expect(secondResult.skipped).toBe(true);
  });
});
