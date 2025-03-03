import styled from "@emotion/styled";
import { type ComponentProps, type ReactNode } from "react";
import { getColor, type ThemeOrColorKey } from "../styles/themes.js";
import { Icon } from "./Icon/Icon.js";

type MultiToggleOption<T extends string> =
  | { key: T; text: string }
  | ({ key: T } & ComponentProps<typeof Icon>);

type MultiToggleProps<T extends string> = {
  options: MultiToggleOption<T>[];
  selectedOption: string;
  onChange: (key: T) => void;
  selectedBgColor?: ThemeOrColorKey;
  selectedColor?: ThemeOrColorKey;
  bgColor?: ThemeOrColorKey;
  color?: ThemeOrColorKey;
};

export function MultiToggle<T extends string>({
  options,
  selectedOption,
  onChange,
  selectedBgColor = "c1Neutral",
  selectedColor = "hcNeutral",
  bgColor = "c4Neutral",
  color = "mcNeutral",
}: MultiToggleProps<T>) {
  return (
    <StyledMultiToggle bgColor={bgColor}>
      {options.map(({ key, ...optionProps }) => {
        let content: string | ReactNode = null;
        if ("name" in optionProps) {
          content = (
            <Icon
              {...optionProps}
              width={11}
              key={key}
              color={key === selectedOption ? selectedColor : color}
            />
          );
        } else {
          content = (
            <span css={{ fontSize: "11px", lineHeight: "11px" }}>
              {optionProps.text}
            </span>
          );
        }
        return (
          <StyledMultiToggleOption
            key={key}
            onClick={() => onChange(key)}
            selected={key === selectedOption}
            selectedBgColor={selectedBgColor}
            selectedColor={selectedColor}
            colorProp={color}
          >
            {content}
          </StyledMultiToggleOption>
        );
      })}
    </StyledMultiToggle>
  );
}

const StyledMultiToggle = styled.div<{ bgColor: ThemeOrColorKey }>`
  border-radius: 999px;
  background: ${({ theme, bgColor }) => getColor(theme, bgColor)};
  padding: 2px;
  gap: 2px;
  display: flex;
`;

const StyledMultiToggleOption = styled.div<{
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
