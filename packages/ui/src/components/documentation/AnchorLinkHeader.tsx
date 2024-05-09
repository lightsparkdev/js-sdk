"use client";
import styled from "@emotion/styled";
import { type ComponentProps } from "react";
import { type FontColorKey } from "../../styles/themes.js";
import { select } from "../../utils/emotion.js";
import { Icon } from "../Icon.js";
import { DocsHeadline } from "./DocsHeadline.js";

export const AnchorLinkHeader = (
  props: ComponentProps<typeof DocsHeadline>,
) => {
  return (
    <StyledAnchorLinkHeader colorProp={props.color}>
      <DocsHeadline {...props}>
        {props.children}
        <IconWrapper name="AnchorLink" color={props.color} width={0} />
      </DocsHeadline>
    </StyledAnchorLinkHeader>
  );
};

const IconWrapper = styled(Icon)`
  width: 20px;
  opacity: 0;
  margin: 0 0 4px -20px;
  transform: translateX(-8px);
  transition:
    opacity 0.1s ease-out,
    transform 0.1s ease-out;

  svg {
    margin: 0;
  }
`;

type StyledAnchorLinkHeaderProps = {
  children: React.ReactNode;
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
};

const StyledAnchorLinkHeader = styled.div<StyledAnchorLinkHeaderProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;

  a {
    padding-right: 24px;
  }

  &:hover ${select(IconWrapper)} {
    opacity: 1;
    transform: translateX(0px);
  }
`;
