// A `Reporter` that simply collects what it's told, for tests and any non-React
// consumer. The React store has its own state-backed reporter; this one keeps
// the recorded entries + latest status in plain arrays/fields you can assert on.

import type { LogEntry, Reporter } from "./reporter";

export type StatusKind = "info" | "error" | "success";

export interface ReportedStatus {
  message: string;
  kind: StatusKind;
}

export interface CollectingReporter {
  reporter: Reporter;
  entries: LogEntry[];
  lastStatus: ReportedStatus | null;
}

let counter = 0;

function nextId(): string {
  counter += 1;
  return `log-${Date.now().toString(36)}-${counter}`;
}

export function createCollectingReporter(): CollectingReporter {
  const collector: CollectingReporter = {
    entries: [],
    lastStatus: null,
    reporter: {
      log(entry) {
        collector.entries.push({ id: nextId(), ts: Date.now(), ...entry });
      },
      status(message, kind = "info") {
        collector.lastStatus = { message, kind };
      },
    },
  };
  return collector;
}
