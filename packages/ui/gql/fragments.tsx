import { gql } from "@apollo/client";

export const currencyAmountFragment = gql`
  fragment CurrencyAmount_amount on CurrencyAmount {
    original_value
    original_unit
    preferred_currency_unit
    preferred_currency_value_rounded
    preferred_currency_value_approx
  }
`;
