import styled from "@emotion/styled";
import { Link } from "../router.js";
import { getColor, type ThemeOrColorKey } from "../styles/themes.js";
import { type NewRoutesType } from "../types/index.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon/Icon.js";
import { type IconName } from "./Icon/types.js";

type IconWidth = 48 | 40 | 36 | 30 | 24 | 20 | 16.5 | 14;

type IconWithCircleBackgroundProps = {
  iconName?: IconName;
  iconWidth?: IconWidth | undefined;
  iconColor?: ThemeOrColorKey | undefined;
  to?: NewRoutesType | undefined;
  padding?: number | undefined;
  darkBg?: boolean;
  noBg?: boolean;
  bgColor?: ThemeOrColorKey | undefined;
  hoverActiveBg?: boolean;
  shouldRotate?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  iconStrokeWidth?: number;
  opaque?: boolean;
};

export function IconWithCircleBackground({
  iconName = "WarningSign",
  iconWidth = 40,
  to,
  onClick,
  padding,
  darkBg = false,
  shouldRotate = false,
  noBg = false,
  hoverActiveBg = false,
  disabled = false,
  bgColor,
  iconColor,
  iconStrokeWidth,
  opaque = false,
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
        padding={padding}
        darkBg={darkBg}
        hoverActiveBg={hoverActiveBg}
        shouldRotate={shouldRotate}
        noBg={noBg}
        bgColor={bgColor}
      >
        <Icon
          name={iconName}
          width={iconWidth}
          color={iconColor ? iconColor : "secondary"}
          iconProps={{
            strokeWidth: iconStrokeWidth,
            fill: opaque ? "currentColor" : "none",
          }}
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
  padding?: number | undefined;
  darkBg: boolean;
  shouldRotate: boolean;
  noBg: boolean;
  bgColor: ThemeOrColorKey | undefined;
  hoverActiveBg: boolean;
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

  &:hover {
    ${({ theme, hoverActiveBg }) =>
      hoverActiveBg ? `background: ${getColor(theme, "grayBlue94")}` : ""};
  }
  &:active {
    ${({ theme, hoverActiveBg }) =>
      hoverActiveBg ? `background: ${getColor(theme, "grayBlue78")}` : ""};
  }

  border-radius: 50%;
  padding: ${({ size, padding }) => padding ?? getPadding(size)}px;
  display: flex;
  justify-content: center;
  ${({ size, padding }) =>
    `width: ${size + (padding ?? getPadding(size)) * 2}px; height: ${
      size + (padding ?? getPadding(size)) * 2
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
  if (size === 48) {
    return 38;
  }
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
