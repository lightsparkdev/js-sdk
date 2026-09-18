# grid-kyc-demo

Internal demo tool for exercising the Grid KYC/KYB APIs end-to-end — both the
hosted link flow and the programmatic verification API. Single-page Vite +
React app, no backend. Credentials are entered at the top and live only in
this tab's `sessionStorage`.

## What it does

- **Create a customer** via `POST /customers` (INDIVIDUAL or BUSINESS). The
  individual form includes address, identification, and optional EDD fields
  for the programmatic flow.
- **Hosted link flow**: generate a hosted KYC link via
  `POST /customers/{id}/kyc-link` and open it in a new tab, or embed the
  Sumsub WebSDK inline.
- **Programmatic API flow** (select under "KYC flow"):
  1. **Update customer** via `PATCH /customers/{id}` — re-sends the customer
     form, e.g. to fix `MISSING_FIELD` errors.
  2. **Add beneficial owners** via `POST /beneficial-owners` (BUSINESS only) —
     KYB requires one control person plus every individual owning ≥25%.
  3. **Upload documents** via `POST /documents` (multipart) for the customer
     or any added owner. Optional until `POST /verifications` returns
     `MISSING_*_DOCUMENT` errors naming the accepted document types.
  4. **Submit for verification** via `POST /verifications` — the response
     tells you either `IN_PROGRESS`/`APPROVED` or `RESOLVE_ERRORS` with a
     per-field/per-document list of what's missing. Fix and re-submit.
  5. **Refresh** via `GET /verifications?customerId=…` to watch the status.
- **Poll customer status** via `GET /customers/{id}` so you can watch
  `kycStatus` / `kybStatus` flip after verification completes.

Every request and response is appended to a rolling log at the bottom of the
page so you can see exactly what's going over the wire.

## Run it locally

```bash
cd js/apps/examples/grid-kyc-demo
yarn dev
```

Opens on <http://localhost:3107>.

The Vite dev server proxies API calls to one of three environments — pick from
the **Environment** dropdown in the UI:

| Env   | Target                                                    |
| ----- | --------------------------------------------------------- |
| prod  | `https://api.lightspark.com/grid/2025-10-13`              |
| dev   | `https://api.dev.dev.sparkinfra.net/grid/rc`              |
| local | `http://localhost:5000/grid/rc` (sparkcore on port 5000)  |

Credentials are stored under `grid-kyc-demo:creds:<env>` so prod and dev keys
don't get mixed up. Switching env swaps the visible credential pair.

## Tips

- The platform you're calling against needs `customer_kyc_mode = GRID_SWITCH_OWNED`
  on at least one of its currencies, otherwise grid auto-approves new customers
  on creation and the link flow has nothing to do.
- For INDIVIDUAL customers on the LSP grid switch, the
  `LSP_INDIVIDUAL_KYC_ENABLED` gatekeeper also has to be on for the platform.
- The dashboard's own "Create KYC link" button is gated separately on
  `GRID_DASHBOARD_INDIVIDUAL_KYC_LINK_ENABLED`; this demo calls the REST
  endpoint directly and does not need it.
- The redirect URI must be `https://` — Sumsub rejects `http://` and localhost.
  Leave the field blank to use Sumsub's default post-flow page.
