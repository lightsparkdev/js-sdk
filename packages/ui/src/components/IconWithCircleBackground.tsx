import styled from "@emotion/styled";
import { Flex, Icon } from "@lightsparkdev/ui/src/components";
import { getColor } from "@lightsparkdev/ui/src/styles/themes";

type IconWithCircleBackgroundProps = {
  iconName?: "WarningSign" | "Envelope" | "Bank";
};

export function IconWithCircleBackground({
  iconName = "WarningSign",
}: IconWithCircleBackgroundProps) {
  return (
    <Flex center>
      <StyledIconWithCircleBackground>
        <Icon name={iconName} width={40} color="grayBlue9" />
      </StyledIconWithCircleBackground>
    </Flex>
  );
}

const StyledIconWithCircleBackground = styled.div`
  background-color: ${({ theme }) => getColor(theme, "grayBlue94")};
  border-radius: 50%;
  padding: 20px;
`;
