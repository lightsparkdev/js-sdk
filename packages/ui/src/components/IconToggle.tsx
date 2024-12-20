import styled from "@emotion/styled";
import { type ComponentProps } from "react";
import { getColor, type ThemeOrColorKey } from "../styles/themes.js";
import { Icon } from "./Icon/Icon.js";

type IconToggleProps = {
  options: ({ key: string } & ComponentProps<typeof Icon>)[];
  selectedOption: string;
  onChange: (key: string) => void;
  selectedBgColor?: ThemeOrColorKey;
  selectedColor?: ThemeOrColorKey;
  bgColor?: ThemeOrColorKey;
  color?: ThemeOrColorKey;
};

export function IconToggle({
  options,
  selectedOption,
  onChange,
  selectedBgColor = "c1Neutral",
  selectedColor = "hcNeutral",
  bgColor = "c4Neutral",
  color = "mcNeutral",
}: IconToggleProps) {
  return (
    <StyledIconToggle bgColor={bgColor}>
      {options.map(({ key, ...iconProps }) => (
        <StyledIconToggleOption
          key={key}
          onClick={() => onChange(key)}
          selected={key === selectedOption}
          selectedBgColor={selectedBgColor}
          selectedColor={selectedColor}
          colorProp={color}
        >
          <Icon
            {...iconProps}
            key={key}
            width={11}
            color={key === selectedOption ? selectedColor : color}
          />
        </StyledIconToggleOption>
      ))}
    </StyledIconToggle>
  );
}

const StyledIconToggle = styled.div<{ bgColor: ThemeOrColorKey }>`
  border-radius: 999px;
  background: ${({ theme, bgColor }) => getColor(theme, bgColor)};
  padding: 2px;
  gap: 2px;
  display: flex;
`;

const StyledIconToggleOption = styled.div<{
  selected: boolean;
  selectedBgColor: ThemeOrColorKey;
  selectedColor: ThemeOrColorKey;
  colorProp: ThemeOrColorKey;
}>`
  display: flex;
  cursor: pointer;
  border-radius: 999px;
  padding: 4px;
  background: ${({ theme, selected, selectedBgColor }) =>
    selected ? getColor(theme, selectedBgColor) : "transparent"};
`;
