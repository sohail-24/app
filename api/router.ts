import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { productRouter } from "./productRouter";
import { categoryRouter } from "./categoryRouter";
import { cartRouter } from "./cartRouter";
import { orderRouter } from "./orderRouter";
import { inventoryRouter } from "./inventoryRouter";
import { companyRouter } from "./companyRouter";

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
});

export type AppRouter = typeof appRouter;
