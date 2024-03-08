// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import { gql } from "@apollo/client";
import styled from "@emotion/styled";
import type {
  CurrencyAmountArg,
  CurrencyMap,
  CurrencyUnitType,
} from "@lightsparkdev/core";
import {
  CurrencyUnit,
  formatCurrencyStr,
  isCurrencyMap,
  mapCurrencyAmount,
} from "@lightsparkdev/core";
import { Icon } from "./Icon.js";

type CurrencyAmountProps = {
  amount: CurrencyAmountArg | CurrencyMap;
  displayUnit?: CurrencyUnitType;
  shortNumber?: boolean;
  showUnits?: boolean;
  ml?: number;
  includeEstimatedIndicator?: boolean;
  showSubSatDigits?: boolean;
};

export function CurrencyAmount({
  amount,
  displayUnit = CurrencyUnit.SATOSHI,
  shortNumber = false,
  showUnits = false,
  includeEstimatedIndicator = false,
  /* Product has voted to hide msats from end users.
     showSubSatDigits should only be used in ops tools: */
  showSubSatDigits = false,
  ml = 0,
}: CurrencyAmountProps) {
  const unit = displayUnit;

  const amountMap = isCurrencyMap(amount) ? amount : mapCurrencyAmount(amount);
  const value = amountMap[unit];
  const defaultFormattedNumber = amountMap.formatted[unit];

  /* There are just a few ways that CurrencyAmounts need to be formatted
     throughout the UI. In general the default should always be used: */
  let formattedNumber = defaultFormattedNumber;
  if (shortNumber) {
    formattedNumber = formatCurrencyStr(
      { value: Number(value), unit },
      1,
      true,
    );
  } else if (showSubSatDigits) {
    formattedNumber = formatCurrencyStr(
      { value: Number(value), unit: CurrencyUnit.SATOSHI },
      3,
    );
  }

  if (showUnits) {
    formattedNumber += ` ${shorttext(unit, value)}`;
  }

  return (
    <StyledCurrencyAmount ml={ml}>
      {includeEstimatedIndicator && "Est. "}
      <CurrencyIcon unit={unit} />
      {formattedNumber}
    </StyledCurrencyAmount>
  );
}

export const CurrencyIcon = ({ unit }: { unit: CurrencyUnitType }) => {
  switch (unit) {
    case CurrencyUnit.BITCOIN:
      return <Icon name="BitcoinB" width={8} verticalAlign={-2} mr={2} />;
    case CurrencyUnit.SATOSHI:
      return <Icon name="Satoshi" width={8} verticalAlign={-2} mr={2} />;
    default:
      return null;
  }
};

const shorttext = (unit: CurrencyUnitType, value: number) => {
  const pl = value !== 1;
  switch (unit) {
    case CurrencyUnit.BITCOIN:
      return "BTC";
    case CurrencyUnit.MILLIBITCOIN:
      return "mBTC";
    case CurrencyUnit.MICROBITCOIN:
      return "μBTC";
    case CurrencyUnit.SATOSHI:
      return `sat${pl ? "s" : ""}`;
    case CurrencyUnit.MILLISATOSHI:
      return `msat${pl ? "s" : ""}`;
    default:
      return unit;
  }
};

const StyledCurrencyAmount = styled.span<{ ml: number }>`
  color: inherit !important;
  white-space: nowrap;
  font-feature-settings:
    "tnum" on,
    "lnum" on;
  margin-left: ${({ ml }) => ml}px;
`;

CurrencyAmount.fragments = {
  amount: gql`
    fragment CurrencyAmount_amount on CurrencyAmount {
      original_value
      original_unit
      preferred_currency_unit
      preferred_currency_value_rounded
      preferred_currency_value_approx
    }
  `,
};
