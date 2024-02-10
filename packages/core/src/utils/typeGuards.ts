export function isUint8Array(variable: unknown): variable is Uint8Array {
  return variable instanceof Uint8Array;
}
