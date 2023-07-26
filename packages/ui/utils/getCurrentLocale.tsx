export function getCurrentLocale() {
  return Intl.NumberFormat().resolvedOptions().locale;
}
