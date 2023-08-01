import { css, Theme } from "@emotion/react";
import styled from "@emotion/styled";
import { Icon } from "@lightsparkdev/ui/icons";
import { type RouteParams } from "@lightsparkdev/ui/router";
import { colors, themeOr } from "@lightsparkdev/ui/styles/colors";
import { getFocusOutline } from "@lightsparkdev/ui/styles/common";
import { ReactNode } from "react";
import { Link } from "../router";
import { Loading } from "./Loading";
import { UnstyledButton } from "./UnstyledButton";

const ButtonSizes = ["sm", "md", "lg"] as const;
type ButtonSize = (typeof ButtonSizes)[number];

export type ButtonProps<RoutesType extends string> = {
  backgroundColor?: string;
  color?: string;
  text: string;
  disabled?: boolean;
  to?: RoutesType | undefined;
  hash?: string;
  href?: string;
  toParams?: RouteParams | undefined;
  primary?: boolean;
  size?: ButtonSize;
  icon?: string;
  loading?: boolean;
  onClick?: (() => void) | undefined;
  mt?: number;
  ml?: number;
  fullWidth?: boolean;
  type?: "button" | "submit";
  blue?: boolean;
  newTab?: boolean;
  zIndex?: number;
};

type PrimaryProps = {
  color?: string | undefined;
  backgroundColor?: string | undefined;
  primary: boolean;
  theme: Theme;
  blue: boolean;
};

function getTextColor({ color, theme, primary, blue }: PrimaryProps) {
  if (color) {
    return color;
  }
  if (blue) {
    return colors.white;
  }
  if (primary) {
    const color = theme.hcNeutralFromBg(theme.hcNeutral);
    return color;
  }
  return theme.text;
}

function getBackgroundColor({
  backgroundColor,
  theme,
  primary,
  blue,
}: PrimaryProps) {
  if (backgroundColor) {
    return backgroundColor;
  }
  if (blue) {
    return colors.blue43;
  }
  if (primary) {
    return themeOr(theme.c9Neutral, colors.white)({ theme });
  }
  return themeOr(colors.white, theme.c1Neutral)({ theme });
}

function getInnerBorderColor({
  backgroundColor,
  theme,
  primary,
  blue,
}: PrimaryProps) {
  if (primary || blue || backgroundColor) {
    return getBackgroundColor({ backgroundColor, theme, primary, blue });
  }
  return themeOr(colors.gray90, colors.gray20)({ theme });
}

const defaultProps = {
  primary: false,
  icon: null,
  loading: false,
  size: "lg" as const,
  disabled: false,
  fullWidth: false,
  type: "button" as const,
  blue: false,
  mt: 0,
  ml: 0,
  newTab: false,
  zIndex: undefined,
};

export function Button<RoutesType extends string>({
  backgroundColor,
  color,
  primary = defaultProps.primary,
  text,
  to,
  hash,
  href,
  toParams,
  onClick,
  icon,
  loading = defaultProps.loading,
  fullWidth = defaultProps.fullWidth,
  disabled = defaultProps.disabled,
  size = defaultProps.size,
  mt = defaultProps.mt,
  ml = defaultProps.ml,
  type = defaultProps.type,
  blue = defaultProps.blue,
  newTab = defaultProps.newTab,
  zIndex = defaultProps.zIndex,
}: ButtonProps<RoutesType>) {
  const iconMarginRight = 6;
  const iconSize = size === "lg" ? 16 : 12;
  let currentIcon = null;
  if (loading) {
    currentIcon = (
      <ButtonIcon>
        <Loading size={iconSize} center={false} />
      </ButtonIcon>
    );
  } else if (icon) {
    currentIcon = (
      <ButtonIcon>
        <Icon name={icon} width={iconSize} />
      </ButtonIcon>
    );
  }

  const content: ReactNode = (
    <div
      css={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {currentIcon}
      <div css={{ textOverflow: "ellipsis", overflow: "hidden" }}>{text}</div>
    </div>
  );

  const commonProps = {
    backgroundColor,
    color,
    type,
    size,
    onClick,
    primary,
    fullWidth,
    blue,
    iconWidth: currentIcon ? iconSize + iconMarginRight : 0,
    isLoading: loading,
    disabled: disabled || loading,
    css: {
      marginTop: mt ? `${mt}px` : undefined,
      marginLeft: ml ? `${ml}px` : undefined,
    },
    newTab,
    zIndex,
  };

  if (to) {
    return (
      <ButtonLink {...commonProps} to={to} params={toParams} hash={hash}>
        {content}
      </ButtonLink>
    );
  }

  return href ? (
    <ButtonHrefLink {...commonProps} href={href} target="_blank">
      {content}
    </ButtonHrefLink>
  ) : (
    <StyledButton {...commonProps}>{content}</StyledButton>
  );
}

Button.defaultProps = defaultProps;

type StyledButtonProps = {
  backgroundColor?: string | undefined;
  color?: string | undefined;
  primary: boolean;
  size: ButtonSize;
  disabled: boolean;
  fullWidth: boolean;
  isLoading: boolean;
  blue: boolean;
  iconWidth: number;
  newTab: boolean;
  zIndex?: number | undefined;
};

const hPaddingPx = 24;
const buttonStyle = ({
  color,
  backgroundColor,
  theme,
  primary,
  disabled,
  isLoading,
  size,
  fullWidth,
  iconWidth,
  blue,
  zIndex,
}: StyledButtonProps & { theme: Theme }) => css`
  display: inline-flex;
  opacity: ${disabled && !isLoading ? 0.2 : 1};
  transition: opacity 0.2s;
  position: relative;

  ${zIndex && `z-index: ${zIndex};`}

  color: ${getTextColor({ color, theme, primary, blue })};
  font-size: ${["lg", "md"].includes(size) ? "14px" : "12px"};
  font-weight: 600;

  &:focus-visible {
    outline: ${getFocusOutline({ theme })};
  }

  ${fullWidth && "width: 100%;"}

  & > * {
    width: 100%;
    text-align: center;
    white-space: nowrap;
    background-color: ${getBackgroundColor({
      backgroundColor,
      theme,
      primary,
      blue,
    })};
    border: 1px solid;
    border-color: ${getInnerBorderColor({
      backgroundColor,
      theme,
      primary,
      blue,
    })};
    border-radius: 32px;
    padding: ${size === "lg"
      ? `14px ${hPaddingPx}px 14px ${
          hPaddingPx + (iconWidth ? iconWidth + 6 : 0)
        }px`
      : size === "md"
      ? "9px 18px"
      : "6px 16px"};
    color: ${getTextColor({ color, theme, primary, blue })};
  }
`;

const ButtonIcon = styled.div`
  position: absolute;
  left: ${hPaddingPx}px;
`;

export const StyledButton = styled(UnstyledButton)<StyledButtonProps>`
  ${(props) => buttonStyle(props)}
`;
const ButtonLink = styled(Link)<StyledButtonProps>`
  ${(props) => buttonStyle(props)}
`;
const ButtonHrefLink = styled.a<StyledButtonProps>`
  ${(props) => buttonStyle(props)}
`;

export const ButtonSelector = (prepend = "", append = "") =>
  `${prepend}${StyledButton}${append}, ${prepend}${ButtonLink}${append}, ${prepend}${ButtonHrefLink}${append}`;
