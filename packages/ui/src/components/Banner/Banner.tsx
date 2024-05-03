import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Link } from "../../router.js";
import { bp } from "../../styles/breakpoints.js";
import { colors } from "../../styles/colors.js";
import { z } from "../../styles/z-index.js";
import { TextIconAligner } from "../TextIconAligner.js";
import {
  bannerHeight,
  bannerTiming,
  lineHeightPx,
  vPaddingPx,
} from "./constants.js";

export type BannerProps<RoutesType extends string> = {
  text: string | null;
  to?: RoutesType | null | undefined;
  color?: keyof typeof colors | undefined;
  stepDuration?: number;
  offsetTop?: number;
  image?:
    | {
        src: string;
      }
    | undefined;
};

export function Banner<RoutesType extends string>({
  text,
  to,
  stepDuration,
  color = "blue43",
  offsetTop = 0,
  image,
}: BannerProps<RoutesType>) {
  const [width, setWidth] = useState(70);

  useEffect(() => {
    if (stepDuration) {
      setTimeout(() => {
        setWidth(100);
      }, 0);
    }
  }, [stepDuration]);

  const innerContent = text ? (
    <BannerInnerContent isVisible={Boolean(text)}>
      {to ? (
        <Link<RoutesType> to={to}>
          <TextIconAligner text={text} rightIcon={{ name: "RightArrow" }} />
        </Link>
      ) : (
        <div>{text}</div>
      )}
    </BannerInnerContent>
  ) : null;

  return (
    <StyledBanner
      color={colors[color]}
      isVisible={Boolean(text)}
      offsetTop={offsetTop}
      hasImage={Boolean(image)}
    >
      {innerContent}
      {image && <StyledBannerImage src={image.src} />}
      {stepDuration && (
        <BannerGradientBg
          stepDuration={stepDuration}
          width={width}
          isVisible={Boolean(text)}
        />
      )}
    </StyledBanner>
  );
}

const BannerInnerContent = styled.div<{ isVisible: boolean }>`
  & > * {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: ${({ isVisible }) =>
      isVisible ? `${vPaddingPx}px 17.5px` : "0px"};
    line-height: ${lineHeightPx}px;
    transition: all ${bannerTiming};
    height: ${({ isVisible }) => (isVisible ? bannerHeight : "0")}px;
  }
`;

const imageRightOffset = 20;

const StyledBanner = styled.div<{
  color: string | undefined;
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
  background-color: ${({ color }) => color || colors.blue43};
  ${({ hasImage }) =>
    hasImage
      ? `padding-right: ${imageRightOffset + lineHeightPx + vPaddingPx * 2}px;`
      : ""}

  ${bp.sm(`
    z-index: ${z.smBanner};
  `)}
`;

type BannerGradientBgProps = {
  stepDuration: number;
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
  height: ${({ isVisible }) => (isVisible ? bannerHeight : "0")}px;

  transition: width ${({ stepDuration }) => stepDuration}s
    cubic-bezier(0.33, 0.54, 0.47, 0.87);
`;

const StyledBannerImage = styled.img`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  margin-right: ${imageRightOffset}px;
`;
