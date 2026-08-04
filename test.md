Wait, the instruction literally says:
1. Prevent incomplete addresses
Currently a user without a proper saved address can still place an order with addresses like:
hyd
abc
test
This should not be allowed.
Rename the field to:
House / Flat No. & Street Address *
This field must require a realistic address.
Validation:
- trim whitespace
- minimum length 10 characters (or another reasonable value around 10–15)
- display a friendly validation message such as:
"Please enter your complete house/flat number and street address."

2. Checkout validation
If the buyer has no valid saved address,
DO NOT allow Place Order.
Instead show a friendly message asking them to complete their Address Book first.
Checkout must never allow incomplete delivery addresses.
