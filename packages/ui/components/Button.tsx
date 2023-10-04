/** @jsxImportSource @emotion/react */
import type { Theme } from "@emotion/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Icon } from "@lightsparkdev/ui/icons";
import { type RouteParams } from "@lightsparkdev/ui/router";
import { colors, themeOr } from "@lightsparkdev/ui/styles/colors";
import { getFocusOutline } from "@lightsparkdev/ui/styles/common";
import type { ReactNode } from "react";
import { Link } from "../router";
import { Loading } from "./Loading";
import { UnstyledButton } from "./UnstyledButton";

const ButtonSizes = ["sm", "md", "lg"] as const;
type ButtonSize = (typeof ButtonSizes)[number];

export type ButtonProps<RoutesType extends string> = {
  backgroundColor?: string;
  color?: string;
  text?: string;
  disabled?: boolean | undefined;
  to?: RoutesType | undefined;
  hash?: string;
  href?: string;
  toParams?: RouteParams | undefined;
  primary?: boolean | undefined;
  ghost?: boolean | undefined;
  size?: ButtonSize;
  icon?: string;
  loading?: boolean | undefined;
  onClick?: (() => void) | undefined;
  mt?: number;
  ml?: number;
  fullWidth?: boolean | undefined;
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
  ghost?: boolean | undefined;
};

type PaddingProps = {
  size: ButtonSize;
  iconWidth?: number;
  text?: string | undefined;
  ghost?: boolean | undefined;
};

type BorderProps = {
  ghost?: boolean;
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
  ghost,
}: PrimaryProps) {
  if (ghost) {
    return "none";
  }
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

function getPadding({ iconWidth, size, text, ghost }: PaddingProps) {
  if (ghost) {
    return "0";
  }

  const paddingForText = text ? 6 : 0;
  return size === "lg"
    ? `14px ${hPaddingPx}px 14px ${
        hPaddingPx + (iconWidth ? iconWidth + paddingForText : 0)
      }px`
    : size === "md"
    ? "9px 18px"
    : "6px 16px";
}

function getBorder({ ghost }: BorderProps) {
  if (ghost) {
    return "none";
  }
  return "1px solid";
}

function getInnerBorderColor({
  backgroundColor,
  theme,
  primary,
  blue,
}: PrimaryProps) {
  if (primary || blue || backgroundColor) {
    return getBackgroundColor({
      backgroundColor,
      theme,
      primary,
      blue,
    });
  }
  return themeOr(colors.gray90, colors.gray20)({ theme });
}

export function Button<RoutesType extends string>({
  backgroundColor,
  color,
  primary = false,
  ghost = false,
  text,
  to,
  hash,
  href,
  toParams,
  onClick,
  icon,
  loading = false,
  fullWidth = false,
  disabled = false,
  size = "lg",
  mt = 0,
  ml = 0,
  type = "button",
  blue = false,
  newTab = false,
  zIndex = undefined,
}: ButtonProps<RoutesType>) {
  const iconMarginRight = 6;
  const iconSize = size === "lg" ? 16 : 12;
  let currentIcon = null;
  if (loading) {
    currentIcon = (
      <ButtonIcon ghost={ghost}>
        <Loading size={iconSize} center={false} />
      </ButtonIcon>
    );
  } else if (icon) {
    currentIcon = (
      <ButtonIcon ghost={ghost}>
        <Icon name={icon} width={iconSize} />
      </ButtonIcon>
    );
  }

  const content: ReactNode = (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {currentIcon}
      <div
        css={{
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {text}
      </div>
    </div>
  );

  const commonProps = {
    backgroundColor,
    color,
    type,
    size,
    onClick,
    primary,
    ghost,
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
    text,
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

type StyledButtonProps = {
  backgroundColor?: string | undefined;
  color?: string | undefined;
  primary: boolean;
  ghost: boolean;
  size: ButtonSize;
  disabled: boolean;
  fullWidth: boolean;
  isLoading: boolean;
  blue: boolean;
  iconWidth: number;
  newTab: boolean;
  text?: string | undefined;
  zIndex?: number | undefined;
};

const hPaddingPx = 24;
const buttonStyle = ({
  color,
  backgroundColor,
  theme,
  primary,
  ghost,
  disabled,
  isLoading,
  size,
  fullWidth,
  iconWidth,
  blue,
  text,
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
      ghost,
    })};
    border: ${getBorder({ ghost })};
    border-color: ${getInnerBorderColor({
      backgroundColor,
      theme,
      primary,
      blue,
    })};
    border-radius: 32px;
    padding: ${getPadding({ size, iconWidth, text, ghost })};
    color: ${getTextColor({ color, theme, primary, blue })};
  }
`;

interface ButtonIconProps {
  ghost?: boolean | undefined;
}

const ButtonIcon = styled.div<ButtonIconProps>`
  position: absolute;
  ${(props) => (props.ghost ? "" : `left: ${hPaddingPx}px;`)}
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
