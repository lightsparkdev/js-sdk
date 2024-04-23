import styled from "@emotion/styled";
import { standardLineHeightEms } from "@lightsparkdev/ui/src/styles/common";
import CheckmarkUrl from "../static/images/Checkmark.svg?url";

export type CheckboxProps = {
  checked: boolean;
  onChange: (newValue: boolean) => void;
  id?: string;
  label?: string;
  mt?: number;
  alignItems?: "center" | "flex-start";
  disabled?: boolean;
};

export function Checkbox({
  checked,
  onChange,
  id,
  label,
  mt = 0,
  alignItems = "center",
  disabled = false,
}: CheckboxProps) {
  return (
    <CheckboxContainer mt={mt} alignItems={alignItems}>
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
      {label && <CheckboxLabel htmlFor={id}>{label}</CheckboxLabel>}
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
    checked ? `url('${CheckmarkUrl}');` : "none;"}
  background-repeat: no-repeat;
  background-position: center;
  background-size: 9px auto;
  ${({ disabled }) => disabled && "opacity: 0.2;"}
`;

export const CheckboxContainer = styled.span<{
  mt: number;
  alignItems: string;
}>`
  display: flex;
  margin-top: ${({ mt }) => mt}px;
  align-items: ${({ alignItems }) => alignItems};

  & + & {
    margin-top: 12px;
  }
`;

const CheckboxLabel = styled.label`
  margin-left: 12px;
  cursor: pointer;
  height: ${standardLineHeightEms}em;
`;
