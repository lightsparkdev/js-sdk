import styled from "@emotion/styled";
import { Spacing } from "../../styles/tokens/spacing.js";
import { Button } from "../Button.js";
import { TextInput } from "../TextInput.js";
import { Filter, type FilterState } from "./Filter.js";
import { FilterType } from "./filters.js";

export interface StringFilterState extends FilterState {
  type: FilterType.STRING;
  /**
   * The value of the text input.
   */
  value: string;
  /**
   * The applied values of the filter.
   */
  appliedValues?: string[] | undefined;
}

export const isStringFilterState = (
  state: FilterState,
): state is StringFilterState => state.type === FilterType.STRING;

export const getDefaultStringFilterState = () => ({
  type: FilterType.STRING,
  value: "",
  isApplied: false,
});

export const StringFilter = ({
  updateFilterState,
  state,
  placeholder,
  label,
}: {
  updateFilterState: (state: StringFilterState) => void;
  state: StringFilterState;
  label: string;
  placeholder?: string | undefined;
}) => {
  const handleChange = (value: string) => {
    updateFilterState({
      ...state,
      value,
      isApplied: !!value,
    });
  };

  const appliedValueButtons = state.appliedValues?.map((value) => {
    return (
      <Button
        key={value}
        kind="primary"
        size="ExtraSmall"
        text={value}
        icon={{ name: "Close" }}
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
        <TextInput
          placeholder={placeholder || ""}
          onChange={handleChange}
          value={state.value}
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
