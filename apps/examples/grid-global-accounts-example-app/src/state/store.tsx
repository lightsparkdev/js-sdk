import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { ApiAuth } from "../api-client";
import type { LogEntry, Reporter } from "../lib/reporter";
import { clearActiveSession, setActiveSessionAccount } from "../session";

/** Which side of the integration is currently on screen. */
export type Persona = "platform" | "customer";

/** A customer the platform has created and can "act as". */
export interface ActiveCustomer {
  id: string;
  name: string;
  /**
   * Optional display email. Only set when a flow has it (e.g. create); the
   * customers table identifies rows by `id`, not email, so act-as omits it.
   */
  email?: string;
  /**
   * The customer's spendable wallet internal account id. The customers table
   * carries it straight from the grouped internal-accounts fetch so act-as can
   * scope the Customer view without an extra request. May be null if no account
   * was provisioned yet.
   */
  accountId?: string | null;
  /** Coarse lifecycle state surfaced in the customers table. */
  status?: string;
  /** Wallet/account state surfaced in the customers table. */
  walletState?: string;
}

export type StatusKind = "info" | "error" | "success";

/** The latest status message surfaced by the reporter. */
export interface StatusState {
  message: string;
  kind: StatusKind;
}

export interface AppState {
  persona: Persona;
  setPersona: (persona: Persona) => void;

  /**
   * The platform API credentials + mode entered in the Platform config panel.
   * Null until the operator connects. The decoupled flows take an `ApiAuth`
   * argument, so this is the gate that unlocks every platform operation.
   */
  platformAuth: ApiAuth | null;
  setPlatformAuth: (auth: ApiAuth | null) => void;

  /**
   * The platform's funded source internal account LSID (`InternalAccount:<uuid>`)
   * the operator pastes in the config panel. Used as the `source` when funding a
   * customer from the platform (quote → execute → poll). Not a secret, but lives
   * alongside `platformAuth` as connect config. Empty until set.
   */
  platformFundingAccountId: string;
  setPlatformFundingAccountId: (id: string) => void;

  /**
   * The platform's customers, derived once connected from a single grouped
   * `GET /customers/internal-accounts` fetch (one row per customer). `setCustomers`
   * replaces the list after a fetch; `addCustomer` optimistically prepends a
   * just-created customer ahead of the refetch so it shows immediately. De-duped
   * by id.
   */
  customers: ActiveCustomer[];
  addCustomer: (customer: ActiveCustomer) => void;
  setCustomers: (customers: ActiveCustomer[]) => void;

  activeCustomer: ActiveCustomer | null;
  setActiveCustomer: (customer: ActiveCustomer | null) => void;

  /**
   * Held session material for the *active customer* once logged in. Per-customer:
   * cached by the customer's account id, so switching away and back restores the
   * cached session without re-authenticating, while a fresh customer reads null
   * (logged-out). Typed as `unknown` — the concrete session shape is owned by the
   * reused `session`/`turnkey` logic, whose crypto context is kept in lockstep via
   * `setActiveSessionAccount` on every customer switch.
   */
  session: unknown | null;
  setSession: (session: unknown | null) => void;
  /**
   * Sign the active customer out locally: wipe their crypto signing context
   * (`clearActiveSession`) and clear their session slot, so `CustomerView`
   * falls back to `<Login/>` and they can re-authenticate. No-op when no
   * customer is active.
   */
  signOut: () => void;

  debugOn: boolean;
  toggleDebug: () => void;

  /** Structured log the debug drawer renders (newest entries appended last). */
  log: LogEntry[];
  /** Latest status message, or null before anything has been reported. */
  status: StatusState | null;
  /** Clear the current app-wide status (e.g. when the user dismisses it). */
  clearStatus: () => void;
  /**
   * The sink the reused integration logic (`lib/*`, `flows/*`) emits through.
   * Appends to `log` and records the latest `status` as React state.
   */
  reporter: Reporter;
}

const AppStateContext = createContext<AppState | null>(null);

let logCounter = 0;
function nextLogId(): string {
  logCounter += 1;
  return `log-${Date.now().toString(36)}-${logCounter}`;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>("platform");
  const [platformAuth, setPlatformAuth] = useState<ApiAuth | null>(null);
  const [platformFundingAccountId, setPlatformFundingAccountId] =
    useState<string>("");
  const [customers, setCustomersState] = useState<ActiveCustomer[]>([]);
  const [activeCustomer, setActiveCustomerState] =
    useState<ActiveCustomer | null>(null);
  // Per-customer session cache, keyed by wallet account id (the session domain).
  // A customer with no accountId has no session slot. `setActiveCustomer` syncs
  // the crypto context (`setActiveSessionAccount`) and surfaces this slot.
  const [sessions, setSessions] = useState<Record<string, unknown>>({});
  const activeKey = activeCustomer?.accountId ?? null;
  const session = activeKey ? sessions[activeKey] ?? null : null;
  const [debugOn, setDebugOn] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<StatusState | null>(null);

  // De-dupe by id and keep newest first so a re-created customer doesn't double
  // up in the table. Stable identity so effects that depend on it don't re-fire.
  const addCustomer = useCallback(
    (customer: ActiveCustomer) =>
      setCustomersState((prev) => [
        customer,
        ...prev.filter((c) => c.id !== customer.id),
      ]),
    [],
  );

  // De-dupe on replace too, so an optimistic add already present in the fetched
  // page doesn't double up. Stable identity (only closes over a setter).
  const setCustomers = useCallback((next: ActiveCustomer[]) => {
    const seen = new Set<string>();
    setCustomersState(
      next.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true))),
    );
  }, []);

  // Switching the active customer must move the crypto session context with it:
  // point `session.ts` at this customer's account (or null → logged-out) so
  // signing material follows the customer, never leaks across them. The cached
  // session slot is then surfaced by the derived `session` above. Stable
  // identity (only closes over a setter) — it's used in effects.
  const setActiveCustomer = useCallback((customer: ActiveCustomer | null) => {
    setActiveSessionAccount(customer?.accountId ?? null);
    setActiveCustomerState(customer);
  }, []);

  // Write the active customer's session slot. Keyed by account id so each
  // customer's session is independent and survives switching away and back.
  // No active account id → nothing to key on, so this is a no-op.
  const setSession = useCallback(
    (next: unknown | null) => {
      if (!activeKey) return;
      setSessions((prev) => ({ ...prev, [activeKey]: next }));
    },
    [activeKey],
  );

  // Local sign-out: wipe the active customer's signing material AND clear their
  // session slot so the view returns to Login. Used by the WalletHome "Sign out"
  // button and by Settings when the session this client uses is revoked.
  const signOut = useCallback(() => {
    if (!activeKey) return;
    clearActiveSession();
    setSessions((prev) => ({ ...prev, [activeKey]: null }));
  }, [activeKey]);

  // The reporter identity is stable across renders so it can be threaded into
  // long-lived flow closures without re-subscribing; the setters it closes over
  // are stable too (React guarantees `setX` identity).
  const reporterRef = useRef<Reporter>({
    log(entry) {
      setLog((prev) => [
        ...prev,
        { id: nextLogId(), ts: Date.now(), ...entry },
      ]);
    },
    status(message, kind = "info") {
      setStatus({ message, kind });
    },
  });

  const toggleDebug = useCallback(() => setDebugOn((prev) => !prev), []);
  const clearStatus = useCallback(() => setStatus(null), []);

  const value = useMemo<AppState>(
    () => ({
      persona,
      setPersona,
      platformAuth,
      setPlatformAuth,
      platformFundingAccountId,
      setPlatformFundingAccountId,
      customers,
      addCustomer,
      setCustomers,
      activeCustomer,
      setActiveCustomer,
      session,
      setSession,
      signOut,
      debugOn,
      toggleDebug,
      log,
      status,
      clearStatus,
      reporter: reporterRef.current,
    }),
    [
      persona,
      platformAuth,
      platformFundingAccountId,
      customers,
      addCustomer,
      setCustomers,
      activeCustomer,
      setActiveCustomer,
      session,
      setSession,
      signOut,
      debugOn,
      toggleDebug,
      log,
      status,
      clearStatus,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within an <AppStateProvider>");
  }
  return ctx;
}
