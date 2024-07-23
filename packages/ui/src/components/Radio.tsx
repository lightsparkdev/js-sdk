"use client";

import styled from "@emotion/styled";

import React, { useState } from "react";
import { Spacing } from "../styles/tokens/spacing.js";
import { Label } from "./typography/Label.js";

interface RadioOption<Option extends string> {
  label: Option;
}

interface Props<Option extends string> {
  radioOptions: RadioOption<Option>[];
  defaultOption: Option;
  onChange: (label: Option) => void;
}

export function Radio<Option extends string>({
  radioOptions,
  onChange,
  defaultOption,
}: Props<Option>) {
  const [selectedOption, setSelectedOption] = useState<Option>(defaultOption);

  const handleRadioClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value as Option);
    setSelectedOption(e.target.value as Option);
  };

  return (
    <RadioContainer>
      {radioOptions.map((option) => (
        <RadioRow key={option.label} htmlFor={option.label as string}>
          <RadioInput
            id={option.label as string}
            type="radio"
            value={option.label}
            checked={selectedOption === option.label}
            onChange={handleRadioClick}
          />
          <Label>{option.label}</Label>
        </RadioRow>
      ))}
    </RadioContainer>
  );
}

const RadioContainer = styled.div`
  label: flex;
  flex-direction: column;
`;

const RadioRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${Spacing.sm};
`;

const RadioInput = styled.input``;
