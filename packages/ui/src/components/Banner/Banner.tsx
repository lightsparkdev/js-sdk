import styled from "@emotion/styled";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
} from "../../utils/toReactNodes/toReactNodes.js";
import { Icon } from "../Icon/Icon.js";
import { bannerTiming } from "./constants.js";

type MaxMdContentJustify = "center" | "left";

export type BannerProps<T extends TypographyTypeKey> = {
  ref?: React.RefObject<HTMLDivElement>;
  content?: ToReactNodesArgs<T> | undefined;
  to?: NewRoutesType | null | undefined;
  color?: ThemeOrColorKey | undefined;
  bgProgressDuration?: number | undefined;
  borderProgress?: number | undefined;
  borderColor?: ThemeOrColorKey | undefined;
  offsetTop?: number;
  maxMdContentJustify?: MaxMdContentJustify;
  onHeightChange?: (height: number) => void;
  minHeight?: number | "auto" | undefined;
  hPadding?: number | undefined;
  right?: ReactNode | undefined;
  left?: ReactNode | undefined;
};

export function Banner<T extends TypographyTypeKey>({
  content,
  to,
  color,
  maxMdContentJustify,
  offsetTop = 0,
  onHeightChange,
  right,
  left,
  bgProgressDuration,
  borderProgress,
  minHeight = 0,
  hPadding = 0,
  borderColor,
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
      minHeight={minHeight}
    >
      {contentNode}
    </BannerInnerContent>
  ) : null;

  return (
    <StyledBanner
      colorProp={color}
      borderColor={borderColor}
      isVisible={Boolean(content)}
      offsetTop={offsetTop}
      hasSideContent={Boolean(right || left)}
      ref={ref}
      borderProgress={borderProgress}
      hPadding={hPadding}
    >
      {left}
      {innerContent}
      {right}
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
  minHeight: number | "auto";
}>`
  z-index: 1;
  padding: ${({ isVisible }) => (isVisible ? `0px 17.5px` : "0px")};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${({ minHeight }) =>
    typeof minHeight === "number" ? `${minHeight}px` : "auto"};

  & > * {
    position: relative;
    z-index: 1;
    width: 100%;

    ${({ maxMdContentJustify }) =>
      bp.maxMd(
        maxMdContentJustify ? `justify-content: ${maxMdContentJustify};` : "",
      )};
  }
`;

const StyledBanner = styled.div<{
  colorProp: ThemeOrColorKey | undefined;
  isVisible: boolean;
  offsetTop: number;
  hasSideContent: boolean;
  borderProgress: number | undefined;
  hPadding: number;
  borderColor: ThemeOrColorKey | undefined;
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
  justify-content: ${({ hasSideContent }) =>
    hasSideContent ? "space-between" : "center"};
  align-items: center;
  padding: ${({ hPadding }) => `0 ${hPadding}px`};
  ${({ borderColor, theme }) =>
    borderColor
      ? `border-bottom: 1px solid ${getColor(theme, borderColor)};`
      : ""}

  ${({ borderProgress }) => {
    if (typeof borderProgress === "number") {
      return `
        &:before {
          content: "";
          position: absolute;
          left: 0;
          width: 100%;
          background-color: #C1C5CD;
          top: 0;
          height: 4px;
          ${bp.sm(`
            height: 2px;
            top: initial;
            bottom: 0;
          `)}
        }
        &:after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: ${borderProgress}%;
          background-color: #2B66C2;
          transition: width 0.3s ease-in;
          top: 0;
          height: 4px;
          ${bp.sm(`
            height: 2px;
            top: initial;
            bottom: 0;
          `)}
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

const BannerFlexInnerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
