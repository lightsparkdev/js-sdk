import { useAppState } from "../state/store";
import { DismissibleAlert } from "./DismissibleAlert";

/**
 * The transient, app-wide status line fed by `reporter.status(...)` (e.g.
 * "Payment executed.", errors), shown at the top of each persona view and
 * dismissable — clicking ✕ clears it via `clearStatus`.
 */
export function StatusBanner() {
  const { status, clearStatus } = useAppState();
  if (!status) return null;
  return (
    <DismissibleAlert
      variant={status.kind === "error" ? "critical" : "default"}
      title={status.message}
      onClose={clearStatus}
    />
  );
}
