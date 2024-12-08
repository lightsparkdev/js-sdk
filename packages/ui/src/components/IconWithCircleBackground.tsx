import styled from "@emotion/styled";
import { Link } from "../router.js";
import { getColor } from "../styles/themes.js";
import { type NewRoutesType } from "../types/index.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";

type IconWidth = 40 | 30 | 16.5;

type IconWithCircleBackgroundProps = {
  iconName?: IconName;
  iconWidth?: IconWidth | undefined;
  to?: NewRoutesType | undefined;
  darkBg?: boolean;
  shouldRotate?: boolean;
  onClick?: () => void;
};

export function IconWithCircleBackground({
  iconName = "WarningSign",
  iconWidth = 40,
  to,
  onClick,
  darkBg = false,
  shouldRotate = false,
}: IconWithCircleBackgroundProps) {
  const content = (
    <Flex center onClick={onClick}>
      <StyledIconWithCircleBackground
        size={iconWidth}
        darkBg={darkBg}
        shouldRotate={shouldRotate}
      >
        <Icon
          name={iconName}
          width={iconWidth}
          color={darkBg ? "white" : "grayBlue9"}
        />
      </StyledIconWithCircleBackground>
    </Flex>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

type StyledIconWithCircleBackgroundProps = {
  size: IconWidth;
  darkBg: boolean;
  shouldRotate: boolean;
};

const StyledIconWithCircleBackground = styled.div<StyledIconWithCircleBackgroundProps>`
  background: ${({ theme, darkBg }) =>
    darkBg
      ? `linear-gradient(291.4deg, #1C243F 0%, #21283A 100%)`
      : getColor(theme, "grayBlue94")};
  border-radius: 50%;
  padding: ${({ size }) => getPadding(size)}px;
  display: flex;
  justify-content: center;
  ${({ size }) =>
    `width: ${size + getPadding(size) * 2}px; height: ${
      size + getPadding(size) * 2
    }px;`}

  @keyframes IconWithCircleBackgroundRotate {
    0% {
      transform: rotate(0);
    }
    35% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  ${({ shouldRotate }) =>
    shouldRotate &&
    `animation: IconWithCircleBackgroundRotate 10s ease infinite;`}
`;

function getPadding(size: IconWidth) {
  if (size === 40) {
    return 20;
  }
  return 16;
}
