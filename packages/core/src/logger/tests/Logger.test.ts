import { afterEach, beforeEach, jest } from "@jest/globals";

import { Logger, LoggingLevel } from "../Logger.js";

describe("Logger", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("parses supported level name casings (UPPER, lower, Title)", () => {
    const logger = new Logger("test", { enabled: false, timestamps: false });

    logger.setOptions({ level: "TRACE" });
    expect(logger.options.level).toBe(LoggingLevel.Trace);

    logger.setOptions({ level: "trace" });
    expect(logger.options.level).toBe(LoggingLevel.Trace);

    logger.setOptions({ level: "Trace" });
    expect(logger.options.level).toBe(LoggingLevel.Trace);

    logger.setOptions({ level: "DEBUG" });
    expect(logger.options.level).toBe(LoggingLevel.Debug);
  });

  it("throws on unsupported mixed-case strings at runtime", () => {
    const logger = new Logger("test", { enabled: false, timestamps: false });

    expect(() =>
      logger.setOptions({ level: "tRaCe" as unknown as "TRACE" }),
    ).toThrow(/Invalid LoggingLevelName casing/);
  });

  it("debug only logs when enabled and level is Trace or Debug", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const logger = new Logger("ctx", {
      enabled: true,
      timestamps: false,
      level: LoggingLevel.Info,
    });

    // Clear the constructor's "Logging enabled" message.
    logSpy.mockClear();

    logger.debug("hi");
    expect(logSpy).not.toHaveBeenCalled();

    logger.setOptions({ level: LoggingLevel.Debug });
    logger.debug("hi");
    expect(logSpy).toHaveBeenCalledWith("[ctx] hi");
  });
});
