import { ConfigKeys } from "../constants/index.js";
import { isBrowser, isTest } from "../utils/environment.js";
import { getLocalStorageConfigItem } from "../utils/localStorage.js";

export enum LoggingLevel {
  Trace,
  Debug,
  Info,
  Warn,
  Error,
}

type LoggingLevelNameUppercase = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR";

export type LoggingLevelName =
  | LoggingLevelNameUppercase
  | Lowercase<LoggingLevelNameUppercase>
  | Capitalize<Lowercase<LoggingLevelNameUppercase>>;

const LOGGING_LEVEL_FROM_NAME: Record<LoggingLevelNameUppercase, LoggingLevel> =
  {
    TRACE: LoggingLevel.Trace,
    DEBUG: LoggingLevel.Debug,
    INFO: LoggingLevel.Info,
    WARN: LoggingLevel.Warn,
    ERROR: LoggingLevel.Error,
  };

function getLoggingLevelFromName(name: LoggingLevelName): LoggingLevel {
  const upper = name.toUpperCase();
  const lower = upper.toLowerCase();
  const title = `${lower[0]?.toUpperCase() ?? ""}${lower.slice(1)}`;

  // Runtime guard to match the exported type: support UPPER, lower, and Title case.
  if (name !== upper && name !== lower && name !== title) {
    throw new Error(
      `Invalid LoggingLevelName casing (expected UPPER, lower, or Title): ${name}`,
    );
  }

  if (upper in LOGGING_LEVEL_FROM_NAME) {
    return LOGGING_LEVEL_FROM_NAME[upper as LoggingLevelNameUppercase];
  }

  // Should be unreachable when callers use the exported type, but keep a guard.
  throw new Error(`Invalid LoggingLevelName: ${name}`);
}

export type LoggerOptions = {
  enabled: boolean;
  timestamps: boolean;
  level: LoggingLevel;
};

export type LoggingLevelArg = LoggingLevel | LoggingLevelName;

export type LoggerOptionsArg = Partial<Omit<LoggerOptions, "level">> & {
  level?: LoggingLevelArg;
};

export class Logger {
  context: string;
  options: LoggerOptions = {
    enabled: false,
    timestamps: true,
    level: LoggingLevel.Info,
  };

  constructor(loggerContext: string, loggerOptions: LoggerOptionsArg = {}) {
    this.context = loggerContext;
    this.setOptions(loggerOptions);
    this.updateLoggingEnabled(loggerOptions);
  }

  public setLevel(level: LoggingLevel) {
    this.options.level = level;
  }

  public setEnabled(enabled: boolean, level: LoggingLevel = LoggingLevel.Info) {
    this.options.enabled = enabled;
    this.options.level = level;
  }

  public setOptions(options: LoggerOptionsArg) {
    if (options.enabled !== undefined) {
      this.options.enabled = options.enabled;
    }
    if (options.timestamps !== undefined) {
      this.options.timestamps = options.timestamps;
    }
    if (options.level !== undefined) {
      this.options.level =
        typeof options.level === "string"
          ? getLoggingLevelFromName(options.level)
          : options.level;
    }
  }

  private updateLoggingEnabled(loggerOptions: LoggerOptionsArg) {
    if (loggerOptions.enabled !== undefined) {
      this.options.enabled = loggerOptions.enabled;
    } else if (isTest) {
      this.options.enabled = true;
    } else if (isBrowser) {
      try {
        this.options.enabled = getLocalStorageConfigItem(
          ConfigKeys.LoggingEnabled,
        );
      } catch {
        /* ignore */
      }
    }

    if (this.options.enabled) {
      console.log(this.formatMessage("Logging enabled"));
    }
  }

  private getTimestamp() {
    if (this.options.timestamps) {
      return `${new Date().toISOString()} `;
    }
    return "";
  }

  private formatMessage(message: string) {
    return `${this.getTimestamp()}[${this.context}] ${message}`;
  }

  trace(message: string, ...rest: unknown[]) {
    if (this.options.enabled && this.options.level <= LoggingLevel.Trace) {
      console.log(this.formatMessage(message), ...rest);
    }
  }

  debug(message: string, ...rest: unknown[]) {
    if (this.options.enabled && this.options.level <= LoggingLevel.Debug) {
      console.log(this.formatMessage(message), ...rest);
    }
  }

  info(message: string, ...rest: unknown[]) {
    if (this.options.enabled && this.options.level <= LoggingLevel.Info) {
      console.log(this.formatMessage(message), ...rest);
    }
  }

  warn(message: string, ...rest: unknown[]) {
    if (this.options.enabled && this.options.level <= LoggingLevel.Warn) {
      console.warn(this.formatMessage(message), ...rest);
    }
  }

  error(message: string, ...rest: unknown[]) {
    if (this.options.enabled && this.options.level <= LoggingLevel.Error) {
      console.error(this.formatMessage(message), ...rest);
    }
  }
}

export const logger = new Logger("@lightsparkdev/core");
