import { type ConfigKeys } from "../constants/index.js";

export function getLocalStorageConfigItem(key: ConfigKeys) {
  const localStorageBoolean = getLocalStorageBoolean(key);
  // If config not set, just default to false
  if (localStorageBoolean == null) {
    return false;
  }

  return localStorageBoolean;
}

export function getLocalStorageBoolean(key: string) {
  /* localStorage is not available in all contexts, use try/catch: */
  try {
    if (localStorage.getItem(key) === "1") {
      return true;
    }
    // Key is not set
    else if (localStorage.getItem(key) == null) {
      return null;
    }
    // Key is set but not "1"
    else {
      return false;
    }
  } catch (e) {
    return null;
  }
}

export function setLocalStorageBoolean(key: string, value: boolean) {
  /* localStorage is not available in all contexts, use try/catch: */
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch (e) {
    // ignore
  }
}

export const deleteLocalStorageItem = (key: string) => {
  /* localStorage is not available in all contexts, use try/catch: */
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignore
  }
};
