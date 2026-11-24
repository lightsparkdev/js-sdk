export const DEV_GRID_URL = "https://api.dev.dev.sparkinfra.net";

const PRODUCTION_GRID_HOST = "api.lightspark.com";

/** True when `url` points at the production Grid API host. */
export function isProductionGridUrl(url: string): boolean {
  try {
    return new URL(url).hostname === PRODUCTION_GRID_HOST;
  } catch {
    return false;
  }
}
