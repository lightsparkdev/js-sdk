// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import { Fragment } from "react";
import CommaNumberInput, {
  type CommaNumberInputProps,
} from "./CommaNumberInput.js";
import {
  SatoshiInputLabel,
  type SatoshiInputLabelProps,
} from "./SatoshiInputLabel.js";

type SatoshiInputProps = Omit<CommaNumberInputProps, "label"> & {
  maxValue?: number;
  label?: SatoshiInputLabelProps;
};

export function SatoshiInput({
  label,
  maxValue,
  error,
  ...rest
}: SatoshiInputProps) {
  return (
    <Fragment>
      {label && (
        <SatoshiInputLabel
          text={label.text}
          availableSats={label.availableSats}
          showTooltip={label.showTooltip}
        />
      )}
      <CommaNumberInput
        placeholder="SATs"
        {...rest}
        icon={{ name: "SatoshiRounded", side: "left" }}
        maxValue={maxValue ? Math.floor(maxValue) : undefined}
        error={error}
      />
    </Fragment>
  );
}

export default SatoshiInput;
