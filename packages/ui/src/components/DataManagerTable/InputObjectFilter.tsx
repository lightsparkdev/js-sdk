// Copyright ©, 2026, Lightspark Group, Inc. - All Rights Reserved

import { EnumFilter, type EnumFilterState } from "./EnumFilter.js";
import { type FilterState } from "./Filter.js";
import { FilterType, type InputObjectFilterField } from "./filters.js";

export interface InputObjectFilterState extends FilterState {
  type: FilterType.INPUT_OBJECT;
  values: Record<string, string[]>;
}

export const isInputObjectFilterState = (
  state: FilterState,
): state is InputObjectFilterState => state.type === FilterType.INPUT_OBJECT;

export const getDefaultInputObjectFilterState = (): InputObjectFilterState => ({
  type: FilterType.INPUT_OBJECT,
  values: {},
  isApplied: false,
});

export function InputObjectFilter({
  updateFilterState,
  state,
  fields,
}: {
  updateFilterState: (state: InputObjectFilterState) => void;
  state: InputObjectFilterState;
  fields: InputObjectFilterField[];
}) {
  return fields.map((field) => {
    const appliedValues = state.values[field.name] ?? [];
    const fieldState: EnumFilterState = {
      type: FilterType.ENUM,
      value: "",
      appliedValues,
      isApplied: appliedValues.length > 0,
    };

    return (
      <EnumFilter
        key={field.name}
        updateFilterState={(nextFieldState) => {
          const nextValues = {
            ...state.values,
            [field.name]: nextFieldState.appliedValues ?? [],
          };
          const populatedValues = Object.fromEntries(
            Object.entries(nextValues).filter(
              ([, values]) => values.length > 0,
            ),
          );
          updateFilterState({
            ...state,
            values: populatedValues,
            isApplied: Object.keys(populatedValues).length > 0,
          });
        }}
        state={fieldState}
        options={field.enumValues}
        label={field.label}
        isMulti={field.isMulti}
      />
    );
  });
}
