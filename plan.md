1. **Prevent incomplete addresses:**
   - In `src/pages/Checkout.tsx`, the field is already named "Delivery Address". Wait, the instruction says: `Rename the field to: House / Flat No. & Street Address *`.
   - Also validate it to be at least 10 characters long, and trim whitespace.
   - If `addressQuery.data` (addresses) is empty, they shouldn't be allowed to place an order? "If the buyer has no valid saved address, DO NOT allow Place Order. Instead show a friendly message asking them to complete their Address Book first."

2. **Checkout Validation Update:**
   - Rename `Delivery Address` label to `House / Flat No. & Street Address *`
   - Validate `form.address` minimum length in `handleSubmit` in `Checkout.tsx`.
   - Wait, if we enforce address book, we should disable the place order button or check if they have a saved address in `handleSubmit`.
   - Checkout must never allow incomplete delivery addresses: Check `addressQuery.data?.length === 0`. If 0, replace the checkout form with a message or block it, but since checkout has its own form fields maybe we should just require the user to have an address.
   - Wait, "Checkout must never allow incomplete delivery addresses."
   - If they have no saved address, do they even get to fill the form? "Instead show a friendly message asking them to complete their Address Book first."

3. **Improve Address Book display:**
   - Instead of one long line in `Profile.tsx`, format the display of address into multiple lines as shown:
     sohail
     +91XXXXXXXXXX
     [blank]
     20-3-1/2/A Rahmat Manzil
     Doodh Bowli
     Hyderabad, Telangana

4. **Verify tests.**
