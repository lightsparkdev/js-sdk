import { isBrowser } from "./index.js";

export class Logger {
  context: string;
  loggingEnabled = false;

  constructor(loggerContext: string) {
    this.context = loggerContext;
    if (isBrowser) {
      try {
        this.loggingEnabled = Boolean(
          localStorage.getItem("lightspark-logging-enabled"),
        );
      } catch (e) {
        /* ignore */
      }
    }
  }

  info(message: string, ...rest: unknown[]) {
    if (this.loggingEnabled) {
      console.log(`[${this.context}] ${message}`, ...rest);
    }
  }
}

export const logger = new Logger("@lightsparkdev/core");
