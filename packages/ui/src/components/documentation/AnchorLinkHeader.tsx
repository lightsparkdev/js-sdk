"use client";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import {
  Headline,
  type Props,
} from "../../styles/fonts/typography/Headline.js";
import { Icon } from "../Icon.js";

export const AnchorLinkHeader = (props: Props) => {
  const theme = useTheme();
  return (
    <StyledAnchorLinkHeader {...props}>
      <Headline {...props}>
        {props.children}
        <IconWrapper
          name="AnchorLink"
          color={props.color || theme.text}
          width={0}
        />
      </Headline>
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

const StyledAnchorLinkHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;

  a {
    padding-right: 24px;
  }

  &:hover ${IconWrapper} {
    opacity: 1;
    transform: translateX(0px);
  }
`;
