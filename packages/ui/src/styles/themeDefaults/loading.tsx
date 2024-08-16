import { type IconName } from "../../components/Icon/types.js";

export const loadingThemeBase = {
  defaultIconName: "LoadingSpinner" as IconName,
  kinds: {},
};

export type LoadingKind = keyof typeof loadingThemeBase.kinds;
export type LoadingThemeKey = keyof typeof loadingThemeBase;
type LoadingKindsProps = Record<string, Partial<typeof loadingThemeBase>>;

export const defaultLoadingTheme = {
  ...loadingThemeBase,
  kinds: {
    primary: {
      defaultIconName: "LoadingSpinner",
    },
  } as LoadingKindsProps,
};
