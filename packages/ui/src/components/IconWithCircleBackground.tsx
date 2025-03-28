import styled from "@emotion/styled";
import { Link } from "../router.js";
import { getColor, type ThemeOrColorKey } from "../styles/themes.js";
import { type NewRoutesType } from "../types/index.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";

type IconWidth = 40 | 36 | 30 | 20 | 16.5;

type IconWithCircleBackgroundProps = {
  iconName?: IconName;
  iconWidth?: IconWidth | undefined;
  iconColor?: ThemeOrColorKey | undefined;
  to?: NewRoutesType | undefined;
  darkBg?: boolean;
  noBg?: boolean;
  bgColor?: ThemeOrColorKey | undefined;
  shouldRotate?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  iconStrokeWidth?: number;
};

export function IconWithCircleBackground({
  iconName = "WarningSign",
  iconWidth = 40,
  to,
  onClick,
  darkBg = false,
  shouldRotate = false,
  noBg = false,
  disabled = false,
  bgColor,
  iconColor,
  iconStrokeWidth,
}: IconWithCircleBackgroundProps) {
  const content = (
    <Flex
      center
      onClick={onClick}
      disabled={disabled}
      as={onClick ? "button" : "div"}
      asButtonType="button"
    >
      <StyledIconWithCircleBackground
        size={iconWidth}
        darkBg={darkBg}
        shouldRotate={shouldRotate}
        noBg={noBg}
        bgColor={bgColor}
      >
        <Icon
          name={iconName}
          width={iconWidth}
          color={iconColor ? iconColor : darkBg ? "white" : "grayBlue9"}
          iconProps={{ strokeWidth: iconStrokeWidth }}
        />
      </StyledIconWithCircleBackground>
    </Flex>
  );
  return to ? (
    <div css={{ cursor: disabled ? "not-allowed" : undefined }}>
      <Link to={to} disabled={disabled}>
        {content}
      </Link>
    </div>
  ) : (
    content
  );
}

type StyledIconWithCircleBackgroundProps = {
  size: IconWidth;
  darkBg: boolean;
  shouldRotate: boolean;
  noBg: boolean;
  bgColor: ThemeOrColorKey | undefined;
};

const StyledIconWithCircleBackground = styled.div<StyledIconWithCircleBackgroundProps>`
  background: ${({ theme, darkBg, noBg, bgColor }) =>
    darkBg
      ? `linear-gradient(291.4deg, #1C243F 0%, #21283A 100%)`
      : noBg
      ? "transparent"
      : bgColor
      ? getColor(theme, bgColor)
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
  if (size === 36) {
    return 14;
  }
  if (size === 20) {
    return 10;
  }
  return 16;
}
