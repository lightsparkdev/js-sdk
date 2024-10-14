import * as icons from "../../icons/index.js";

export const iconMap = {
  ...icons,
} as const;

export type IconName = keyof typeof iconMap;
