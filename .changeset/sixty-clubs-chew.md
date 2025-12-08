---
"@lightsparkdev/core": patch
---

- Added payment hash parameters to create_invoice. This is for RK customers to specify payment hash upfront when creating
an invoice so that a round-trip to the RK to fetch the payment hash doesn't have to be made mid-request.
