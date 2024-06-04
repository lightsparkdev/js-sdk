// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { standardBorderRadius } from "../styles/common.js";
import { themeOr } from "../styles/themes.js";

export type ProgressBarProps = {
  background?: string | undefined;
  isSm?: boolean;
  progressPercentage?: number | undefined;
  stepDuration?: number;
};

const defaultProps = {
  isSm: false,
  stepDuration: 0.5,
};

export function ProgressBar({
  background,
  progressPercentage,
  isSm = defaultProps.isSm,
  stepDuration = defaultProps.stepDuration,
}: ProgressBarProps) {
  const [percentage, setPercentage] = useState(5);

  useEffect(() => {
    if (progressPercentage !== undefined) {
      setPercentage(progressPercentage);
    } else {
      setTimeout(() => {
        setPercentage(100);
      }, 0);
    }
  }, [progressPercentage]);

  return (
    <ProgressBarContainer isSm={isSm}>
      <Bar isSm={isSm} percentage={percentage} stepDuration={stepDuration}>
        <BarBg
          background={background}
          isSm={isSm}
          percentage={percentage}
          stepDuration={stepDuration}
        />
      </Bar>
    </ProgressBarContainer>
  );
}

ProgressBar.defaultProps = defaultProps;

const ProgressBarContainer = styled.div<{ isSm: boolean }>`
  ${standardBorderRadius(16)}
  background-color: ${({ theme }) =>
    themeOr(theme.c05Neutral, theme.c1Neutral)({ theme })};
  box-sizing: border-box;
  display: flex;
  height: ${({ isSm }) => (isSm ? "6px" : "16px")};
  justify-content: flex-start;
  width: 100%;
  position: relative;
`;

interface BarProps {
  background?: string | undefined;
  percentage: number;
  isSm: boolean;
  stepDuration: number;
}

const BarBg = styled.div<BarProps>`
  ${standardBorderRadius(16)}
  width: ${({ percentage }) => (100 / percentage) * 100}%;
  height: 100%;

  background: ${({ background }) =>
    background
      ? background
      : `
  linear-gradient(
    90deg,
    #000000 -25.9%,
    #1b4077 14.55%,
    #a152c7 82.22%,
    #3f2e7e 115.32%
  )`};
`;

const Bar = styled.div<BarProps>`
  ${standardBorderRadius(16)}
  overflow: hidden;
  box-sizing: border-box;
  display: inline-block;
  height: ${({ isSm }) => (isSm ? "6px" : "16px")};
  width: ${(props) => props.percentage}%;
  transition: width ${({ stepDuration }) => stepDuration}s
    cubic-bezier(0.16, 0.3, 0.18, 1);
`;
