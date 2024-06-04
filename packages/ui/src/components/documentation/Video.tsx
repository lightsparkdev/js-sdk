"use client";

import styled from "@emotion/styled";
import { standardBorderRadius } from "../../styles/common.js";

interface VideoProps {
  children: React.ReactNode;
  controls?: boolean;
  preload?: string;
}

export const Video = (props: VideoProps) => {
  return <StyledVideo controls {...props} />;
};

const StyledVideo = styled.video`
  width: 100%;
  height: auto;
  ${standardBorderRadius(16)};
`;
