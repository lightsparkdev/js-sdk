import { describe, expect, it } from "vitest";

import { createCollectingReporter } from "../collecting-reporter";
import type { LogEntry } from "../reporter";

describe("createCollectingReporter", () => {
  it("records log entries in the order they were reported", () => {
    const collector = createCollectingReporter();

    collector.reporter.log({ level: "request", label: "POST /customers" });
    collector.reporter.log({ level: "response", label: "201 Created" });
    collector.reporter.log({ level: "info", label: "done" });

    expect(collector.entries.map((e) => e.label)).toEqual([
      "POST /customers",
      "201 Created",
      "done",
    ]);
    expect(collector.entries.map((e) => e.level)).toEqual([
      "request",
      "response",
      "info",
    ]);
  });

  it("assigns a unique id and a numeric timestamp to each entry", () => {
    const collector = createCollectingReporter();
    const before = Date.now();

    collector.reporter.log({ level: "info", label: "a" });
    collector.reporter.log({ level: "info", label: "b" });

    const after = Date.now();
    const [first, second] = collector.entries;

    expect(typeof first.id).toBe("string");
    expect(first.id).not.toEqual("");
    expect(first.id).not.toEqual(second.id);

    expect(typeof first.ts).toBe("number");
    expect(first.ts).toBeGreaterThanOrEqual(before);
    expect(first.ts).toBeLessThanOrEqual(after);
  });

  it("preserves the level, label, and raw detail payload", () => {
    const collector = createCollectingReporter();
    const detail = { id: "wallet-123", nested: { code: 202 } };

    collector.reporter.log({ level: "response", label: "verify", detail });

    const entry: LogEntry = collector.entries[0];
    expect(entry.level).toBe("response");
    expect(entry.label).toBe("verify");
    expect(entry.detail).toEqual(detail);
  });

  it("surfaces the latest status message and kind", () => {
    const collector = createCollectingReporter();

    expect(collector.lastStatus).toBeNull();

    collector.reporter.status("Creating customer...");
    expect(collector.lastStatus).toEqual({
      message: "Creating customer...",
      kind: "info",
    });

    collector.reporter.status("Failed", "error");
    expect(collector.lastStatus).toEqual({ message: "Failed", kind: "error" });
  });

  it("defaults the status kind to info when omitted", () => {
    const collector = createCollectingReporter();

    collector.reporter.status("hello");

    expect(collector.lastStatus?.kind).toBe("info");
  });
});
