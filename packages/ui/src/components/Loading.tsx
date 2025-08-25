import { useTheme, type Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { type LoadingThemeKey } from "../styles/themeDefaults/loading.js";
import { type FontColorKey } from "../styles/themes.js";
import { Icon } from "./Icon/Icon.js";

export const loadingKinds = ["primary", "secondary"] as const;
export type LoadingKind = (typeof loadingKinds)[number];

type Props = {
  center?: boolean;
  size?: number;
  ml?: number;
  mt?: number;
  kind?: LoadingKind;
  color?: FontColorKey | undefined;
};

export function Loading({
  center = true,
  size = 60,
  ml = 0,
  mt = 0,
  kind = "primary",
  color = undefined,
}: Props) {
  const theme = useTheme();
  const iconName = resolveLoadingProp(null, kind, "defaultIconName", theme);

  return (
    <LoadingWrapper center={center} ml={ml} mt={mt}>
      <Rotate>
        <Icon name={iconName} width={size} color={color} />
      </Rotate>
    </LoadingWrapper>
  );
}

export const LoadingWrapper = styled.div<{
  center: boolean;
  ml: number;
  mt: number;
}>`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  margin-left: ${({ ml }) => ml}px;
  margin-top: ${({ mt }) => mt}px;

  ${({ center }) =>
    center &&
    `
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0 !important;
  `}
`;

const Rotate = styled.div`
  display: inline-flex;
  animation: rotate 0.5s linear infinite;

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

function resolveLoadingProp<T, K extends LoadingThemeKey>(
  prop: T,
  kind: LoadingKind,
  defaultKey: K,
  theme: Theme,
) {
  return (
    /** props may be unset for a given kind but theme defaults always exist,
     * so this will always resolve a value: */
    prop || theme.loading.kinds[kind]?.[defaultKey] || theme.loading[defaultKey]
  );
}
