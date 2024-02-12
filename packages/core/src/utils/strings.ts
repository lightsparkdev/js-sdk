export function lsidToUUID(lsid: string) {
  return lsid.replace(/^[^:]+:(.*)$/, "$1");
}
