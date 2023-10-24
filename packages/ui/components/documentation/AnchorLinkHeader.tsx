"use client";
import styled from "@emotion/styled";
import { Icon } from "@lightsparkdev/ui/icons";
import { colors } from "@lightsparkdev/ui/styles/colors";
import {
  Headline,
  type Props,
} from "@lightsparkdev/ui/styles/fonts/typography/Headline";

export const AnchorLinkHeader = (props: Props) => {
  return (
    <StyledAnchorLinkHeader {...props}>
      <Headline {...props}>
        {props.children}
        <IconWrapper
          name="AnchorLink"
          color={props.color || colors.black}
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
