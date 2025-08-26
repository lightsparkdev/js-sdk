declare global {
  const Bare: unknown;
}

export const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

export const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

export const isTest = isNode && process.env.NODE_ENV === "test";

/* https://github.com/holepunchto/which-runtime/blob/main/index.js */
export const isBare = typeof Bare !== "undefined";

export const isReactNative =
  typeof navigator !== "undefined" && navigator.product === "ReactNative";
