/** @jsxImportSource @emotion/react */
import type { Theme } from "@emotion/react";
import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { type PartialBy } from "@lightsparkdev/core";
import { uniqueId } from "lodash-es";
import {
  forwardRef,
  Fragment,
  useRef,
  type ComponentProps,
  type FocusEvent,
  type MouseEvent,
  type Ref,
} from "react";
import { Link, type RouteParams } from "../router.js";
import { getFocusOutline } from "../styles/common.js";
import {
  type AllowedButtonTypographyTypes,
  type ButtonBorderRadius,
  type ButtonsThemeKey,
  type ButtonTypographyArgs,
  type PaddingYKey,
} from "../styles/themeDefaults/buttons.js";
import {
  getBackgroundColor,
  isThemeOrColorKey,
  type ThemeOrColorKey,
} from "../styles/themes.js";
import { type TokenSizeKey } from "../styles/tokens/typography.js";
import { applyTypography } from "../styles/typography.js";
import { type NewRoutesType } from "../types/index.js";
import { select } from "../utils/emotion.js";
import { Icon } from "./Icon/Icon.js";
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
  "quaternary",
  "roundSingleChar",
  "roundIcon",
  "gray",
  "grayGradient",
] as const;
export type ButtonKind = (typeof buttonKinds)[number];

type IconProps = ComponentProps<typeof Icon>;

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
  icon?:
    | (Pick<IconProps, "name" | "color" | "iconProps"> &
        /* We'll set a default width if not provided, leave unrequired: */
        PartialBy<IconProps, "width">)
    | undefined;
  iconSide?: IconSide;
  loading?: boolean | undefined;
  loadingKind?: LoadingKind | undefined;
  onClick?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
  onMouseEnter?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
  onMouseDown?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
  onMouseUp?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
  onMouseLeave?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
  onFocus?: ((event: FocusEvent<HTMLElement>) => void) | undefined;
  onBlur?: ((event: FocusEvent<HTMLElement>) => void) | undefined;
  mt?: number | "auto";
  ml?: number | "auto";
  fullWidth?: boolean | undefined;
  type?: "button" | "submit";
  newTab?: boolean;
  tooltipText?: string | undefined;
  zIndex?: number | undefined;
  borderRadius?: ButtonBorderRadius | undefined;
};

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
  const isSingleCharRoundButton = Boolean(
    props.text && props.text.length === 1 && !props.icon,
  );
  const isRoundIconButton = Boolean(!props.text && props.icon);
  const defaultKind = isSingleCharRoundButton
    ? "roundSingleChar"
    : isRoundIconButton
    ? "roundIcon"
    : "secondary";

  const {
    kind = defaultKind,
    size: sizeProp,
    paddingY: paddingYType = "regular",
    borderRadius,
    typography: typographyProp,
    ...rest
  } = props;

  const size = resolveProp(sizeProp, kind, "defaultSize", theme);
  const defaultPaddingsY = resolveProp(null, kind, "defaultPaddingsY", theme);
  const defaultPaddingY = defaultPaddingsY[size];
  const defaultPaddingsX = resolveProp(null, kind, "defaultPaddingsX", theme);
  const defaultPaddingX = defaultPaddingsX[size];

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
    paddingX: defaultPaddingX,
    borderRadius:
      kind === "roundSingleChar" || kind === "roundIcon"
        ? 999
        : resolveProp(borderRadius, kind, "defaultBorderRadius", theme),
    backgroundColor,
    borderColor,
    hoverBackgroundColor,
    hoverBorderColor,
    activeBackgroundColor,
    activeBorderColor,
  };
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const theme = useTheme();
  const {
    kind,
    typography,
    size,
    paddingX,
    paddingY,
    text,
    to,
    id,
    hash,
    externalLink,
    filename,
    toParams,
    onClick,
    onMouseEnter,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onFocus,
    onBlur,
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

  const defaultIconWidth = size === "ExtraSmall" ? 12 : 16;
  let currentIcon = null;
  if (loading) {
    currentIcon = (
      <ButtonIcon
        iconSide={iconSide}
        text={text}
        typography={typography}
        kind={kind}
        paddingX={paddingX}
      >
        <Loading size={defaultIconWidth} center={false} kind={loadingKind} />
      </ButtonIcon>
    );
  } else if (icon) {
    currentIcon = (
      <ButtonIcon
        iconSide={iconSide}
        text={text}
        typography={typography}
        kind={kind}
        paddingX={paddingX}
      >
        <Icon
          {...icon}
          width={icon.width || defaultIconWidth}
          square
          color={typography.color}
        />
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

  const commonProps = {
    id,
    kind,
    type,
    typography,
    onClick,
    onMouseEnter,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onFocus,
    onBlur,
    fullWidth,
    iconSide,
    paddingX,
    paddingY,
    backgroundColor,
    borderColor,
    hoverBackgroundColor,
    hoverBorderColor,
    activeBackgroundColor,
    activeBorderColor,
    isLoading: loading,
    disabled: disabled || loading,
    css: {
      marginTop: mt ? (typeof mt === "number" ? `${mt}px` : "auto") : undefined,
      marginLeft: ml
        ? typeof ml === "number"
          ? `${ml}px`
          : "auto"
        : undefined,
    },
    newTab,
    borderRadius,
    zIndex,
  } as const;

  if (to) {
    return (
      <ButtonLink
        {...commonProps}
        to={to}
        params={toParams}
        hash={hash}
        ref={ref as Ref<HTMLAnchorElement>}
      >
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
      ref={ref as Ref<HTMLAnchorElement>}
    >
      {content}
    </ButtonHrefLink>
  ) : (
    <StyledButton {...commonProps} ref={ref as Ref<HTMLButtonElement>}>
      {content}
    </StyledButton>
  );
});

Button.displayName = "Button";

type StyledButtonProps = {
  paddingX: number;
  paddingY: number;
  kind: ButtonKind;
  isLoading: boolean;
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
  paddingX,
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
      border-radius: ${typeof borderRadius === "number"
        ? `${borderRadius}px`
        : borderRadius};
      padding: ${paddingY}px ${paddingX}px;
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
  paddingX: number;
}

const ButtonIcon = styled.div<ButtonIconProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ iconSide, paddingX }) => `${iconSide}: ${paddingX}px;`}
`;

type LinkWithoutTypographyProps = Omit<
  ComponentProps<typeof Link>,
  "typography"
>;

const LinkWithoutTypography = forwardRef<
  HTMLAnchorElement,
  LinkWithoutTypographyProps
>((props, ref) => {
  return <Link {...props} ref={ref} />;
});

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
