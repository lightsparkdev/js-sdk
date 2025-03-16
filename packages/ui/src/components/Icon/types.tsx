import * as centralIcons from "../../icons/central/index.js";
import * as icons from "../../icons/index.js";

export const iconMap = {
  ...icons,
  ...centralIcons,
} as const;

export type IconName = keyof typeof iconMap;
