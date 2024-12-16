import styled from "@emotion/styled";
import { standardBorderRadius } from "../styles/common.js";
import { getColor, type FontColorKey } from "../styles/themes.js";
import { setDefaultReactNodesTypography } from "../utils/toReactNodes/setReactNodesTypography.js";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../utils/toReactNodes/toReactNodes.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";
import { type PartialSimpleTypographyProps } from "./typography/types.js";

export type BadgeKind = "success" | "danger" | "default";

export type BadgeProps = {
  content?: ToReactNodesArgs | undefined;
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
  typography?: PartialSimpleTypographyProps;
};

export function Badge({
  content: contentProp,
  kind,
  icon,
  ml = 0,
  mr = 0,
  size = "sm",
  block = false,
  typography: typographyProp,
}: BadgeProps) {
  const defaultTypography = {
    type: typographyProp?.type || "Label Moderate",
    size: typographyProp?.size || "Small",
    color:
      typographyProp?.color ||
      (kind === "danger" ? "danger" : kind === "success" ? "white" : "text"),
  } as const;

  const nodesWithTypography = setDefaultReactNodesTypography(contentProp, {
    default: defaultTypography,
  });

  const content = toReactNodes(nodesWithTypography);

  return contentProp ? (
    <StyledBadge kind={kind} ml={ml} mr={mr} size={size} block={block}>
      {icon ? (
        <Icon
          name={icon.name}
          width={20}
          color={
            icon.color
              ? icon.color
              : kind === "danger"
              ? "danger"
              : kind === "success"
              ? "success"
              : undefined
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
  mr: number;
  size: "sm" | "lg";
  block: boolean;
};

export const badgeSmVPadding = 2;
const badgeSmHPadding = 6;

const StyledBadge = styled.div<StyledBadgeProps>`
  ${({ size }) => standardBorderRadius(size === "sm" ? 4 : 12)}
  ${({ ml }) => (ml === 0 ? "" : `margin-left: ${ml}px;`)}
  ${({ mr }) => (mr === 0 ? "" : `margin-right: ${mr}px;`)}

  display: ${({ block }) => (block ? "flex" : "inline-flex")};
  gap: ${({ size }) => (size === "sm" ? badgeSmHPadding : 12)}px;
  align-items: center;
  padding: ${({ size }) =>
    size === "sm" ? `${badgeSmVPadding}px ${badgeSmHPadding}px` : "12px 16px"};
  background-color: ${({ theme, kind }) => {
    if (kind === "danger") {
      return getColor(theme, "red42a10");
    } else if (kind === "success") {
      return getColor(theme, "success");
    } else {
      return getColor(theme, theme.badge.bg);
    }
  }};
`;

const BadgeContent = styled.div``;
