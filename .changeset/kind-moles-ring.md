---
"@lightsparkdev/lightspark-sdk": patch
---

- GraphQL Query Adjustment:
  – In packages/lightspark-sdk/src/graphql/IncomingPaymentsForInvoice.ts, the type for the $invoice_id variable was changed from Hash32! to ID! to better align with schema definitions.
