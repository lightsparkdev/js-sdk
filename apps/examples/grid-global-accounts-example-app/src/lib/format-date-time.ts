// Session lifetimes can be minutes long, so a session's expiry shows its time
// as well as its date.
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}
