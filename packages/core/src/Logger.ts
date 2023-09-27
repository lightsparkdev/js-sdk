import { isBrowser } from "./index.js";

type GetLoggingEnabled = (() => Promise<boolean> | boolean) | undefined;

export class Logger {
  context: string;
  loggingEnabled = false;

  constructor(loggerContext: string, getLoggingEnabled?: GetLoggingEnabled) {
    this.context = loggerContext;
    this.updateLoggingEnabled(getLoggingEnabled);
  }

  async updateLoggingEnabled(getLoggingEnabled: GetLoggingEnabled) {
    if (getLoggingEnabled) {
      this.loggingEnabled = await getLoggingEnabled();
    } else if (isBrowser) {
      try {
        this.loggingEnabled =
          localStorage.getItem("lightspark-logging-enabled") === "1";
      } catch (e) {
        /* ignore */
      }
    }

    if (this.loggingEnabled) {
      console.log(`[${this.context}] Logging enabled`);
    }
  }

  info(message: string, ...rest: unknown[]) {
    if (this.loggingEnabled) {
      console.log(`[${this.context}] ${message}`, ...rest);
    }
  }
}

export const logger = new Logger("@lightsparkdev/core");
