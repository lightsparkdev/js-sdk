// The output sink the integration logic talks to instead of the DOM.
//
// Every lib/flow module that used to call `ui.addLog(...)` / `ui.showStatus(...)`
// now takes a `Reporter` and emits structured `LogEntry`s + status messages
// through it. The renderer (React store, a collecting test double, etc.) owns
// what to do with them — keeping the integration logic DOM-free and reusable.

export type LogEntry = {
  id: string;
  ts: number;
  level: "info" | "error" | "request" | "response";
  label: string;
  detail?: unknown; // raw payload / IDs / JSON, shown only in debug mode
};

export interface Reporter {
  log(entry: Omit<LogEntry, "id" | "ts">): void;
  status(message: string, kind?: "info" | "error" | "success"): void;
}
