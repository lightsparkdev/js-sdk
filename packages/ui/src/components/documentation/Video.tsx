"use client";

import styled from "@emotion/styled";
import { standardBorderRadius } from "../../styles/common.js";

interface VideoProps {
  children?: React.ReactNode;
  controls?: boolean;
  preload?: string;
  youtubeEmbed?: {
    /** Must include a youtube.com/embed link. */
    src: string;
    /** Height needs to be manually specified. */
    height: number;
  };
}

export const Video = (props: VideoProps) => {
  if (props.youtubeEmbed) {
    return (
      <StyledYoutubeEmbed
        src={props.youtubeEmbed.src}
        height={props.youtubeEmbed.height}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return <StyledVideo controls {...props} />;
};

const StyledVideo = styled.video`
  width: 100%;
  height: auto;
  ${standardBorderRadius(16)};
`;

const StyledYoutubeEmbed = styled.iframe`
  width: 100%;
  ${standardBorderRadius(16)};
`;
