import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import type { Ref } from "react";
import type {
  GroupBase,
  Props as ReactSelectProps,
  StylesConfig,
} from "react-select";
import BaseSelect, { type SelectInstance } from "react-select";
import {
  defaultTextInputTypography,
  fieldWidth,
  maxFieldWidth,
  textInputBorderColor,
  textInputBorderColorFocused,
  textInputPadding,
  textInputPaddingPx,
  textInputPlaceholderColor,
} from "../styles/fields.js";
import { getColor, themeOr } from "../styles/themes.js";
import { z } from "../styles/z-index.js";
import { Icon } from "./Icon/Icon.js";

export type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = ReactSelectProps<Option, IsMulti, Group> & {
  zIndex?: number | undefined;
  label?: string | undefined;
  getOptionStyles?: StylesConfig<Option, IsMulti, Group>["option"];
  getControlStyles?: StylesConfig<Option, IsMulti, Group>["control"];
  selectRef?: Ref<SelectInstance<Option, IsMulti, Group>> | undefined;
};

export function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  zIndex,
  selectRef,
  label,
  openMenuOnFocus = true,
  tabSelectsValue = false,
  getOptionStyles,
  getControlStyles,
  ...rest
}: SelectProps<Option, IsMulti, Group>) {
  const theme = useTheme();
  const styles: StylesConfig<Option, IsMulti, Group> = {
    container: (styles, state) => {
      return {
        ...styles,
        width: fieldWidth,
        maxWidth: maxFieldWidth,
        zIndex: z.select,
      };
    },
    control: (styles, state) => {
      const controlStyles = getControlStyles
        ? getControlStyles(styles, state)
        : {};
      return {
        ...styles,
        transition: "none",
        padding:
          state.menuIsOpen || state.isFocused
            ? `${textInputPaddingPx - 1}px`
            : textInputPadding,
        boxShadow: "none",
        background: theme.bg,
        minHeight: 0,
        fontSize: 14,
        borderWidth: state.menuIsOpen || state.isFocused ? "2px" : "1px",
        "&:hover": {
          borderColor: state.menuIsOpen
            ? textInputBorderColorFocused({ theme })
            : textInputBorderColor({ theme }),
        },
        borderColor:
          state.menuIsOpen || state.isFocused
            ? textInputBorderColorFocused({ theme })
            : textInputBorderColor({ theme }),
        ...controlStyles,
      };
    },
    indicatorsContainer: (styles) => ({
      ...styles,
      padding: "0 8px",
    }),
    indicatorSeparator: (styles) => ({
      display: "none",
    }),
    menu: (styles, state) => {
      return {
        ...styles,
        overflow: "hidden",
        border: `2px solid ${theme.lcNeutral}`,
        backgroundColor: theme.bg,
        boxShadow: "0px 3px 6px 1px rgba(0,0,0,0.05)",
        borderColor: theme.hcNeutral,
        width: "max-content",
        minWidth: "100%",
      };
    },
    option: (styles, props) => {
      const optionStyles = getOptionStyles
        ? getOptionStyles(styles, props)
        : {};
      return {
        ...styles,
        color: props.isFocused
          ? getColor(theme, defaultTextInputTypography.color)
          : props.isDisabled
          ? textInputPlaceholderColor({ theme })
          : getColor(theme, defaultTextInputTypography.color),
        fontWeight: 600,
        cursor: "pointer",
        backgroundColor: props.isFocused
          ? themeOr(theme.c05Neutral, theme.c2Neutral)({ theme })
          : theme.bg,
        WebkitTapHighlightColor: theme.c1Neutral,
        "&:active": {
          backgroundColor: themeOr(
            theme.c05Neutral,
            theme.c5Neutral,
          )({ theme }),
        },
        ...optionStyles,
      };
    },
    menuPortal: (styles) => ({
      ...styles,
      fontSize: 14,
      zIndex: zIndex || z.selectFocused,
    }),
    singleValue: (styles) => ({
      ...styles,
      color: theme.text,
      fontWeight: 600,
      fontSize: 14,
    }),
    placeholder: (styles) => ({
      ...styles,
      color: theme.mcNeutral,
    }),
    valueContainer: (styles) => ({
      ...styles,
      padding: 0,
    }),
    input: (styles) => ({
      ...styles,
      color: theme.text,
      fontWeight: 600,
      fontSize: 14,
    }),
  };
  return (
    <StyledSelect>
      {label && <SelectLabel hasError={false}>{label}</SelectLabel>}
      <BaseSelect
        {...rest}
        styles={styles}
        openMenuOnFocus={openMenuOnFocus}
        /* In some cases eg NetworkSelector we filter out the currently
         * selected value, so initially focused value is different when the
         * component is focused. In this case tabbing through the component
         * leads to the unexpected behavior of switching the network. Other
         * times, eg CountrySelector it makes sense to set to true
         */
        tabSelectsValue={tabSelectsValue}
        menuPortalTarget={document.body}
        ref={selectRef}
        components={{
          DropdownIndicator: () => <Icon name="Chevron" width={16} />,
          ...rest.components,
        }}
        theme={(selectTheme) => ({
          ...selectTheme,
          borderRadius: 8,
          colors: {
            danger: theme.danger,
            dangerLight: "#ff8",
            primary: theme.text,
            primary75: "#ccc",
            primary50: "#888",
            primary25: "#444",
            neutral0: "#000",
            neutral5: "#111",
            neutral10: "#222",
            neutral20: "#999",
            neutral30: "#aaa",
            neutral40: "#bbb",
            neutral50: "#bbb",
            neutral60: "#ccc",
            neutral70: "#ccc",
            neutral80: "#ddd",
            neutral90: "#ddd",
          },
        })}
      />
    </StyledSelect>
  );
}

const SelectLabel = styled.label<{ hasError: boolean }>`
  font-size: 10px;
  position: absolute;
  z-index: ${z.select + 1};
  background-color: ${({ theme }) => theme.bg};
  color: ${({ theme, hasError }) =>
    hasError ? theme.danger : theme.mcNeutral};
  font-weight: 600;
  padding: 0px 6px;
  left: 12px;
  top: -6px;
`;

export const StyledSelect = styled.div`
  position: relative;
  & + & {
    margin-top: 8px;
  }
`;

export default Select;
