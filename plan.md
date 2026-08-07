1. **Analyze Current Implementation vs ASCII Design:**
   - **ASCII Design Requirements:**
     - Desktop: Header with Logo, Search, Login/Profile, Cart. Top navigation bar for categories (All Products, Fruits, Vegetables, etc). Business Information Strip (Same Day Delivery, etc). "Today's Fresh Deals" block with Product Grid. "Browse by Categories" block. "ALL Products" block. "Load More Products" button. Footer.
     - Tablet: Similar, categories horizontal scroll. Business Info Strip. Deals grid. Browse Categories. Recently Added Products. Footer.
     - Mobile: Header has Logo and Cart on top row. Search bar below. Login and Cart on third row (Wait, ASCII shows Login and Cart on third row). Categories horizontally scrollable. Business Info Strip. Today's Fresh deals with "View All". Selectors for Category & Sort. Product grid (1-2 columns?). Load More Products. Bottom Navigation.
     - Product Card: Image, Name, Price, MOQ & Stock, Rating, Add to Cart.
       No quantity selector (+/-), no View Details button, no live total, no extra spacing.

2. **Modify `WholesaleProductCard` in `LandingPage.tsx`:**
   - Remove `useState(moq)` for quantity.
   - Remove the `quantity` control section (the `- / +` buttons).
   - Remove the `Live total` section.
   - Remove the `View Details` button.
   - Adjust `Add To Cart` button to just trigger `onAdd(product, moq)` (or whatever default is passed). Wait, in ASCII, "MOQ | Stock" are displayed. Add to cart should add the MOQ amount.
   - Display format:
     ```
     Name
     Price
     MOQ | Stock
     [Add Cart]
     ```
     (Or rating).
   - Check if the card styling can be cleaned up (remove any extra vertical padding/spacing that is unnecessary).

3. **Modify `LandingPage.tsx` Mobile Layout & Structure:**
   - The current mobile header in `LandingPage.tsx` is:
     - Logo & Search & Nav.
     - We should ensure it's responsive and matches ASCII. The Search bar currently becomes sticky on mobile (`sticky top-[68px]`).
     - ASCII shows:
       `FreshFlow Logo                 🛒 (2)`
       `🔍 Search products, suppliers...      Search`
       `Login                             🛒 Cart (2)`
       Wait, this is an ASCII representation. It might just imply they are accessible. In the existing code, on mobile, the header is stacked. Let's make sure it looks close to the ASCII layout without drastically altering React structure unless necessary.
       Wait! ASCII:
       ```
       ┌───────────────────────────────────────────────┐
       │ FreshFlow                              🛒 (2) │
       ├───────────────────────────────────────────────┤
       │ 🔍 Search products, suppliers...      Search  │
       ├───────────────────────────────────────────────┤
       │ Login                             🛒 Cart (2) │
       ├───────────────────────────────────────────────┤
       ```
       Actually, `Login` and `Cart` can be on the same row, or just one header row with Logo, Login, Cart, and a second row with Search.
   - `Today's Fresh Deals` header on mobile has `View All` (or `Open Product Catalog`).
   - `All Categories | Newest` sort dropdowns.

4. **Detailed Plan Steps:**
   1. **Refactor `WholesaleProductCard`**: Strip it down to match the exact requirements. Name, Price, MOQ & Stock, Rating, Add To Cart. Clean up imports/states if unused (like `useState`, `Minus`, `Plus`, `Eye`).
   2. **Refine `LandingPage` mobile layout**: Ensure correct margins, padding, and alignments. Ensure the product grid columns on mobile (ASCII has 2 columns: `Apple Image | Mango Image`). Make sure it is `grid-cols-2` or `sm:grid-cols-2` (currently it might be `grid gap-4 sm:grid-cols-2` so mobile default is 1 col! We should make it 2 cols if possible, but wait, ASCII has them side-by-side: `Apple` and `Mango` are on the same row! Let's change `grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` to `grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5` or similar, depending on what makes sense for cards without quantity selectors). Wait, ASCII shows 2 columns on mobile. We will update `ProductGrid` to use `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5`.
   3. **Ensure exact ASCII compliance**: Remove unneeded UI elements. Ensure pre-commit checks pass (`npm run build`, `npm run check`).
