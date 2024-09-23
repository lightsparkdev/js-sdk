import styled from "@emotion/styled";
import { getColor } from "../styles/themes.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon/Icon.js";

type IconWithCircleBackgroundProps = {
  iconName?:
    | "WarningSign"
    | "Envelope"
    | "Bank"
    | "ReceiptBill"
    | "ChevronLeft";
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
