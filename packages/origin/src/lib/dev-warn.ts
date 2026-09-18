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

const warnedMessages = new Set<string>();

/**
 * Like `devWarn`, but each distinct message fires at most once per module
 * lifetime. Use for warnings emitted from render paths so re-renders (and
 * StrictMode double-invocation) don't spam the console.
 */
export function devWarnOnce(message: string) {
  if (!isDev || warnedMessages.has(message)) {
    return;
  }

  warnedMessages.add(message);
  devWarn(message);
}
