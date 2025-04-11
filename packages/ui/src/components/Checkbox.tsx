import styled from "@emotion/styled";
import CheckmarkUrl from "../static/images/Checkmark.svg?url";
import { setDefaultReactNodesTypography } from "../utils/toReactNodes/setReactNodesTypography.js";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../utils/toReactNodes/toReactNodes.js";
import { type PartialSimpleTypographyProps } from "./typography/types.js";

export type CheckboxProps = {
  checked: boolean;
  onChange: (newValue: boolean) => void;
  id?: string;
  label?: ToReactNodesArgs | undefined;
  mt?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  alignItems?: "center" | "flex-start";
  disabled?: boolean;
  typography?: PartialSimpleTypographyProps;
};

export function Checkbox({
  checked,
  onChange,
  id,
  label,
  mt = 0,
  mb = 0,
  ml = 0,
  mr = 0,
  alignItems = "center",
  disabled = false,
  typography: typographyProp,
}: CheckboxProps) {
  const defaultTypography = {
    type: typographyProp?.type || "Body",
    size: typographyProp?.size || "Medium",
    color: typographyProp?.color || "text",
  } as const;

  const nodesWithTypography = setDefaultReactNodesTypography(label, {
    default: defaultTypography,
  });

  const content = toReactNodes(nodesWithTypography);

  return (
    <CheckboxContainer mt={mt} mb={mb} ml={ml} mr={mr} alignItems={alignItems}>
      <StyledCheckbox
        id={id}
        type="checkbox"
        checked={checked}
        onChange={() => onChange(!checked)}
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onChange(!checked);
          }
        }}
      />
      {label && <CheckboxLabel htmlFor={id}>{content}</CheckboxLabel>}
    </CheckboxContainer>
  );
}

const StyledCheckbox = styled.input<{ checked: boolean; disabled: boolean }>`
  margin: 0;
  cursor: pointer;
  appearance: none;
  width: 18px;
  height: 18px;
  /* min-width needed when in flex container: */
  min-width: 18px;
  border-radius: 2.25px;
  ${({ checked, theme }) => !checked && `border: 1px solid ${theme.mcNeutral};`}
  background-color: ${({ theme, checked }) =>
    checked ? theme.info : theme.bg};
  background-image: ${({ checked }) =>
    checked ? `url("${CheckmarkUrl}");` : "none;"}
  background-repeat: no-repeat;
  background-position: center;
  background-size: 9px auto;
  ${({ disabled }) => disabled && "opacity: 0.2;"}
`;

export const CheckboxContainer = styled.span<{
  mt: number;
  mb: number;
  ml: number;
  mr: number;
  alignItems: string;
}>`
  display: flex;
  ${({ mt }) => (mt === 0 ? "" : `margin-top: ${mt}px;`)}
  ${({ mb }) => (mb === 0 ? "" : `margin-bottom: ${mb}px;`)}
  ${({ ml }) => (ml === 0 ? "" : `margin-left: ${ml}px;`)}
  ${({ mr }) => (mr === 0 ? "" : `margin-right: ${mr}px;`)}
  align-items: ${({ alignItems }) => alignItems};

  & + & {
    margin-top: 12px;
  }
`;

const CheckboxLabel = styled.label`
  margin-left: 12px;
  cursor: pointer;
`;
