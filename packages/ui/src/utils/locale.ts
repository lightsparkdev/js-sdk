export function getCurrentBaseLanguage() {
  const userLocale = navigator.language; // e.g. "es-MX"
  const locale = new Intl.Locale(userLocale);
  return locale.language; // e.g. "es"
}
