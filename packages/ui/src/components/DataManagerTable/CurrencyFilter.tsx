import styled from "@emotion/styled";
import { type CurrencyAmountInputObj, CurrencyUnit } from "@lightsparkdev/core";
import { useState } from "react";
import { ButtonRow } from "../ButtonRow.js";
import NumberInput from "../NumberInput.js";
import { Filter, type FilterState } from "./Filter.js";
import { FilterType } from "./filters.js";

enum FilterRangeType {
  LessThan = "Less than",
  Between = "Between",
  MoreThan = "More than",
}

export interface CurrencyFilterState extends FilterState {
  type: FilterType.CURRENCY;
  min_amount: CurrencyAmountInputObj | null;
  max_amount: CurrencyAmountInputObj | null;
}

export const isCurrencyFilterState = (
  state: FilterState,
): state is CurrencyFilterState => state.type === FilterType.CURRENCY;

export const getDefaultCurrencyFilterState = () => ({
  type: FilterType.CURRENCY,
  min_amount: null,
  max_amount: null,
  isApplied: false,
});

export const CurrencyFilter = ({
  updateFilterState,
  state,
  label,
}: {
  updateFilterState: (state: CurrencyFilterState) => void;
  state: CurrencyFilterState;
  label: string;
}) => {
  const [filterRangeType, setFilterRangeType] = useState<FilterRangeType>(
    FilterRangeType.LessThan,
  );

  const isMinDisplayed = filterRangeType !== FilterRangeType.LessThan;
  const isMaxDisplayed = filterRangeType !== FilterRangeType.MoreThan;

  const handleMinChange = (value: string) => {
    updateFilterState({
      ...state,
      min_amount: value
        ? { value: parseInt(value), unit: CurrencyUnit.SATOSHI }
        : null,
      isApplied: state.max_amount !== null || !!value,
    });
  };

  const handleMaxChange = (value: string) => {
    updateFilterState({
      ...state,
      max_amount: value
        ? { value: parseInt(value), unit: CurrencyUnit.SATOSHI }
        : null,
      isApplied: state.min_amount !== null || !!value,
    });
  };

  const handleClick = (type: FilterRangeType) => {
    setFilterRangeType(type);

    updateFilterState({
      ...state,
      min_amount: null,
      max_amount: null,
      isApplied: false,
    });
  };

  return (
    <div>
      <Filter label={label}>
        <NumberButtonRowContainer
          smSticky={false}
          bottomBorder={false}
          buttons={[
            {
              text: "Less than",
              kind:
                filterRangeType === FilterRangeType.LessThan
                  ? "primary"
                  : undefined,
              onClick: () => handleClick(FilterRangeType.LessThan),
              size: "ExtraSmall",
            },
            {
              text: "Between",
              kind:
                filterRangeType === FilterRangeType.Between
                  ? "primary"
                  : undefined,
              onClick: () => handleClick(FilterRangeType.Between),
              size: "ExtraSmall",
            },
            {
              text: "More than",
              kind:
                filterRangeType === FilterRangeType.MoreThan
                  ? "primary"
                  : undefined,
              onClick: () => handleClick(FilterRangeType.MoreThan),
              size: "ExtraSmall",
            },
          ]}
        />
        <InputContainer>
          {isMinDisplayed && (
            <NumberInput
              placeholder="0"
              onChange={handleMinChange}
              value={state.min_amount?.value?.toString() || ""}
              icon={{ name: "Satoshi", side: "left", width: 8 }}
              typography={{ color: "black" }}
              allowNegativeValue
            />
          )}

          {isMinDisplayed && isMaxDisplayed && <Divider />}
          {isMaxDisplayed && (
            <NumberInput
              placeholder="0"
              onChange={handleMaxChange}
              value={state.max_amount?.value?.toString() || ""}
              icon={{ name: "Satoshi", side: "left", width: 8 }}
              typography={{ color: "black" }}
              allowNegativeValue
            />
          )}
        </InputContainer>
      </Filter>
    </div>
  );
};

const NumberButtonRowContainer = styled(ButtonRow)`
  padding: 0px !important;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 24px;
  gap: 10px;
  align-items: center;
`;

const Divider = styled.div`
  height: 4px;
  width: 12px;
  flex-shrink: 0;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.c1Neutral};
`;
