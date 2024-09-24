import styled from "@emotion/styled";
import React, { Fragment } from "react";
import { InputSubtext, Label, textInputStyle } from "../styles/fields.js";

type TextAreaProps = {
  value: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
  placeholder?: string;
  minHeight?: number;
  onChange: (
    value: string,
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  readOnly?: boolean;
};

const defaultProps = {
  disabled: false,
};

export function TextArea({
  value,
  onChange,
  label,
  error,
  placeholder,
  id,
  hint,
  disabled = defaultProps.disabled,
  minHeight,
  readOnly = false,
}: TextAreaProps) {
  return (
    <Fragment>
      {label && <Label>{label}</Label>}
      <StyledTextArea
        id={id}
        value={value}
        minHeight={minHeight}
        onChange={(event) => {
          onChange(event.target.value, event);
        }}
        disabled={disabled}
        hasError={Boolean(error)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      <InputSubtext text={error || hint} />
    </Fragment>
  );
}

const StyledTextArea = styled.textarea<{
  disabled: boolean;
  hasError: boolean;
  minHeight?: number | undefined;
}>`
  ${textInputStyle}
  resize: none;
  min-height: ${({ minHeight }) =>
    typeof minHeight === "number" ? `${minHeight}px` : "initial"};
`;
