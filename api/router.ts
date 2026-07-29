import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { productRouter } from "./productRouter";
import { categoryRouter } from "./categoryRouter";
import { cartRouter } from "./cartRouter";
import { orderRouter } from "./orderRouter";
import { inventoryRouter } from "./inventoryRouter";
import { companyRouter } from "./companyRouter";
import { warehouseRouter } from "./warehouseRouter";
import { invoiceRouter } from "./invoiceRouter";
import { reportRouter } from "./reportRouter";
import { profileRouter } from "./profileRouter";
import { customerRouter } from "./customerRouter";
import { deliveryZoneRouter } from "./deliveryZoneRouter";
import { gstRouter } from "./gstRouter";
import { shippingRouter } from "./shippingRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,

  // FreshFlow B2B Marketplace Routers
  product: productRouter,
  category: categoryRouter,
  cart: cartRouter,
  order: orderRouter,
  inventory: inventoryRouter,
  company: companyRouter,
  warehouse: warehouseRouter,
  invoice: invoiceRouter,
  report: reportRouter,
  profile: profileRouter,
  customer: customerRouter,
  deliveryZone: deliveryZoneRouter,
  gst: gstRouter,
  shipping: shippingRouter,
});

export type AppRouter = typeof appRouter;
