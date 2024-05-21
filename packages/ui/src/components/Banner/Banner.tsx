import styled from "@emotion/styled";
import { useEffect, useMemo, useState } from "react";
import { useResizeObserver } from "../../hooks/useResizeObserver.js";
import { Link } from "../../router.js";
import { bp } from "../../styles/breakpoints.js";
import { colors } from "../../styles/colors.js";
import { getColor, type ThemeOrColorKey } from "../../styles/themes.js";
import { type TypographyTypeKey } from "../../styles/tokens/typography.js";
import { z } from "../../styles/z-index.js";
import { type NewRoutesType } from "../../types/index.js";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes.js";
import { Icon, type IconName } from "../Icon.js";
import { bannerTiming } from "./constants.js";

type MaxMdContentJustify = "center" | "left";

export type BannerProps<T extends TypographyTypeKey> = {
  ref?: React.RefObject<HTMLDivElement>;
  content?: ToReactNodesArgs<T> | undefined;
  to?: NewRoutesType | null | undefined;
  color?: ThemeOrColorKey | undefined;
  bgProgressDuration?: number | undefined;
  borderProgress?: number | undefined;
  offsetTop?: number;
  maxMdContentJustify?: MaxMdContentJustify;
  onHeightChange?: (height: number) => void;
  rightIcon?:
    | {
        name: IconName;
        width?: number;
        color?: ThemeOrColorKey;
        to?: NewRoutesType;
      }
    | undefined;
  leftIcon?:
    | {
        name: IconName;
        width?: number;
        color?: ThemeOrColorKey;
        to?: NewRoutesType;
      }
    | undefined;
};

export function Banner<T extends TypographyTypeKey>({
  content,
  to,
  color,
  maxMdContentJustify,
  offsetTop = 0,
  onHeightChange,
  rightIcon,
  leftIcon,
  bgProgressDuration,
  borderProgress,
}: BannerProps<T>) {
  const [width, setWidth] = useState(70);
  const resizeProps = useMemo(() => ["height" as const], []);
  const { ref, rect } = useResizeObserver(resizeProps);

  useEffect(() => {
    if (bgProgressDuration) {
      setTimeout(() => {
        setWidth(100);
      }, 0);
    }
  }, [bgProgressDuration]);

  useEffect(() => {
    if (onHeightChange && typeof rect?.height === "number") {
      onHeightChange(rect.height);
    }
  }, [onHeightChange, rect?.height]);

  let contentNode = null;
  if (content) {
    const contentNodes = toReactNodes(content);

    if (to) {
      contentNode = (
        <Link<NewRoutesType> to={to}>
          <BannerFlexInnerContent>
            {contentNodes}
            <Icon name="RightArrow" width={12} ml={6} />
          </BannerFlexInnerContent>
        </Link>
      );
    } else {
      contentNode = contentNodes;
    }
  }

  const innerContent = content ? (
    <BannerInnerContent
      isVisible={Boolean(content)}
      maxMdContentJustify={maxMdContentJustify || "center"}
    >
      {contentNode}
    </BannerInnerContent>
  ) : null;

  const leftIconNode = leftIcon ? (
    <Icon
      name={leftIcon.name}
      width={leftIcon.width || 16}
      color={leftIcon.color}
      ml={16}
    />
  ) : null;

  const rightIconNode = rightIcon ? (
    <Icon
      name={rightIcon.name}
      width={rightIcon.width || 16}
      color={rightIcon.color}
      mr={16}
    />
  ) : null;

  return (
    <StyledBanner
      colorProp={color}
      isVisible={Boolean(content)}
      offsetTop={offsetTop}
      hasIcon={Boolean(rightIcon)}
      ref={ref}
      borderProgress={borderProgress}
    >
      {leftIcon && (
        <BannerIcon>
          {leftIcon.to ? (
            <Link<NewRoutesType> to={leftIcon.to}>{leftIconNode}</Link>
          ) : (
            leftIconNode
          )}
        </BannerIcon>
      )}
      {innerContent}
      {rightIcon && (
        <BannerIcon>
          {rightIcon.to ? (
            <Link<NewRoutesType> to={rightIcon.to}>{rightIconNode}</Link>
          ) : (
            rightIconNode
          )}
        </BannerIcon>
      )}
      {bgProgressDuration && (
        <BannerGradientBg
          duration={bgProgressDuration}
          width={width}
          isVisible={Boolean(content)}
        />
      )}
    </StyledBanner>
  );
}

const BannerInnerContent = styled.div<{
  isVisible: boolean;
  maxMdContentJustify: MaxMdContentJustify;
}>`
  z-index: 1;
  padding: ${({ isVisible }) => (isVisible ? `13px 17.5px` : "0px")};
  text-align: center;
  & > * {
    position: relative;
    z-index: 1;
    width: 100%;
    transition: all ${bannerTiming};
    height: ${({ isVisible }) => (isVisible ? "auto" : "0px")};

    ${({ maxMdContentJustify }) =>
      bp.maxMd(
        maxMdContentJustify ? `justify-content: ${maxMdContentJustify};` : "",
      )};
  }
`;

const imageRightOffset = 20;

const StyledBanner = styled.div<{
  colorProp: ThemeOrColorKey | undefined;
  isVisible: boolean;
  offsetTop: number;
  hasIcon: boolean;
  borderProgress: number | undefined;
}>`
  position: fixed;
  left: 0;

  width: 100%;
  z-index: ${z.notificationBanner};
  color: ${colors.white};
  font-weight: 500;
  background-color: ${({ colorProp, theme }) =>
    colorProp ? getColor(theme, colorProp) : "none"};
  display: flex;
  justify-content: ${({ hasIcon }) => (hasIcon ? "space-between" : "center")};
  align-items: center;

  ${({ borderProgress }) => {
    if (typeof borderProgress === "number") {
      return `
        &:before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #C1C5CD;
        }
        &:after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: ${borderProgress}%;
          height: 2px;
          background-color: #2B66C2;
          transition: width 0.3s ease-in;
        }
      `;
    }
    return "";
  }}

  ${bp.sm(`
    z-index: ${z.smBanner};
  `)}
`;

type BannerGradientBgProps = {
  duration: number;
  width: number;
  isVisible: boolean;
};

const BannerGradientBg = styled.div<BannerGradientBgProps>`
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  width: ${({ width }) => width}%;
  height: 100%;

  background: linear-gradient(
    90deg,
    #000000 -25.9%,
    #1b4077 14.55%,
    #a152c7 82.22%,
    #3f2e7e 115.32%
  );

  transition: all ${bannerTiming};
  height: ${({ isVisible }) => (isVisible ? "auto" : "0")}px;

  transition: width ${({ duration }) => duration}s
    cubic-bezier(0.33, 0.54, 0.47, 0.87);
`;

const BannerIcon = styled.div`
  right: ${imageRightOffset}px;
`;

const BannerFlexInnerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
