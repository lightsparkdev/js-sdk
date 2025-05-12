export function isUint8Array(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}

export function isObject(value: unknown): value is object {
  const type = typeof value;
  return value != null && (type == "object" || type == "function");
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}
