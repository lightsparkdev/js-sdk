import { ConfigKeys, getLocalStorageConfigItem } from "./index.js";
import { isBrowser, isTest } from "./utils/environment.js";

type GetLoggingEnabled = (() => Promise<boolean> | boolean) | undefined;

export enum LoggingLevel {
  Trace,
  Info,
}

export class Logger {
  context: string;
  loggingEnabled = false;
  loggingLevel: LoggingLevel = LoggingLevel.Info;

  constructor(loggerContext: string, getLoggingEnabled?: GetLoggingEnabled) {
    this.context = loggerContext;
    void this.updateLoggingEnabled(getLoggingEnabled);
  }

  public setLevel(level: LoggingLevel) {
    this.loggingLevel = level;
  }

  async updateLoggingEnabled(getLoggingEnabled: GetLoggingEnabled) {
    if (getLoggingEnabled) {
      this.loggingEnabled = await getLoggingEnabled();
    } else if (isTest) {
      this.loggingEnabled = true;
    } else if (isBrowser) {
      try {
        this.loggingEnabled = getLocalStorageConfigItem(
          ConfigKeys.LoggingEnabled,
        );
      } catch (e) {
        /* ignore */
      }
    }

    if (this.loggingEnabled) {
      console.log(`[${this.context}] Logging enabled`);
    }
  }

  trace(message: string, ...rest: unknown[]) {
    if (this.loggingEnabled && this.loggingLevel === LoggingLevel.Trace) {
      console.log(`[${this.context}] ${message}`, ...rest);
    }
  }

  info(message: string, ...rest: unknown[]) {
    if (this.loggingEnabled && this.loggingLevel <= LoggingLevel.Info) {
      console.log(`[${this.context}] ${message}`, ...rest);
    }
  }
}

export const logger = new Logger("@lightsparkdev/core");
