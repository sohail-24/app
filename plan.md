1. **Understand the Goal**: Redesign the mobile buyer experience to look and feel like a modern ecommerce app (Amazon, Flipkart, Blinkit, etc.). The current design is likely just a desktop view scaled down, which isn't optimal for mobile users. We need to target specific buyer pages: `LandingPage.tsx`, `Products.tsx`, `ProductDetail.tsx`, `Cart.tsx`, `Checkout.tsx`, `Profile.tsx`, `Orders.tsx`. We must *not* change the desktop/tablet UI, backend, API, or admin pages.

2. **Mobile Design Principles to Apply**:
    - Thumb-friendly navigation and bottom action bars (e.g., sticky Add to Cart).
    - Compact, readable cards with high visual hierarchy.
    - Horizontal scrolling for categories or related items to save vertical space.
    - Full-width images on product detail pages.
    - Clear typography and padding suitable for touch targets but not excessively large.
    - Using `hidden md:flex` or similar Tailwind responsive classes to conditionally render mobile-optimized vs desktop-optimized sections.

3. **Specific File Modifications**:
    - `LandingPage.tsx`:
        - Convert the product grids to be a bit more compact on mobile (e.g., 2 columns with tighter spacing).
        - Ensure category scroll is smooth and snap-based.
        - Add a sticky search bar or bottom navigation for mobile if not present in the app layout.
    - `Products.tsx`:
        - For the buyer marketplace, hide the large sidebar filters on mobile and replace them with a sticky or fixed bottom filter/sort button that opens a drawer or dialog.
        - Make the product cards smaller (e.g., 2-column grid on mobile) with optimized text sizes.
    - `ProductDetail.tsx`:
        - Make the product image span full width on mobile (no borders or rounded corners at the edges).
        - Make the "Add to Cart" and "Buy Now" section sticky at the bottom on mobile (this seems already partially done, but needs refinement to look premium).
    - `Cart.tsx`:
        - Simplify the item list view. Reduce padding and use a more compact layout for the image, title, price, and quantity controls.
        - Make the order summary sticky at the bottom for easy checkout access on mobile.
    - `Checkout.tsx`:
        - Ensure the form fields are easily tapable. Break down sections logically.
        - Make the final "Place Order" button sticky at the bottom.
    - `Profile.tsx`:
        - Use a more mobile-native list view for settings and address management.
    - `Orders.tsx`:
        - Simplify the order history cards. Show key info (status, date, total, thumbnail) compactly.

4. **Implementation Strategy**:
    - Iterate through each file.
    - Look for `BuyerMarketplace` or buyer-specific components.
    - Update Tailwind classes to separate mobile and desktop layouts using `md:`, `lg:` prefixes.
    - Example: Instead of `<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">`, we might use `<div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3">` and optimize the card itself.

5. **Pre-commit Steps**:
    - Verify UI changes locally.
    - Take screenshots as requested.
    - Run build and type check.
