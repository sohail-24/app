# Database Migrations

FreshFlow uses Drizzle ORM for schema management and migrations.

## Production Migrations

The intended deployment workflow in Docker executes Drizzle migrations automatically during container startup, requiring zero manual intervention.

- The backend (Hono server) runs migrations programmatically before listening for requests.
- This is implemented in `api/boot.ts` using the `drizzle-orm/node-postgres/migrator` package.
- The `DATABASE_URL` environment variable is required to execute these migrations.

## Local Development & CLI Usage

During local development, you can use the standard `drizzle-kit` CLI commands:

- `npm run db:generate` - Generate new migration files based on schema changes.
- `npm run db:migrate` - Execute pending migrations against the database.
- `npm run db:push` - Push schema changes directly to the database (use with caution, typically only for rapid prototyping).

## Baselining Existing Databases

FreshFlow must never silently modify migration history during startup (e.g., auto-baselining). If a database was initially set up using `drizzle-kit push` and needs to be transitioned to a migration-based workflow:

- Use the manual script `npm run db:baseline` (which executes `db/baseline.ts`) to baseline existing databases.

## Handling Inconsistencies

Do not suppress or ignore database migration errors (e.g., 'already exists'). Production migrations must fail if the migration history is inconsistent. Never modify historical SQL migration files or migration metadata to fix inconsistencies. Stop and report the root cause rather than masking the error.
