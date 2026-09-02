# grid-kyc-demo

Internal demo tool for exercising the Grid hosted KYC/KYB link API end-to-end.
Single-page Vite + React app, no backend. Credentials are entered at the top
and live only in this tab's `sessionStorage`.

## What it does

- **Create a customer** via `POST /customers` (INDIVIDUAL or BUSINESS).
- **Generate a hosted KYC link** via `POST /customers/{id}/kyc-link` and open it
  in a new tab.
- **Poll customer status** via `GET /customers/{id}` so you can watch
  `kycStatus` / `kybStatus` flip after the hosted flow completes.

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
- The redirect URI must be `https://` — Sumsub rejects `http://` and localhost.
  Leave the field blank to use Sumsub's default post-flow page.
