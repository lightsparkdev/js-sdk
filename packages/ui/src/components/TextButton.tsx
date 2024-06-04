import type { Theme } from "@emotion/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { type ComponentProps } from "react";
import { Link, type RouteParams } from "../router.js";
import { getFocusOutline } from "../styles/common.js";
import { type SimpleTypographyProps } from "../styles/typography.js";
import { elide, type ElideArgs } from "../utils/strings.js";
import { TextIconAligner } from "./TextIconAligner.js";
import { UnstyledButton } from "./UnstyledButton.js";

export type TextButtonProps<RoutesType extends string> = Omit<
  ComponentProps<typeof TextIconAligner>,
  "content"
> & {
  disabled?: boolean;
  to?: RoutesType | undefined;
  href?: string;
  elide?: ElideArgs;
  toParams?: RouteParams | undefined;
  onClick?: (() => void) | undefined;
  mt?: number;
  ml?: number;
  mr?: number;
  padding?: string;
  iconMatchTextColor?: boolean;
  text: string;
  typography?: SimpleTypographyProps | undefined;
};

export function TextButton<RoutesType extends string>({
  text: textProp,
  to,
  href,
  toParams,
  onClick,
  rightIcon,
  leftIcon,
  elide: elideArgs,
  disabled = false,
  mt = 0,
  ml = 0,
  mr = 0,
  padding = "0",
  iconMatchTextColor = false,
  typography,
}: TextButtonProps<RoutesType>) {
  const text = elideArgs ? elide(textProp, elideArgs) : textProp;

  let rightIconProp = rightIcon;
  if (typeof rightIcon === "undefined" && typeof leftIcon === "undefined") {
    rightIconProp = {
      name: "RightArrow",
    };
  }

  const defaultIconColor = iconMatchTextColor ? undefined : "mcNeutral";

  const content = (
    <TextIconAligner
      onClick={onClick}
      leftIcon={
        leftIcon
          ? {
              name: leftIcon.name,
              color: leftIcon.color || defaultIconColor,
              width: leftIcon.width,
            }
          : null
      }
      content={text}
      typography={{ size: "ExtraSmall", ...typography }}
      rightIcon={
        rightIconProp
          ? {
              name: rightIconProp.name,
              color: rightIconProp.color || defaultIconColor,
              width: rightIconProp.width,
            }
          : null
      }
    />
  );

  const commonProps = {
    type: "button" as const,
    onClick,
    disabled: disabled,
    padding,
    css: {
      marginTop: mt ? `${mt}px` : undefined,
      marginLeft: ml ? `${ml}px` : undefined,
      marginRight: mr ? `${mr}px` : undefined,
    },
  };

  if (to) {
    return (
      <ButtonLink {...commonProps} to={to} params={toParams}>
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
  type: "button";
  disabled: boolean;
  padding: string;
};

const buttonStyle = ({
  theme,
  disabled,
  padding,
}: StyledButtonProps & { theme: Theme }) => css`
  display: inline-flex;
  opacity: ${disabled ? 0.2 : 1};
  align-items: center;
  transition: opacity 0.2s;
  padding: ${padding};

  &:focus-visible {
    outline: ${getFocusOutline({ theme })};
  }

  & > * {
    width: 100%;
    text-align: center;
    white-space: nowrap;
    cursor: ${disabled ? "not-allowed" : "pointer"};
  }
`;

const StyledButton = styled(UnstyledButton)<StyledButtonProps>`
  ${(props) => buttonStyle(props)}
`;
const ButtonLink = styled(Link)<StyledButtonProps>`
  ${(props) => buttonStyle(props)}
`;
const ButtonHrefLink = styled.a<StyledButtonProps>`
  ${(props) => buttonStyle(props)}
`;
