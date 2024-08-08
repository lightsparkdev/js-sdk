import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { standardBorderRadius } from "../styles/common.js";
import { getColor, type FontColorKey } from "../styles/themes.js";
import { type TypographyTypeKey } from "../styles/tokens/typography.js";
import { type SimpleTypographyProps } from "../styles/typography.js";
import {
  setDefaultReactNodesTypography,
  toReactNodes,
  type ToReactNodesArgs,
} from "../utils/toReactNodes.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";

type BadgeKind = "danger" | "default";

export type BadgeProps<T extends TypographyTypeKey> = {
  content?: ToReactNodesArgs<T> | undefined;
  kind?: BadgeKind | undefined;
  ml?: 0 | 4 | 6;
  mr?: 0 | 4 | 6;
  block?: boolean;
  size?: "sm" | "lg";
  icon?:
    | {
        name: IconName;
        color?: FontColorKey | undefined;
      }
    | undefined;
  typography?: SimpleTypographyProps;
};

export function Badge<T extends TypographyTypeKey>({
  content: contentProp,
  kind,
  icon,
  ml = 0,
  mr = 0,
  size = "sm",
  block = false,
  typography: typographyProp,
}: BadgeProps<T>) {
  const typography = {
    type: typographyProp?.type || "Label Moderate",
    props: {
      size: typographyProp?.size || "Small",
      color: typographyProp?.color || (kind === "danger" ? "danger" : "text"),
    },
  } as const;

  const typographyMap = {
    link: typography,
    externalLink: typography,
    text: typography,
    nextLink: typography,
  };

  let content: ToReactNodesArgs<T> | ReactNode = setDefaultReactNodesTypography(
    contentProp,
    typographyMap,
  );

  content = toReactNodes(content);

  return contentProp ? (
    <StyledBadge kind={kind} ml={ml} size={size} block={block}>
      {icon ? (
        <Icon
          name={icon.name}
          width={20}
          color={
            icon.color ? icon.color : kind === "danger" ? "danger" : undefined
          }
        />
      ) : null}
      <BadgeContent>{content}</BadgeContent>
    </StyledBadge>
  ) : null;
}

type StyledBadgeProps = {
  kind: BadgeKind | undefined;
  ml: number;
  size: "sm" | "lg";
  block: boolean;
};

export const badgeSmVPadding = 2;
const badgeSmHPadding = 6;

const StyledBadge = styled.div<StyledBadgeProps>`
  ${({ size }) => standardBorderRadius(size === "sm" ? 4 : 12)}
  ${({ ml }) => (ml === 0 ? "" : `margin-left: ${ml}px;`)}

  display: ${({ block }) => (block ? "flex" : "inline-flex")};
  gap: ${({ size }) => (size === "sm" ? badgeSmHPadding : 12)}px;
  align-items: center;
  padding: ${({ size }) =>
    size === "sm" ? `${badgeSmVPadding}px ${badgeSmHPadding}px` : "12px 16px"};
  background-color: ${({ theme, kind }) => {
    if (kind === "danger") {
      return getColor(theme, "red42a10");
    } else {
      return getColor(theme, theme.badge.bg);
    }
  }};
`;

const BadgeContent = styled.div``;
