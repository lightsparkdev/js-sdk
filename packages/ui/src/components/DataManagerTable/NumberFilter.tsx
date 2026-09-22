// Copyright ©, 2026, Lightspark Group, Inc. - All Rights Reserved

import NumberInput from "../NumberInput.js";
import { Filter, type FilterState } from "./Filter.js";
import { FilterType } from "./filters.js";

export interface NumberFilterState extends FilterState {
  type: FilterType.NUMBER;
  value: string;
}

export const isNumberFilterState = (
  state: FilterState,
): state is NumberFilterState => state.type === FilterType.NUMBER;

export const getDefaultNumberFilterState = (): NumberFilterState => ({
  type: FilterType.NUMBER,
  value: "",
  isApplied: false,
});

export function NumberFilter({
  updateFilterState,
  state,
  label,
  allowDecimals,
}: {
  updateFilterState: (state: NumberFilterState) => void;
  state: NumberFilterState;
  label: string;
  allowDecimals: boolean;
}) {
  return (
    <Filter label={label}>
      <NumberInput
        value={state.value}
        onChange={(value) => {
          updateFilterState({
            ...state,
            value,
            isApplied: value !== "",
          });
        }}
        allowDecimals={allowDecimals}
        decimalsLimit={allowDecimals ? 100 : undefined}
        allowNegativeValue
      />
    </Filter>
  );
}
