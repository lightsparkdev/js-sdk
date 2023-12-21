/** @jsxImportSource @emotion/react */
import type { Theme } from "@emotion/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import type { ReactNode } from "react";
import { Link, type RouteParams } from "../router.js";
import { colors, themeOr } from "../styles/colors.js";
import { getFocusOutline } from "../styles/common.js";
import { select } from "../utils/emotion.js";
import { Icon } from "./Icon.js";
import { Loading } from "./Loading.js";
import { UnstyledButton } from "./UnstyledButton.js";

const ButtonSizes = ["sm", "md", "lg"] as const;
type ButtonSize = (typeof ButtonSizes)[number];

type IconSide = "left" | "right";

export type ButtonProps<RoutesType extends string> = {
  backgroundColor?: string;
  color?: string;
  hoverColor?: string;
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
  iconSide?: IconSide;
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
  iconSide?: IconSide | undefined;
  iconWidth?: number;
  text?: string | undefined;
  ghost: boolean;
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

function getPaddingX({ size, ghost }: { size: ButtonSize; ghost?: boolean }) {
  return ghost ? 0 : size === "lg" ? hPaddingPx : size === "md" ? 18 : 16;
}

function getPadding({ iconWidth, size, ghost, iconSide }: PaddingProps) {
  const paddingY = ghost ? 0 : size === "lg" ? 14 : size === "md" ? 9 : 6;
  const paddingX = getPaddingX({ size, ghost });
  const paddingForIcon = iconWidth && !ghost ? iconWidth : 0;
  return `${paddingY}px ${
    paddingX + (iconSide === "right" ? paddingForIcon : 0)
  }px ${paddingY}px ${paddingX + (iconSide === "left" ? paddingForIcon : 0)}px`;
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
  hoverColor,
  primary = false,
  ghost = false,
  text,
  to,
  hash,
  href,
  toParams,
  onClick,
  icon,
  iconSide = "left",
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
      <ButtonIcon ghost={ghost} iconSide={iconSide} text={text} size={size}>
        <Loading size={iconSize} center={false} />
      </ButtonIcon>
    );
  } else if (icon) {
    currentIcon = (
      <ButtonIcon ghost={ghost} iconSide={iconSide} text={text} size={size}>
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
      {iconSide === "left" && currentIcon}
      <div
        css={{
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {text}
      </div>
      {iconSide === "right" && currentIcon}
    </div>
  );

  const commonProps = {
    backgroundColor,
    color,
    hoverColor,
    type,
    size,
    onClick,
    primary,
    ghost,
    fullWidth,
    blue,
    iconSide,
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
  hoverColor?: string | undefined;
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
  iconSide?: IconSide | undefined;
};

const hPaddingPx = 24;
const buttonStyle = ({
  color,
  backgroundColor,
  hoverColor,
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
  iconSide,
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

  width: ${fullWidth ? "100%" : "fit-content"};

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
    padding: ${getPadding({ size, iconWidth, text, ghost, iconSide })};
    color: ${getTextColor({ color, theme, primary, blue })};
    transition:
      background-color 0.2s ease-out,
      border-color 0.2s ease-out;

    &:hover {
      ${hoverColor && ghost
        ? ""
        : `background-color: ${hoverColor}; border-color: ${hoverColor};`}
    }
  }
`;

interface ButtonIconProps {
  ghost: boolean;
  iconSide?: IconSide | undefined;
  text?: string | undefined;
  size: ButtonSize;
}

const ButtonIcon = styled.div<ButtonIconProps>`
  ${(props) => (props.ghost ? "" : "position: absolute;")}
  ${({ iconSide, ghost, text, size }) =>
    `${iconSide}: ${ghost && text ? 0 : getPaddingX({ size, ghost })}px;`}
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
  `${prepend}${select(StyledButton)}${append}, ${prepend}${select(
    ButtonLink,
  )}${append}, ${prepend}${select(ButtonHrefLink)}${append}`;
