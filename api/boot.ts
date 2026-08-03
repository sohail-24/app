import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

let pkgVersion = "1.0.0";
try {
  const pkgPath = resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  if (pkg.version) pkgVersion = pkg.version;
} catch {
  // fallback if package.json is missing or unreadable
}

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "FreshFlow",
    version: pkgVersion,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  try {
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const { getDb } = await import("./queries/connection");
    console.log("Running database migrations...");
    const db = getDb();
    await migrate(db, { migrationsFolder: resolve(process.cwd(), "db/migrations") });
    console.log("Database migrations completed successfully.");
  } catch (error) {
    console.error("Failed to run database migrations:", error);
    process.exit(1);
  }

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
