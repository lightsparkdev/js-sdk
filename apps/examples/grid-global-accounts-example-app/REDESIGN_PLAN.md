# GGA React + Origin Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the vanilla-TS Grid Global Accounts example app into a polished React + `@lightsparkdev/origin` app with two persona views (Platform / Customer) and a debug toggle, reusing the existing integration logic.

**Architecture:** Reuse the real integration logic (`api-client`, `turnkey`, `webauthn`, `session`, `config`, `mode`, `flows/*`) after decoupling it from `ui.ts` via an injected `Reporter` interface; rebuild only the rendering layer as React components styled with Origin. Mirror `grid-kyc-demo`'s React+Vite+Origin wiring.

**Tech Stack:** React 19, Vite 8 (`@vitejs/plugin-react`), `@lightsparkdev/origin` (styles + components), TypeScript. Verification: `tsc`/`vite build` + dev-server screenshots; vitest unit tests for the decoupled logic.

**Workspace:** `@lightsparkdev/grid-global-accounts-example-app` at `js/apps/examples/grid-global-accounts-example-app/`.
**Commands:** dev `yarn workspace @lightsparkdev/grid-global-accounts-example-app dev` · build/typecheck `yarn workspace @lightsparkdev/grid-global-accounts-example-app build` · lint `yarn lint && yarn format`.
**Note (frontend):** for UI tasks, acceptance is "build/typecheck passes + dev screenshot matches the intent." Component *internals* are built during execution with the **frontend-design** skill; this plan pins the file map, interfaces, props, Origin components, and per-task acceptance. Logic tasks use real vitest unit tests (TDD).

---

## Target file structure

```
src/
  main.tsx              # mount React + import "@lightsparkdev/origin/styles.css"
  App.tsx               # shell: persona switcher, debug toggle, view routing
  declarations.d.ts     # *.module.scss / *.module.css shims (per grid-kyc-demo)
  state/
    store.tsx           # AppStateProvider + useAppState(): persona, activeCustomer, session, debugOn, log[]; reporter impl
  lib/                  # reused logic, DOM-free, Reporter-injected
    reporter.ts         # Reporter interface + LogEntry type
    api-client.ts  turnkey.ts  webauthn.ts  session.ts  config.ts  mode.ts
  flows/                # reused orchestration, DOM-free, returns results / emits via Reporter
    customer.ts  email-otp.ts  oauth.ts  passkey.ts  manage.ts  money.ts  context.ts
  components/
    Shell.tsx  PersonaSwitcher.tsx  DebugToggle.tsx  DebugDrawer.tsx  RawExpander.tsx  ContextChip.tsx
  views/
    platform/  PlatformView.tsx  Config.tsx  CustomersTable.tsx  CreateCustomer.tsx
    customer/  CustomerView.tsx  Login.tsx  WalletHome.tsx  Fund.tsx  Pay.tsx  Activity.tsx  Settings.tsx
index.html              # minimal: <div id="root">
```

(Old `ui.ts` and the old `main.ts` are deleted in Task 6; the existing `flows/*.ts` and lib modules are *moved/edited in place*, not rewritten.)

---

### Task 1: Scaffold React + Origin shell

**Files:**
- Modify: `package.json` (deps), `vite.config.ts` (react plugin), `index.html` (mount root)
- Create: `src/main.tsx`, `src/declarations.d.ts`, `src/App.tsx`, `src/state/store.tsx`, `src/components/{Shell,PersonaSwitcher,DebugToggle}.tsx`

- [ ] **Step 1: Add deps**
```bash
yarn workspace @lightsparkdev/grid-global-accounts-example-app add \
  "@lightsparkdev/origin@*" react@^19.2.6 react-dom@^19.2.6 @emotion/react@^11.14.0 @emotion/styled@^11.14.1
yarn workspace @lightsparkdev/grid-global-accounts-example-app add -D \
  @vitejs/plugin-react@^5.2.0 @types/react@^19.2.15 @types/react-dom@^19.2.3
```

- [ ] **Step 2: Add the React plugin to `vite.config.ts`** — keep the existing proxy/server block; add:
```ts
import react from "@vitejs/plugin-react";
// in defineConfig({ ... }): plugins: [react()],
```

- [ ] **Step 3: Minimal `index.html` body** — replace the giant body with:
```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

- [ ] **Step 4: Create `src/declarations.d.ts`** (the `*.module.scss` + `*.module.css` shims block, copied verbatim from `grid-kyc-demo/src/declarations.d.ts` — Origin's `main` points at its source so tsc walks into `.module.scss`).

- [ ] **Step 5: Create `src/main.tsx`**
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@lightsparkdev/origin/styles.css";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");
createRoot(container).render(<StrictMode><App /></StrictMode>);
```

- [ ] **Step 6: Create `src/state/store.tsx`** — `AppStateProvider` + `useAppState()` hook exposing:
```ts
type Persona = "platform" | "customer";
type AppState = {
  persona: Persona; setPersona(p: Persona): void;
  activeCustomer: { id: string; name: string; email: string } | null;
  setActiveCustomer(c: AppState["activeCustomer"]): void;
  session: { /* held session material */ } | null; setSession(s: unknown): void;
  debugOn: boolean; toggleDebug(): void;
  log: LogEntry[];           // from lib/reporter
  reporter: Reporter;        // pushes into log + status; see Task 2
};
```
(Reporter is fully defined in Task 2; here just hold `log` state + provide a `reporter` that appends.)

- [ ] **Step 7: Create `Shell` + `PersonaSwitcher` + `DebugToggle`** using Origin components (segmented control / tabs for the switcher, a switch for debug). `App.tsx` renders `<AppStateProvider><Shell>{persona === "platform" ? <PlatformView/> : <CustomerView/>}</Shell></AppStateProvider>` with empty placeholder views for now.

- [ ] **Step 8: Verify** — `yarn workspace @lightsparkdev/grid-global-accounts-example-app build` passes (tsc + vite). Then `… dev`, screenshot: an Origin-styled shell with a working Platform⇄Customer switcher and a debug toggle (placeholder view bodies). 

- [ ] **Step 9: Commit** — `feat(gga): scaffold React + Origin shell with persona switcher + debug toggle`

---

### Task 2: `Reporter` interface + decouple logic from `ui.ts`

**Files:**
- Create: `src/lib/reporter.ts`, `src/lib/__tests__/reporter.test.ts`
- Modify (move into `lib/`, remove `ui.ts` imports, accept `Reporter`): `api-client.ts`, `turnkey.ts`, `webauthn.ts`, `session.ts`, `config.ts`, `mode.ts`
- Modify (accept `Reporter`, return results, no DOM): `flows/*.ts`
- Modify: `src/state/store.tsx` (real `reporter` impl pushing to `log` + status)

- [ ] **Step 1: Define `Reporter`** in `src/lib/reporter.ts`
```ts
export type LogEntry = {
  id: string; ts: number;
  level: "info" | "error" | "request" | "response";
  label: string; detail?: unknown;   // raw payload / IDs / JSON, shown only in debug mode
};
export interface Reporter {
  log(entry: Omit<LogEntry, "id" | "ts">): void;
  status(message: string, kind?: "info" | "error" | "success"): void;
}
```

- [ ] **Step 2: Write failing unit test** `src/lib/__tests__/reporter.test.ts` — a collecting reporter records entries with ids/timestamps; assert order + fields. (Add a `test` script + vitest devDep if absent: `"test": "vitest run"`.)
- [ ] **Step 3: Implement** the collecting reporter (used by the React store) → test passes (`yarn workspace … test`).

- [ ] **Step 4: Decouple each lib module** — replace `import { ... } from "../ui"` / `ui.log(...)` / `ui.setStatus(...)` calls with a `reporter: Reporter` parameter (thread it through). No `document.*`. Pattern, per module:
  - was: `ui.log("submitted", body)` → now: `reporter.log({ level: "request", label: "submitted", detail: body })`.
- [ ] **Step 5: Decouple each flow** in `flows/*.ts` similarly — take `reporter` (and the active context) as args, **return** their result instead of rendering. `flows/manage.ts` + `session.ts` also drop their direct DOM (`getElementById`/`innerHTML`).
- [ ] **Step 6: Wire the store's `reporter`** to append `LogEntry`s to `log` and surface `status`.
- [ ] **Step 7: Verify** — `… build` passes; `… test` green; existing flows still callable from a temporary dev button (smoke). 
- [ ] **Step 8: Commit** — `refactor(gga): decouple integration logic from ui.ts via Reporter`

---

### Task 3: Platform view

**Files:** Create `src/views/platform/{PlatformView,Config,CustomersTable,CreateCustomer}.tsx`

- [ ] **Config** (Origin Card + form inputs): shows platform auth/connection status + editable platform settings; reads/writes via `lib/config.ts` + `flows/context.ts`.
- [ ] **CreateCustomer** (Origin form/modal): calls `flows/customer.ts`; on success adds the customer to `state` (a session-local list — the demo tracks customers it created) and selects it.
- [ ] **CustomersTable** (Origin Table): lists the session-local customers (name · email · status · wallet state) with a row **"Act as"** action → `setActiveCustomer(row)` + `setPersona("customer")`.
- [ ] **Verify** — `… build` passes; `… dev` screenshot: config panel + customer table + create flow + "act as" switches to (placeholder/real) Customer view.
- [ ] **Commit** — `feat(gga): platform view (config, customers table, create, act-as)`

---

### Task 4: Customer view (split into sub-commits)

**Files:** Create `src/views/customer/{CustomerView,Login,WalletHome,Fund,Pay,Activity,Settings}.tsx`

- [ ] **4a — Login**: method tabs (OTP / OAuth / Passkey) → real flows (`flows/email-otp.ts`, `oauth.ts`, `passkey.ts`) for the `activeCustomer`; on success `setSession(...)`. Logged-out state if no session. Commit.
- [ ] **4b — WalletHome + Fund + Pay + Activity**: balance/accounts (Origin Card/stat); **Fund** via `flows/money.ts` (external account → money-in); **Pay** via `flows/money.ts` (quote + execute); **Activity** list. Commit.
- [ ] **4c — Settings**: manage credentials & sessions (add/remove passkey/OAuth, revoke) + export via `flows/manage.ts`. Commit.
- [ ] **Verify each** — `… build` passes; `… dev` screenshots of login → wallet → fund/pay → settings, acting as a created customer end-to-end (real flows).

---

### Task 5: Debug drawer + raw expanders + context chip

**Files:** Create `src/components/{DebugDrawer,RawExpander,ContextChip}.tsx`; wire into `Shell`.

- [ ] **DebugDrawer**: rendered when `debugOn`; lists `state.log` entries (request/response/info/error) with expandable `detail` JSON. Origin Drawer/panel styling.
- [ ] **RawExpander**: a reusable "raw" disclosure used inside cards; renders `detail` JSON only when `debugOn`.
- [ ] **ContextChip**: shows active customer/session; reveals the actual IDs (customer/wallet/session) only when `debugOn` (collapsed to name otherwise).
- [ ] **Verify** — `… dev` screenshot: debug off = clean personas; debug on = drawer + raw JSON + IDs appear.
- [ ] **Commit** — `feat(gga): debug drawer + raw expanders + context chip (off by default)`

---

### Task 6: Remove vanilla shell + final polish

**Files:** Delete `src/ui.ts`, old `src/main.ts`; remove any remaining old markup; final pass.

- [ ] Delete `src/ui.ts` and the old `src/main.ts`; grep for stray references (`grep -rn "from \"./ui\"" src` → none).
- [ ] `yarn lint && yarn format`; `yarn workspace @lightsparkdev/grid-global-accounts-example-app build` passes.
- [ ] Final `… dev` screenshots: Platform view, Customer view (logged in), debug on — confirm polished + Origin-branded.
- [ ] **Commit** — `chore(gga): remove vanilla ui.ts/main.ts; final polish`

---

## Self-review

- **Spec coverage:** personas+switcher (Task 1), Platform view (Task 3), Customer view incl. fund/pay (Task 4), debug mode (Task 5), context threading / "act as" scope-switch (Task 3 act-as + store), Origin styling (Tasks 1–5), reuse-logic-decouple-ui (Task 2), remove vanilla (Task 6). ✓ All spec sections covered.
- **Placeholders:** scaffold/interfaces are concrete code; UI internals are intentionally built via frontend-design at execution with build+screenshot acceptance (noted up top) — not a hidden TODO.
- **Type consistency:** `Reporter`/`LogEntry` defined in Task 2 and consumed by the store (Task 1 forward-references it, fully defined in Task 2) and by lib/flows; `Persona`/`activeCustomer`/`session`/`debugOn`/`log` names consistent across store and components.
