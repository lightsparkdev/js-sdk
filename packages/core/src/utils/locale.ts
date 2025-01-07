/* locale utils for both NodeJS and browser contexts */

export function getCurrentLocale() {
  return Intl.NumberFormat().resolvedOptions().locale;
}
