1. **Modify `api/queries/inventory.ts`**:
   - Add a new function `deleteInventoryRecord(id: number)`.
   - Use a Drizzle ORM transaction to ensure atomicity.
   - First, find the `inventory` record to get its `productId`.
   - Check if this is the ONLY inventory record for this `productId` (i.e. `count === 1`).
   - Check if there are any `orderItems` for this `productId`.
   - Delete `warehouseStockMovements` associated with this `inventoryId` (or `productId` if product is being deleted).
   - Delete the `inventory` record itself.
   - If it was the only inventory record AND there are NO `orderItems` for it, it's safe to completely delete the associated `product` from the database. This fulfills the requirement to delete "test products" and their associated product records without breaking existing historical orders. To do this, also delete `cartItems` linked to `productId` before deleting the `product`.
   - Ensure imports for `orderItems`, `cartItems`, `warehouseStockMovements` are included from `@db/schema`.
2. **Modify `api/inventoryRouter.ts`**:
   - Update the `delete` mutation to use `deleteInventoryRecord(input.id)` instead of updating `isActive: false`.
3. **Modify `src/pages/Inventory.tsx`**:
   - Update the toast success message to "Inventory record deleted successfully." since it's now a hard deletion. (Line ~179 and Line ~483 for the description if present).
4. **Pre-commit Steps**:
   - Use `pre_commit_instructions` tool to complete testing/validation before submitting.
