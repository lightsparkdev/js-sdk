import { type ConfigKeys } from "../constants/index.js";

export function getLocalStorageConfigItem(key: ConfigKeys) {
  return getLocalStorageBoolean(key);
}

export function getLocalStorageBoolean(key: string) {
  /* localStorage is not available in all contexts, use try/catch: */
  try {
    return localStorage.getItem(key) === "1";
  } catch (e) {
    return false;
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
