import styled from "@emotion/styled";
import { Spacing } from "../../styles/tokens/spacing.js";
import { Button } from "../Button.js";
import { TextInput } from "../TextInput.js";
import { Filter, type FilterState } from "./Filter.js";
import { FilterType } from "./filters.js";

export const DEFAULT_ERROR_MESSAGE =
  'Please ensure ID is formatted correctly, e.g. "User:01896631-99e6-04f8-0000-6df5455fabcd"';

export interface IdFilterState extends FilterState {
  type: FilterType.ID;
  /**
   * The value of the text input.
   */
  value: string;
  /**
   * The applied values of the filter.
   */
  appliedValues?: string[] | undefined;
  /**
   * The allowed entities that the ID can be prefixed with.
   */
  allowedEntities?: string[];
}

export const isIdFilterState = (state: FilterState): state is IdFilterState =>
  state.type === FilterType.ID;

/**
 * Validates the filter state and updates the filter state.
 */
const onValidate = (state: IdFilterState, isMulti?: boolean) => {
  const { value, allowedEntities } = state;

  // Only validate when the value of the filter is not empty.
  if (!value) {
    return {
      ...state,
    };
  }

  let uuid = value;

  if (allowedEntities) {
    const entityPrefix = allowedEntities.find((entity) =>
      value.startsWith(`${entity}:`),
    );
    const hasValidEntityPrefix = !!entityPrefix;
    if (!hasValidEntityPrefix) {
      return false;
    }

    uuid = value.replace(`${entityPrefix}:`, "");
  }
  const isUuid = uuid.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  );
  if (!isUuid) {
    return false;
  }

  let updatedAppliedValues: string[] = [];
  if (isMulti) {
    updatedAppliedValues =
      state.appliedValues?.filter((appliedValue) => appliedValue !== value) ||
      [];
  }
  updatedAppliedValues.push(uuid);

  // Return the updated state with the UUID and the updated applied values list
  return {
    ...state,
    value: uuid,
    appliedValues: updatedAppliedValues,
  };
};

export const getDefaultIdFilterState = (allowedEntities?: string[]) => ({
  type: FilterType.ID,
  value: "",
  errorMessage: "",
  allowedEntities,
  isApplied: false,
  onValidate: (filterState: IdFilterState, isMulti?: boolean) =>
    onValidate(filterState, isMulti),
});

const cleanValue = (value: string) => {
  return value.trim();
};

export const IdFilter = ({
  updateFilterState,
  state,
  placeholder,
  label,
}: {
  updateFilterState: (state: IdFilterState) => void;
  state: IdFilterState;
  label: string;
  placeholder?: string | undefined;
}) => {
  const handleChange = (rawValue: string) => {
    const value = cleanValue(rawValue);
    updateFilterState({
      ...state,
      value,
      isApplied: !!value || !!state.appliedValues?.length,
      errorMessage: undefined,
    });
  };

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
        <TextInput
          placeholder={placeholder || ""}
          onChange={handleChange}
          value={state.value}
          error={state.errorMessage}
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
