import styled from "@emotion/styled";
import { ensureArray } from "@lightsparkdev/core";
import { Spacing } from "../../styles/tokens/spacing.js";
import { Button } from "../Button.js";
import Select from "../Select.js";
import { Filter, type FilterState } from "./Filter.js";
import { FilterType, type EnumFilterValue } from "./filters.js";

export interface EnumFilterState extends FilterState {
  type: FilterType.ENUM;
  /**
   * The value of the text input.
   */
  value: string;
  /**
   * The applied values of the filter.
   */
  appliedValues?: string[] | undefined;
}

export const isEnumFilterState = (
  state: FilterState,
): state is EnumFilterState => state.type === FilterType.ENUM;

export const getDefaultEnumFilterState = () => ({
  type: FilterType.ENUM,
  value: "",
  isApplied: false,
});

export const EnumFilter = ({
  updateFilterState,
  state,
  options,
  placeholder,
  label,
  isMulti,
}: {
  updateFilterState: (state: EnumFilterState) => void;
  state: EnumFilterState;
  options: EnumFilterValue[];
  label: string;
  placeholder?: string | undefined;
  isMulti?: boolean | undefined;
}) => {
  const appliedValueButtons = state.appliedValues?.map((value) => {
    return (
      <Button
        key={value}
        kind="primary"
        size="ExtraSmall"
        text={value}
        icon="Close"
        iconSide="right"
        onClick={() => {
          updateFilterState({
            ...state,
            appliedValues: state.appliedValues?.filter(
              (appliedValue) => appliedValue !== value,
            ),
          });
        }}
      />
    );
  });

  return (
    <>
      <Filter label={label}>
        <Select
          placeholder="Select event"
          options={options}
          onChange={(option) => {
            if (option) {
              const optionValues = ensureArray(option.value);
              let updatedAppliedValues: string[] = [];
              if (isMulti) {
                updatedAppliedValues = state.appliedValues
                  ? [
                      ...state.appliedValues.filter(
                        (appliedValue) => appliedValue !== option.value,
                      ),
                      ...optionValues,
                    ]
                  : [...optionValues];
              } else {
                updatedAppliedValues = [...optionValues];
              }

              updateFilterState({
                ...state,
                value: option.label,
                isApplied: true,
                appliedValues: updatedAppliedValues,
              });
            }
          }}
        />
      </Filter>
      {!!appliedValueButtons?.length ? (
        <AppliedButtonsContainer>{appliedValueButtons}</AppliedButtonsContainer>
      ) : null}
    </>
  );
};

const AppliedButtonsContainer = styled.div`
  margin-top: ${Spacing.px.sm};
  display: flex;
  gap: ${Spacing.px.xs};
  flex-wrap: wrap;
`;
