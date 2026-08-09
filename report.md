# Razorpay Checkout Missing UPI Investigation

## 1. Root cause
✅ Razorpay Dashboard configuration

The missing UPI payment method is caused by configuration in the Razorpay Dashboard (or a limitation of the specific Razorpay Test Mode account), rather than a bug in the application's code.

## 2. Files inspected
* `src/pages/Checkout.tsx`: Inspected the Razorpay `options` object passed to `new window.Razorpay(options)`. No filters, restrictions, or `config.display` settings are present that would hide UPI.
* `api/orderRouter.ts`: Inspected the `createRazorpayOrder` mutation. It correctly calls `razorpay.orders.create` with only `amount`, `currency`, and `receipt`. No method restrictions are passed.
* `api/lib/razorpay.ts`: Verified Razorpay client initialization.
* `docker-compose.yml`: Verified standard `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` env vars.
* `nginx/nginx.conf`: Verified CSP headers. `https://checkout.razorpay.com` is permitted for scripts, connect, and frames.

## 3. Files changed (if any)
None. No changes are required in the codebase.

## 4. Exact reason UPI is not appearing
The frontend code requests the standard Razorpay checkout without applying any custom filters (like `options.config.display.hide = [{method: 'upi'}]`). The backend also does not restrict payment methods when generating the order ID. Since Razorpay controls which payment methods are available to a specific merchant account directly from their backend, the absence of UPI means UPI is currently disabled or pending activation for this merchant account in the Razorpay Dashboard.

## 5. Required Action
This issue requires Razorpay Dashboard/account configuration. You must log into the Razorpay Dashboard, navigate to **Account & Settings > Payment Methods**, and ensure that **UPI** is enabled for your account. If it is in a "Pending" state, you may need to complete KYC or contact Razorpay support to activate it.

## 6. Confirmation of Existing Functionality
Since no code changes were made, Card, Wallet, Netbanking, COD, and the existing checkout flow continue to work correctly just as they did before.
