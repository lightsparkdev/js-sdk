export const ConfigKeys = {
  LoggingEnabled: "lightspark-logging-enabled",
  ConsoleToolsEnabled: "lightspark-console-tools-enabled",
} as const;
export type ConfigKeys = (typeof ConfigKeys)[keyof typeof ConfigKeys];
