import styled from "@emotion/styled";
import { Link } from "../router.js";
import { getColor } from "../styles/themes.js";
import { type NewRoutesType } from "../types/index.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";

type IconWidth = 40 | 16.5;

type IconWithCircleBackgroundProps = {
  iconName?: IconName;
  iconWidth?: IconWidth | undefined;
  to?: NewRoutesType | undefined;
  onClick?: () => void;
};

export function IconWithCircleBackground({
  iconName = "WarningSign",
  iconWidth = 40,
  to,
  onClick,
}: IconWithCircleBackgroundProps) {
  const content = (
    <Flex center onClick={onClick}>
      <StyledIconWithCircleBackground size={iconWidth}>
        <Icon name={iconName} width={iconWidth} color="grayBlue9" />
      </StyledIconWithCircleBackground>
    </Flex>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

type StyledIconWithCircleBackgroundProps = {
  size: IconWidth;
};

const StyledIconWithCircleBackground = styled.div<StyledIconWithCircleBackgroundProps>`
  background-color: ${({ theme }) => getColor(theme, "grayBlue94")};
  border-radius: 50%;
  padding: ${({ size }) => getPadding(size)}px;
  display: flex;
  justify-content: center;
  ${({ size }) =>
    `width: ${size + getPadding(size) * 2}px; height: ${
      size + getPadding(size) * 2
    }px;`}
`;

function getPadding(size: IconWidth) {
  if (size === 40) {
    return 20;
  }
  return 16;
}
