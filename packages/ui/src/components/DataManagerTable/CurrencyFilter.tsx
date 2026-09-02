import styled from "@emotion/styled";
import { type CurrencyAmountInputObj, CurrencyUnit } from "@lightsparkdev/core";
import NumberInput from "../NumberInput.js";
import { Label } from "../typography/Label.js";
import { Filter, type FilterState } from "./Filter.js";
import { FilterType } from "./filters.js";

export interface CurrencyFilterState extends FilterState {
  type: FilterType.CURRENCY;
  min_amount: CurrencyAmountInputObj | null;
  max_amount: CurrencyAmountInputObj | null;
}

export const isCurrencyFilterState = (
  state: FilterState,
): state is CurrencyFilterState => state.type === FilterType.CURRENCY;

export const getDefaultCurrencyFilterState = (): CurrencyFilterState => ({
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
  const handleMinChange = (value: string) => {
    updateFilterState({
      ...state,
      min_amount: value
        ? { value: parseInt(value, 10), unit: CurrencyUnit.SATOSHI }
        : null,
      isApplied: state.max_amount !== null || !!value,
    });
  };

  const handleMaxChange = (value: string) => {
    updateFilterState({
      ...state,
      max_amount: value
        ? { value: parseInt(value, 10), unit: CurrencyUnit.SATOSHI }
        : null,
      isApplied: state.min_amount !== null || !!value,
    });
  };

  return (
    <Filter label={label}>
      <InputContainer>
        <AmountField>
          <Label size="Small" content="Minimum (sats)" />
          <NumberInput
            placeholder="Minimum"
            onChange={handleMinChange}
            value={state.min_amount?.value?.toString() || ""}
            icon={{ name: "Satoshi", side: "left", width: 8 }}
            typography={{ color: "black" }}
            allowDecimals={false}
            allowNegativeValue
          />
        </AmountField>
        <AmountField>
          <Label size="Small" content="Maximum (sats)" />
          <NumberInput
            placeholder="Maximum"
            onChange={handleMaxChange}
            value={state.max_amount?.value?.toString() || ""}
            icon={{ name: "Satoshi", side: "left", width: 8 }}
            typography={{ color: "black" }}
            allowDecimals={false}
            allowNegativeValue
          />
        </AmountField>
      </InputContainer>
    </Filter>
  );
};

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
`;

const AmountField = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
`;
