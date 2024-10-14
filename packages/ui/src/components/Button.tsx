/** @jsxImportSource @emotion/react */
import type { Theme } from "@emotion/react";
import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { uniqueId } from "lodash-es";
import { Fragment, useRef, type ComponentProps } from "react";
import { Link, type RouteParams } from "../router.js";
import { getFocusOutline } from "../styles/common.js";
import {
  type AllowedButtonTypographyTypes,
  type ButtonBorderRadius,
  type ButtonTypographyArgs,
  type ButtonsThemeKey,
  type PaddingYKey,
} from "../styles/themeDefaults/buttons.js";
import {
  getBackgroundColor,
  isThemeOrColorKey,
  type ThemeOrColorKey,
} from "../styles/themes.js";
import { TokenSize, type TokenSizeKey } from "../styles/tokens/typography.js";
import { applyTypography } from "../styles/typography.js";
import { type NewRoutesType } from "../types/index.js";
import { select } from "../utils/emotion.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";
import { Loading, type LoadingKind } from "./Loading.js";
import { Tooltip } from "./Tooltip.js";
import { UnstyledButton } from "./UnstyledButton.js";
import { renderTypography } from "./typography/renderTypography.js";

type IconSide = "left" | "right";

export const buttonKinds = [
  "secondary",
  "primary",
  "ghost",
  "transparent",
  "green33",
  "purple55",
  "blue43",
  "blue39",
  "linkLight",
  "danger",
  "warning",
  "tertiary",
] as const;
export type ButtonKind = (typeof buttonKinds)[number];

export type ButtonProps = {
  kind?: ButtonKind | undefined;
  typography?: ButtonTypographyArgs | undefined;
  size?: TokenSizeKey;
  paddingY?: PaddingYKey | undefined;
  text?: string | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  to?: NewRoutesType | undefined;
  hash?: string | undefined;
  externalLink?: string | undefined;
  filename?: string | undefined;
  toParams?: RouteParams | undefined;
  icon?: IconName | undefined;
  iconSide?: IconSide;
  loading?: boolean | undefined;
  loadingKind?: LoadingKind | undefined;
  onClick?: (() => void) | undefined;
  mt?: number;
  ml?: number;
  fullWidth?: boolean | undefined;
  type?: "button" | "submit";
  newTab?: boolean;
  tooltipText?: string | undefined;
  zIndex?: number | undefined;
  borderRadius?: ButtonBorderRadius | undefined;
};

type PaddingProps = {
  paddingY: number;
  size: TokenSizeKey;
  iconSide?: IconSide | undefined;
  isRound: boolean;
  kind: ButtonKind;
};

const roundPaddingsX = {
  [TokenSize.ExtraSmall]: 10,
  [TokenSize.Small]: 10,
  [TokenSize.Schmedium]: 10,
  [TokenSize.Medium]: 14,
  [TokenSize.Mlarge]: 19,
  [TokenSize.Large]: 19,
} as const;

const paddingsX = {
  [TokenSize.ExtraSmall]: 16,
  [TokenSize.Small]: 24,
  [TokenSize.Schmedium]: 24,
  [TokenSize.Medium]: 24,
  [TokenSize.Mlarge]: 24,
  [TokenSize.Large]: 24,
} as const;

function getPaddingX(size: TokenSizeKey, kind: ButtonKind, isRound: boolean) {
  return kind === "ghost"
    ? 0
    : isRound
    ? roundPaddingsX[size]
    : paddingsX[size];
}

function getPadding({ paddingY, kind, size, iconSide, isRound }: PaddingProps) {
  const paddingX = getPaddingX(size, kind, isRound);
  const paddingForIcon = 0;
  return kind === "ghost"
    ? 0
    : `${paddingY}px ${
        paddingX + (iconSide === "right" ? paddingForIcon : 0)
      }px ${paddingY}px ${
        paddingX + (iconSide === "left" ? paddingForIcon : 0)
      }px`;
}

function resolveBackgroundColorKey(
  theme: Theme,
  kind: ButtonKind,
  defaultKey:
    | "defaultBackgroundColor"
    | "defaultHoverBackgroundColor"
    | "defaultBorderColor"
    | "defaultHoverBorderColor"
    | "defaultActiveBackgroundColor"
    | "defaultActiveBorderColor",
) {
  const defaultBackgroundColorKey = theme.buttons.kinds[kind]?.[defaultKey];
  let backgroundColorKey = defaultBackgroundColorKey;
  if (!backgroundColorKey && isThemeOrColorKey(kind)) {
    backgroundColorKey = kind;
  }

  const defaultBackgroundColor = theme.buttons[defaultKey];
  const backgroundColor = getBackgroundColor(
    theme,
    backgroundColorKey,
    defaultBackgroundColor,
  );

  return backgroundColor;
}

function resolveProp<T, K extends ButtonsThemeKey>(
  prop: T,
  kind: ButtonKind,
  defaultKey: K,
  theme: Theme,
) {
  return (
    /** props may be unset for a given kind but theme defaults always exist,
     * so this will always resolve a value: */
    prop || theme.buttons.kinds[kind]?.[defaultKey] || theme.buttons[defaultKey]
  );
}

function resolveProps(props: ButtonProps, theme: Theme) {
  const {
    kind = "secondary",
    size: sizeProp,
    paddingY: paddingYType = "regular",
    borderRadius,
    typography: typographyProp,
    ...rest
  } = props;

  const size = resolveProp(sizeProp, kind, "defaultSize", theme);
  const defaultPaddingsY = resolveProp(null, kind, "defaultPaddingsY", theme);
  const defaultPaddingY = defaultPaddingsY[size];

  const backgroundColor = resolveBackgroundColorKey(
    theme,
    kind,
    "defaultBackgroundColor",
  );

  const borderColor = resolveBackgroundColorKey(
    theme,
    kind,
    "defaultBorderColor",
  );
  const hoverBackgroundColor = resolveBackgroundColorKey(
    theme,
    kind,
    "defaultHoverBackgroundColor",
  );
  const hoverBorderColor = resolveBackgroundColorKey(
    theme,
    kind,
    "defaultHoverBorderColor",
  );
  const activeBackgroundColor = resolveBackgroundColorKey(
    theme,
    kind,
    "defaultActiveBackgroundColor",
  );
  const activeBorderColor = resolveBackgroundColorKey(
    theme,
    kind,
    "defaultActiveBorderColor",
  );

  const typography = {
    type:
      typographyProp?.type ||
      resolveProp(null, kind, "defaultTypographyType", theme),
    color:
      typographyProp?.color || resolveProp(null, kind, "defaultColor", theme),
    size,
  };

  return {
    ...rest,
    kind,
    size,
    typography,
    paddingY:
      typeof defaultPaddingY === "number"
        ? defaultPaddingY
        : defaultPaddingY[paddingYType],
    borderRadius: resolveProp(borderRadius, kind, "defaultBorderRadius", theme),
    backgroundColor,
    borderColor,
    hoverBackgroundColor,
    hoverBorderColor,
    activeBackgroundColor,
    activeBorderColor,
  };
}

export function Button(props: ButtonProps) {
  const theme = useTheme();
  const {
    kind,
    typography,
    size,
    paddingY,
    text,
    to,
    id,
    hash,
    externalLink,
    filename,
    toParams,
    onClick,
    icon,
    backgroundColor,
    borderColor,
    hoverBackgroundColor,
    hoverBorderColor,
    activeBackgroundColor,
    activeBorderColor,
    iconSide = "left",
    loading = false,
    loadingKind = "primary",
    fullWidth = false,
    disabled = false,
    mt = 0,
    ml = 0,
    type = "button",
    newTab = false,
    zIndex = undefined,
    tooltipText,
    borderRadius,
  } = resolveProps(props, theme);

  const tooltipId = useRef(uniqueId());

  const iconSize = size === "ExtraSmall" ? 12 : 16;
  let currentIcon = null;
  if (loading) {
    currentIcon = (
      <ButtonIcon
        iconSide={iconSide}
        text={text}
        typography={typography}
        kind={kind}
      >
        <Loading size={iconSize} center={false} kind={loadingKind} />
      </ButtonIcon>
    );
  } else if (icon) {
    currentIcon = (
      <ButtonIcon
        iconSide={iconSide}
        text={text}
        typography={typography}
        kind={kind}
      >
        <Icon name={icon} width={iconSize} color={typography.color} />
      </ButtonIcon>
    );
  }

  const content = (
    <Fragment>
      <div
        {...(tooltipText ? { "data-tooltip-id": tooltipId.current } : {})}
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {iconSide === "left" && currentIcon}
        {text && (
          <div
            css={{
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {renderTypography(typography.type, {
              children: text,
              color: typography.color,
              size,
            })}
          </div>
        )}
        {iconSide === "right" && currentIcon}
      </div>
      {tooltipText ? (
        <Tooltip id={tooltipId.current} content={tooltipText} />
      ) : null}
    </Fragment>
  );

  const isSingleCharRoundButton = Boolean(text && text.length === 1 && !icon);

  const commonProps = {
    id,
    kind,
    type,
    typography,
    onClick,
    fullWidth,
    iconSide,
    paddingY,
    backgroundColor,
    borderColor,
    hoverBackgroundColor,
    hoverBorderColor,
    activeBackgroundColor,
    activeBorderColor,
    isRound: isSingleCharRoundButton,
    isLoading: loading,
    disabled: disabled || loading,
    css: {
      marginTop: mt ? `${mt}px` : undefined,
      marginLeft: ml ? `${ml}px` : undefined,
    },
    newTab,
    text,
    borderRadius,
    zIndex,
  };

  if (to) {
    return (
      <ButtonLink {...commonProps} to={to} params={toParams} hash={hash}>
        {content}
      </ButtonLink>
    );
  }

  return externalLink ? (
    <ButtonHrefLink
      {...commonProps}
      href={externalLink}
      download={filename}
      target="_blank"
    >
      {content}
    </ButtonHrefLink>
  ) : (
    <StyledButton {...commonProps}>{content}</StyledButton>
  );
}

type StyledButtonProps = {
  paddingY: number;
  kind: ButtonKind;
  isLoading: boolean;
  isRound: boolean;
  typography: {
    type: AllowedButtonTypographyTypes;
    size: TokenSizeKey;
    color: ThemeOrColorKey;
  };
  disabled: boolean;
  fullWidth: boolean;
  backgroundColor: string;
  borderColor: string;
  hoverBackgroundColor: string;
  hoverBorderColor: string;
  activeBackgroundColor: string;
  activeBorderColor: string;
  css: { marginTop: string | undefined; marginLeft: string | undefined };
  borderRadius: ButtonBorderRadius;
  iconSide: IconSide;
  zIndex: number | undefined;
};

const buttonStyle = ({
  paddingY,
  kind,
  theme,
  disabled,
  isLoading,
  typography,
  fullWidth,
  zIndex,
  iconSide,
  borderColor: borderColorProp,
  isRound,
  borderRadius,
  backgroundColor,
  hoverBackgroundColor,
  hoverBorderColor,
  activeBackgroundColor,
  activeBorderColor,
}: StyledButtonProps & { theme: Theme }) => {
  const borderColor = borderColorProp || backgroundColor;

  return css`
    display: inline-flex;
    opacity: ${disabled && !isLoading ? 0.2 : 1};
    transition: opacity 0.2s;
    position: relative;

    ${zIndex && `z-index: ${zIndex};`}

    ${applyTypography(
      theme,
      typography.type,
      typography.size,
      typography.color,
    )}

    &:focus-visible {
      outline: ${getFocusOutline({ theme })};
      /* Slightly different offset for buttons so the outline is visible: */
      outline-offset: 0px;
    }

    width: ${fullWidth ? "100%" : "fit-content"};

    & > * {
      width: 100%;
      text-align: center;
      white-space: nowrap;
      background-color: ${backgroundColor};
      box-sizing: content-box;
      border: 1px solid;
      border-color: ${borderColor};
      border-radius: ${isRound ? "100%" : `${borderRadius}px`};
      padding: ${getPadding({
        paddingY,
        kind,
        size: typography.size,
        iconSide,
        isRound,
      })};
      transition:
        background-color 0.2s ease-out,
        border-color 0.2s ease-out;

      &:hover {
        background-color: ${hoverBackgroundColor};
        border-color: ${hoverBorderColor};
      }

      &:active {
        background-color: ${activeBackgroundColor};
        border-color: ${activeBorderColor};
      }
    }
  `;
};

interface ButtonIconProps {
  typography: {
    size: TokenSizeKey;
  };
  iconSide?: IconSide | undefined;
  text?: string | undefined;
  kind: ButtonKind;
}

const ButtonIcon = styled.div<ButtonIconProps>`
  ${({ iconSide, kind, typography }) =>
    `${iconSide}: ${getPaddingX(typography.size, kind, false)}px;`}
`;

export const StyledButton = styled(UnstyledButton)<StyledButtonProps>`
  ${(props) => buttonStyle(props)}
`;
const ButtonLink = styled(LinkWithoutTypography)<StyledButtonProps>`
  ${(props) => buttonStyle(props)}
`;
const ButtonHrefLink = styled.a<StyledButtonProps>`
  ${(props) => buttonStyle(props)}
`;

export const ButtonSelector = (prepend = "", append = "") =>
  `${prepend}*:is(${select(StyledButton)}, ${select(ButtonLink)}, ${select(
    ButtonHrefLink,
  )})${append}`;

type LinkWithoutTypographyProps = Omit<
  ComponentProps<typeof Link>,
  "typography"
>;

function LinkWithoutTypography(props: LinkWithoutTypographyProps) {
  return <Link {...props} />;
}
