import { Radio } from "../Radio.js";
import { Filter, type FilterState } from "./Filter.js";
import { FilterType } from "./filters.js";

enum BooleanRadioOption {
  YES = "Yes",
  NO = "No",
  BOTH = "Both",
}

export interface BooleanFilterState extends FilterState {
  type: FilterType.BOOLEAN;
  /**
   * The value of the toggle.
   */
  value: boolean | undefined;
}

export const isBooleanFilterState = (
  state: FilterState,
): state is BooleanFilterState => state.type === FilterType.BOOLEAN;

export const getDefaultBooleanFilterState = () => ({
  type: FilterType.BOOLEAN,
  value: undefined,
  isApplied: false,
});

export const BooleanFilter = ({
  updateFilterState,
  state,
  label,
}: {
  updateFilterState: (state: BooleanFilterState) => void;
  state: BooleanFilterState;
  label: string;
}) => {
  return (
    <>
      <Filter label={label}>
        <Radio
          radioOptions={[
            { label: BooleanRadioOption.YES },
            { label: BooleanRadioOption.NO },
            { label: BooleanRadioOption.BOTH },
          ]}
          defaultOption={BooleanRadioOption.BOTH}
          onChange={(selectedOption: BooleanRadioOption) => {
            updateFilterState({
              ...state,
              value:
                selectedOption === BooleanRadioOption.YES
                  ? true
                  : selectedOption === BooleanRadioOption.NO
                  ? false
                  : undefined,
              isApplied: true,
            });
          }}
        />
      </Filter>
    </>
  );
};
