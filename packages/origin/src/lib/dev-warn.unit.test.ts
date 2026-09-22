import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { devWarn, devWarnOnce } from "./dev-warn";

describe("devWarn", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("warns on every call", () => {
    devWarn("devWarn repeated message");
    devWarn("devWarn repeated message");
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});

describe("devWarnOnce", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("warns only once per distinct message", () => {
    devWarnOnce("devWarnOnce message A");
    devWarnOnce("devWarnOnce message A");
    devWarnOnce("devWarnOnce message A");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith("devWarnOnce message A");
  });

  it("warns again for a different message", () => {
    devWarnOnce("devWarnOnce message B");
    devWarnOnce("devWarnOnce message C");
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});
