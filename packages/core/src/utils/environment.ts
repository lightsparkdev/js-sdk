export const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

export const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

export const isTest = isNode && process.env.NODE_ENV === "test";
