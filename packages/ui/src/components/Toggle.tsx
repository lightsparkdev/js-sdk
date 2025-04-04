import styled from "@emotion/styled";
import { colors } from "../styles/colors.js";
import { getColor, themeOr, type ThemeOrColorKey } from "../styles/themes.js";
import { UnstyledButton } from "./UnstyledButton.js";

type ToggleProps = {
  on: boolean;
  onChange: (on: boolean) => void;
  ml?: number;
  mt?: number;
  mb?: number;
  bg?: ThemeOrColorKey | undefined;
  disabled?: boolean;
  label?: string;
  /* id is required to ensure label click affects toggle: */
  id: string;
};

const defaultProps = {
  on: false,
  ml: 0,
  mt: 0,
  mb: 0,
  disabled: false,
};

export function Toggle({
  onChange,
  bg,
  ml = defaultProps.ml,
  mt = defaultProps.mt,
  mb = defaultProps.mb,
  on = defaultProps.on,
  disabled = defaultProps.disabled,
  label,
  id,
}: ToggleProps) {
  return (
    <ToggleContainer mb={mb} ml={ml} mt={mt}>
      <ToggleButton
        bg={bg}
        isOn={on}
        onClick={() => onChange(!on)}
        disabled={disabled}
        type="button"
        id={id}
      />
      {label && <ToggleLabel htmlFor={id}>{label}</ToggleLabel>}
    </ToggleContainer>
  );
}

type ToggleButtonProps = {
  bg?: ThemeOrColorKey | undefined;
  isOn: boolean;
  disabled: boolean;
};

const width = 44;
const circleDim = 20;
const circleOffset = 2;
const ToggleButton = styled(UnstyledButton)<ToggleButtonProps>`
  color: ${colors.white};
  font-weight: 500;
  border-radius: 44px;
  width: ${width}px;
  height: 24px;
  opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
  background-color: ${({ bg, theme, isOn }) => {
    if (bg) {
      return getColor(theme, bg);
    } else if (isOn) {
      return theme.success;
    }
    return themeOr(theme.c1Neutral, theme.c4Neutral)({ theme });
  }};
  position: relative;
  &:after {
    content: "";
    display: block;
    position: absolute;
    border-radius: 50%;
    transition: right 0.1s;
    box-shadow:
      0 3px 8px 0 rgba(0, 0, 0, 0.15),
      0 3px 1px 0 rgba(0, 0, 0, 0.06);
    background-color: ${colors.white};
    width: ${circleDim}px;
    height: ${circleDim}px;
    top: ${circleOffset}px;
    right: ${({ isOn }) =>
      isOn ? `${circleOffset}px` : `${width - circleDim - circleOffset}px`};
  }
`;

type ToggleContainerProps = {
  ml: number;
  mt: number;
  mb: number;
};

const gap = 12;
export const ToggleContainer = styled.span<ToggleContainerProps>`
  display: flex;
  margin-bottom: ${({ mb }) => mb}px;
  margin-top: ${({ mt }) => mt}px;
  margin-left: ${({ ml }) => ml}px;
  align-items: center;
  gap: ${gap}px;
`;

const ToggleLabel = styled.label`
  width: calc(100% - ${width + gap}px);
  cursor: pointer;
`;
