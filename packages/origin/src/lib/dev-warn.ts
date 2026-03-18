const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

export function devWarn(...messages: unknown[]) {
  if (!isDev) {
    return;
  }

  const logger =
    typeof globalThis !== "undefined" &&
    typeof globalThis.console !== "undefined"
      ? globalThis.console
      : undefined;

  if (logger && typeof logger.warn === "function") {
    logger.warn(...messages);
  }
}
