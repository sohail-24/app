# Migration Analysis Report

## 1. Objects Recreated by `0005_broken_exodus.sql`

The migration `0005_broken_exodus.sql` recreates the following objects that already existed in earlier migrations:

**Types:**
- `delivery_estimate`
- `invoice_status`
- `user_gender`
- `user_theme_preference`
- `warehouse_movement_type`
- `warehouse_status`

**Tables:**
- `invoice_items`
- `invoices`
- `warehouse_stock_movements`
- `warehouses`

**Columns (via ALTER TABLE):**
- `orders.deliveryEstimate`
- `users.dateOfBirth`
- `users.gender`
- `users.addressLine1`
- `users.city`
- `users.state`
- `users.country`
- `users.postalCode`
- `users.themePreference`

**Indexes:**
- `invoice_item_invoice_idx`
- `invoice_company_idx`
- `invoice_order_idx`
- `invoice_number_idx`
- `invoice_status_idx`
- `invoice_date_idx`
- `warehouse_movement_warehouse_idx`
- `warehouse_movement_company_idx`
- `warehouse_movement_product_idx`
- `warehouse_movement_type_idx`
- `warehouse_movement_created_at_idx`
- `warehouse_company_idx`
- `warehouse_code_idx`
- `warehouse_status_idx`
- `order_delivery_estimate_idx`

## 2. Original Migration Sources

These objects were originally created in the following migrations:

- **0001_warehouse_module.sql:**
  - Types: `warehouse_status`, `warehouse_movement_type`
  - Tables: `warehouses`, `warehouse_stock_movements`
  - Indexes: `warehouse_company_idx`, `warehouse_code_idx`, `warehouse_status_idx`, `warehouse_movement_warehouse_idx`, `warehouse_movement_company_idx`, `warehouse_movement_product_idx`, `warehouse_movement_type_idx`, `warehouse_movement_created_at_idx`

- **0002_orders_delivery_estimate.sql:**
  - Types: `delivery_estimate`
  - Columns: `orders.deliveryEstimate`
  - Indexes: `order_delivery_estimate_idx`
  *(Note: It also added values to the `order_status` enum, which `0005` handles by dropping and recreating the enum).*

- **0003_invoice_module.sql:**
  - Types: `invoice_status`
  - Tables: `invoices`, `invoice_items`
  - Indexes: `invoice_company_idx`, `invoice_order_idx`, `invoice_number_idx`, `invoice_status_idx`, `invoice_date_idx`, `invoice_item_invoice_idx`

- **0004_user_profile_fields.sql:**
  - Types: `user_gender`, `user_theme_preference`
  - Columns: `users.dateOfBirth`, `users.gender`, `users.addressLine1`, `users.city`, `users.state`, `users.country`, `users.postalCode`, `users.themePreference`

## 3. Cause Analysis

This appears to be an **accidental duplicate migration or an incomplete squash**.

The exact DDL statements from migrations `0001`, `0002`, `0003`, and `0004` have been combined entirely into `0005_broken_exodus.sql`. It looks like a developer squashed these earlier migrations together into `0005` but failed to delete the original individual migration files (`0001` through `0004`) and failed to update the Drizzle journal (`meta/_journal.json`) to reflect the squash. Consequently, the migration runner attempts to apply `0001-0004` (which succeed on a fresh DB), and then attempts to run `0005`, which tries to recreate the exact same schema objects, resulting in errors like `type "delivery_estimate" already exists`.

There is also a duplicate migration `0006_phase_2_modules.sql` and `0006_sweet_random.sql` which have the exact same content, and a `0007_melted_matthew_murdock.sql` and `0007_phase_2_business_rules.sql` which likely have conflicts.

## 4. Safest Long-Term Repair Strategy

To repair the repository while safely preserving existing production databases (which might have already successfully run `0001` through `0004` before `0005` was introduced, or might have run `0005` instead), we should:

1. **Delete the Squashed Migration File (`0005_broken_exodus.sql`):** Since migrations `0001` through `0004` independently define the complete schema changes contained in `0005`, `0005` is entirely redundant. Removing `0005_broken_exodus.sql` ensures a fresh database deployment will run `0001` to `0004` and end up in the correct state without errors.
2. **Remove `0005` from the Drizzle Journal:** Remove the entry for `0005_broken_exodus` from `db/migrations/meta/_journal.json`.
3. **Handle Duplicates in 0006 and 0007:** Analyze the `0006` and `0007` duplicates. Determine which ones are recorded in the `_journal.json`. Delete the untracked duplicate files to prevent execution ambiguity. (`0006_sweet_random` is in the journal, `0006_phase_2_modules` is not. `0007` has `0007_melted_matthew_murdock` in the journal, but the journal doesn't mention `0007_phase_2_business_rules`).
4. **Fix Existing Databases (If necessary):** Existing production databases that successfully ran up to `0004` will not be affected by removing `0005` from the repository, because migrations are tracked by their name in the database's `__drizzle_migrations` table. They simply won't have `0005` in their future path. If any environment somehow forced `0005` through manually, its `__drizzle_migrations` table might need a manual `DELETE FROM __drizzle_migrations WHERE tag = '0005_broken_exodus'` to align with the repaired repository.

This strategy guarantees the integrity of the migration history by relying on the atomic, chronologically correct migrations (`0001-0004`) while cleanly removing the broken, redundant squash file (`0005`).
