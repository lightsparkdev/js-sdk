# GGA Example App — React + Origin Redesign

Date: 2026-06-10 · Status: proposed, pending review before the implementation plan.

## Goal

Turn the example app from one 1,127-line `index.html` of "boxes + copied IDs" into a polished **React + `@lightsparkdev/origin`** app that shows the **two sides of a Grid integration** — a **Platform view** and a **Customer view** — so a partner sees roughly what they'd build, with all logs / IDs / raw responses hidden behind a **Debug toggle**.

## Personas & shell

- **Persona switcher** (top bar): `Platform ⇄ Customer`, one view visible at a time.
- **Active-customer chip** (Customer view): "Acting as: \<name>".
- **Debug toggle** (top bar, **off by default**): reveals the debug drawer + raw IDs/JSON. Like a dev-tools panel you flip on.

## Platform view (admin-dashboard feel)

- **Platform config** panel — auth/connection status + editable platform settings.
- **Customers** — a table (name · email · status · wallet state), a **Create customer** action, and **"Act as"** which selects the customer and switches to the Customer view scoped to it.

## Customer view (consumer-wallet feel, for the active customer)

- **Logged out →** login screen: pick a method (OTP / OAuth / Passkey). Real Turnkey ceremonies — nothing auto-signed.
- **Logged in (session) →** wallet home: balance + account(s), and actions **Fund** (external account → money-in), **Send / Pay** (quote + execute), **Activity**.
- **Settings →** manage credentials & sessions (add/remove passkey/OAuth, revoke sessions) and **export**.
- **"Act as" = scope-switch only**: it threads the `customer_id` so you don't copy IDs; every operation still runs its real flow explicitly.

## Debug mode

- **Off** → only the two polished personas are visible.
- **On** → a **debug drawer** (request/response log, today's "Response Log"), per-card **"raw"** expanders, and the context chip reveals actual IDs/JSON.

## Conversion strategy (vanilla → React + Origin)

- **Reuse the integration logic** (the valuable ~1,500 LOC): `api-client`, `turnkey`, `webauthn`, `session`, `config`, `mode`, and the flow orchestration in `flows/*.ts`. Today they call `ui.ts` for output; **decouple that** by injecting a small **reporter interface** (status + structured log events) that React consumes as state + the debug log, instead of DOM writes.
- **Rebuild as React + Origin**: the shell, Platform view, Customer view, debug drawer — using Origin components and `@lightsparkdev/origin/styles.css`.
- **Delete**: `ui.ts` DOM code and the `index.html` body (keep a minimal `index.html` with just the React mount root).
- **Template**: mirror `grid-kyc-demo`'s React + Vite + Origin wiring (`main.tsx` imports `@lightsparkdev/origin/styles.css`; `declarations.d.ts` shims Origin's TS resolution; `@vitejs/plugin-react`).

## Proposed structure

```
src/
  main.tsx               # mount React + import "@lightsparkdev/origin/styles.css"
  App.tsx                # shell: persona switcher, debug toggle, view routing
  declarations.d.ts      # Origin TS-resolution shim (per grid-kyc-demo)
  state/                 # activeCustomer, session, debugOn, log (React context/store)
  lib/                   # reused logic: api-client, turnkey, webauthn, session, config, mode — no DOM
  flows/                 # reused orchestration: returns results / emits log events (no DOM)
  components/            # Shell, PersonaSwitcher, DebugToggle, DebugDrawer, ContextChip, RawExpander
  views/
    platform/            # Config, CustomersTable, CreateCustomer
    customer/            # Login, WalletHome, Fund, Pay, Activity, Settings
index.html               # minimal: <div id="root">
```

## Aesthetic

`@lightsparkdev/origin` styles + components (Origin palette, typography, spacing, components). Clean, light, credible — not a bespoke pixel-perfect design system. Stays within Origin defaults.

## Scope / sequencing (small stack on #28475, each step runnable + screenshotted)

1. **Scaffold**: add `react`, `react-dom`, `@vitejs/plugin-react`, `@lightsparkdev/origin`; `main.tsx` + `App` shell + Origin styles; minimal `index.html`; `declarations.d.ts`. Renders an empty shell with the persona switcher + debug toggle.
2. **Decouple logic from `ui.ts`**: introduce the reporter/state+log interface; move `api-client`/`turnkey`/`webauthn`/`session`/`config`/`mode` + flows under `lib/`/`flows/`, DOM-free.
3. **Platform view**: config panel + customers table + create + "act as".
4. **Customer view**: login → wallet home → fund/pay → settings/export.
5. **Debug drawer**: wire the log, raw expanders, context-chip IDs.
6. **Remove** the old vanilla `ui.ts` + `index.html` body; cleanup + final polish pass.

## Non-goals

- Not a bespoke pixel-perfect design — use Origin defaults.
- Not changing real Turnkey/API behavior — same flows, new rendering.
- No backend changes.

## Open items (resolve during build)

- External-account/fund + quote/execute confirmed on the **Customer** side.
- Exact Origin components to use (Button, Card, Table, TextInput, Tabs, Drawer/Modal, Badge) — pick as we build.
