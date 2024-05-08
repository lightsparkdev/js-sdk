import styled from "@emotion/styled";
import { useEffect, useMemo, useState } from "react";
import { useResizeObserver } from "../../hooks/useResizeObserver.js";
import { Link } from "../../router.js";
import { bp } from "../../styles/breakpoints.js";
import { colors } from "../../styles/colors.js";
import { getColor, type ThemeOrColorKey } from "../../styles/themes.js";
import { type TokenSizeKey } from "../../styles/tokens/typography.js";
import { z } from "../../styles/z-index.js";
import { type NewRoutesType } from "../../types/index.js";
import { type ToNonTypographicReactNodesArgs } from "../../utils/toNonTypographicReactNodes.js";
import { TextIconAligner } from "../TextIconAligner.js";
import { renderTypography } from "../typography/renderTypography.js";
import { bannerTiming } from "./constants.js";

type AllowedBannerTypographyTypes = "Display" | "Body";

export type BannerProps = {
  ref?: React.RefObject<HTMLDivElement>;
  content?: ToNonTypographicReactNodesArgs | undefined;
  typography?:
    | {
        type?: AllowedBannerTypographyTypes;
        size?: TokenSizeKey;
        color?: ThemeOrColorKey;
      }
    | undefined;
  to?: NewRoutesType | null | undefined;
  color?: ThemeOrColorKey | undefined;
  bgProgressDuration?: number | undefined;
  offsetTop?: number;
  maxMdContentJustify?: "center" | "left";
  onHeightChange?: (height: number) => void;
  image?:
    | {
        src: string;
      }
    | undefined;
};

export function Banner({
  content,
  typography,
  to,
  bgProgressDuration,
  color = "blue43",
  maxMdContentJustify,
  offsetTop = 0,
  onHeightChange,
  image,
}: BannerProps) {
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
    console.log("rect.height", rect?.height);

    if (onHeightChange && typeof rect?.height === "number") {
      onHeightChange(rect.height);
    }
  }, [onHeightChange, rect?.height]);

  let contentNode = null;
  if (content) {
    if (to) {
      contentNode = (
        <Link<NewRoutesType> to={to}>
          <TextIconAligner
            typography={typography}
            content={content}
            rightIcon={{ name: "RightArrow" }}
          />
        </Link>
      );
    } else {
      contentNode = renderTypography(typography?.type || "Body", {
        content,
        size: typography?.size || "Small",
        color: typography?.color || "white",
      });
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

  return (
    <StyledBanner
      colorProp={color}
      isVisible={Boolean(content)}
      offsetTop={offsetTop}
      hasImage={Boolean(image)}
      ref={ref}
    >
      {innerContent}
      {image && <StyledBannerImage src={image.src} />}
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
  maxMdContentJustify: BannerProps["maxMdContentJustify"];
}>`
  & > * {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: ${({ isVisible }) => (isVisible ? `13px 17.5px` : "0px")};
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
  hasImage: boolean;
}>`
  position: fixed;
  left: 0;

  width: 100%;
  z-index: ${z.notificationBanner};
  color: ${colors.white};
  font-weight: 500;
  background-color: ${({ colorProp, theme }) =>
    colorProp ? getColor(theme, colorProp) : colors.blue43};
  ${({ hasImage }) =>
    hasImage ? `padding-right: ${imageRightOffset * 2}px;` : ""}

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

const StyledBannerImage = styled.img`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  margin-right: ${imageRightOffset}px;
  z-index: 1;
`;
