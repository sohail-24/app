import { Pool } from "pg";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import crypto from "crypto";

import { env } from "../api/lib/env.js";

async function runBaseline() {
  const pool = new Pool({
    connectionString: env.databaseUrl,
  });

  try {
    const journalPath = resolve(process.cwd(), "db/migrations/meta/_journal.json");
    if (!existsSync(journalPath)) {
      throw new Error(`Cannot find journal at ${journalPath}`);
    }

    const journalContent = readFileSync(journalPath, "utf-8");
    const journal = JSON.parse(journalContent);

    // Create schema and table if not exists (matching Drizzle's internal logic)
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "drizzle"`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    // We baseline by inserting the first migration if nothing is tracked
    const existing = await pool.query(
      `SELECT count(*) as count FROM "drizzle"."__drizzle_migrations"`
    );

    if (parseInt(existing.rows[0].count, 10) > 0) {
      console.log("Database is already tracking migrations. No baselining required.");
      return;
    }

    for (const entry of journal.entries) {
      const migrationFile = resolve(process.cwd(), `db/migrations/${entry.tag}.sql`);
      const query = readFileSync(migrationFile, "utf-8");

      const hash = crypto.createHash("sha256").update(query).digest("hex");

      await pool.query(
        `INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
        [hash, entry.when]
      );
      console.log(`Baselined migration: ${entry.tag}`);
    }

    console.log("Database successfully baselined.");
  } catch (error) {
    console.error("Baseline procedure failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runBaseline();
