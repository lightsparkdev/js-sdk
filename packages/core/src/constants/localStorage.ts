export const ConfigKeys = {
  LoggingEnabled: "lightspark-logging-enabled",
  ConsoleToolsEnabled: "lightspark-console-tools-enabled",
} as const;
export type ConfigKeys = (typeof ConfigKeys)[keyof typeof ConfigKeys];

export const getLocalStorageConfigItem = (key: ConfigKeys) => {
  return getLocalStorageBoolean(key);
};

export const getLocalStorageBoolean = (key: string) => {
  /* localStorage is not available in all contexts, use try/catch: */
  try {
    return localStorage.getItem(key) === "1";
  } catch (e) {
    return false;
  }
};
